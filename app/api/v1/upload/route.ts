import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

/**
 * Validate binary magic bytes to prevent spoofed file extensions
 */
function isValidMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG magic bytes: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // WebP magic bytes: 'RIFF' .... 'WEBP'
  if (mimeType === 'image/webp') {
    const isRiff =
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46;   // F
    const isWebp =
      buffer[8] === 0x57 && // W
      buffer[9] === 0x45 && // E
      buffer[10] === 0x42 && // B
      buffer[11] === 0x50;   // P
    return isRiff && isWebp;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // 1. Rate Limit Enforcement (10 uploads / 10 min / IP)
  const rateLimitResponse = await enforceRateLimit(request, 'upload');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Không tìm thấy tệp tải lên' },
        { status: 400 }
      );
    }

    const fileName = (file as File).name || 'upload.jpg';
    const fileSize = file.size;
    const fileType = file.type.toLowerCase();

    // 2. File size validation
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'FILE_TOO_LARGE',
          message: `Kích thước tệp vượt quá giới hạn tối đa (5MB). Dung lượng hiện tại: ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // 3. Extension validation
    const extMatch = fileName.toLowerCase().match(/\.[0-9a-z]+$/);
    const extension = extMatch ? extMatch[0] : '';
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          error: 'INVALID_FILE_EXTENSION',
          message: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp',
        },
        { status: 400 }
      );
    }

    // 4. MIME type validation
    if (!ALLOWED_MIME_TYPES.has(fileType)) {
      return NextResponse.json(
        {
          error: 'INVALID_MIME_TYPE',
          message: 'Loại MIME không hợp lệ. Chỉ chấp nhận tệp hình ảnh an toàn',
        },
        { status: 400 }
      );
    }

    // 5. Binary magic bytes inspection
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (!isValidMagicBytes(bytes, fileType)) {
      ErrorMonitoring.captureMessage('Suspicious upload attempt with spoofed magic bytes', 'warning', {
        extra: { fileName, fileType, size: fileSize },
      });
      return NextResponse.json(
        {
          error: 'CORRUPTED_OR_SPOOFED_FILE',
          message: 'Tệp tải lên không khớp định dạng hình ảnh thực tế hoặc bị hỏng',
        },
        { status: 400 }
      );
    }

    // 6. Generate sanitized unique asset identifier
    const sanitizedExt = extension === '.jpeg' ? '.jpg' : extension;
    const uniqueId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${sanitizedExt}`;
    const publicUrl = `/uploads/${uniqueId}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      fileSize,
      mimeType: fileType,
    });
  } catch (error) {
    ErrorMonitoring.captureException(error, {
      route: '/api/v1/upload',
    });
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Đã xảy ra lỗi khi tải tệp lên' },
      { status: 500 }
    );
  }
}
