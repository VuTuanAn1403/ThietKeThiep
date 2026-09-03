import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NHÀ CÓ TIỆC — API Documentation',
    version: '1.0.0',
    description:
      'REST API cho nền tảng thiệp mời online NHÀ CÓ TIỆC. Hỗ trợ quản lý thiệp mời, khách mời, RSVP, lời chúc, quà tặng, chữ ký lưu bút, tài khoản và góp ý.',
    contact: {
      name: 'NHÀ CÓ TIỆC Support',
      email: 'support@nhacotiec.vn',
    },
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase JWT token hoặc session cookie',
      },
    },
    schemas: {
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          full_name: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          avatar_url: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Invitation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          event_date: { type: 'string', format: 'date' },
          venue_name: { type: 'string' },
          venue_address: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Guest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          invitation_id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          group_name: { type: 'string' },
          max_guests: { type: 'integer' },
        },
      },
      RSVP: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          guest_id: { type: 'string' },
          attendance: { type: 'string', enum: ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'] },
          guest_count: { type: 'integer' },
          note: { type: 'string', nullable: true },
          submitted_at: { type: 'string', format: 'date-time' },
        },
      },
      Wish: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          invitation_id: { type: 'string' },
          guest_name: { type: 'string' },
          message: { type: 'string' },
          is_visible: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Gift: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          invitation_id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          bank_name: { type: 'string' },
          account_name: { type: 'string' },
          account_number: { type: 'string' },
          qr_image_url: { type: 'string', nullable: true },
          is_visible: { type: 'boolean' },
        },
      },
      Signature: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          invitation_id: { type: 'string' },
          guest_name: { type: 'string' },
          message: { type: 'string' },
          signature_image_url: { type: 'string', nullable: true },
          is_visible: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          type: { type: 'string', enum: ['BUG', 'FEATURE', 'UI_UX', 'OTHER'] },
          title: { type: 'string' },
          content: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          status: { type: 'string', enum: ['NEW', 'REVIEWING', 'RESOLVED', 'CLOSED'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'Đăng nhập, đăng ký, đăng xuất' },
    { name: 'Users', description: 'Quản lý tài khoản cá nhân' },
    { name: 'Invitations', description: 'Quản lý thiệp mời' },
    { name: 'Guests', description: 'Quản lý danh sách khách mời' },
    { name: 'RSVP', description: 'Xác nhận tham dự' },
    { name: 'Wishes', description: 'Lời chúc khách mời' },
    { name: 'Gifts', description: 'Cấu hình quà tặng / chuyển khoản' },
    { name: 'Signatures', description: 'Chữ ký & sổ lưu bút khách mời' },
    { name: 'Feedback', description: 'Góp ý & đánh giá' },
    { name: 'Admin', description: 'Quản trị hệ thống (yêu cầu role ADMIN)' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Đăng nhập User',
        description: 'Xác thực tài khoản người dùng bằng email và mật khẩu. Public API.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'minh.anh@gmail.com' },
                  password: { type: 'string', example: '********' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Đăng nhập thành công', content: { 'application/json': { schema: { type: 'object', properties: { user: { '$ref': '#/components/schemas/UserProfile' }, message: { type: 'string' } } } } } },
          '401': { description: 'Sai email hoặc mật khẩu', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '422': { description: 'Thiếu thông tin bắt buộc' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Đăng ký tài khoản mới',
        description: 'Tạo tài khoản người dùng mới trên hệ thống. Public API.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Đăng ký thành công' },
          '400': { description: 'Email đã tồn tại' },
          '422': { description: 'Thiếu thông tin bắt buộc' },
        },
      },
    },
    '/auth/admin/login': {
      post: {
        tags: ['Authentication', 'Admin'],
        summary: 'Đăng nhập Admin',
        description: 'Xác thực tài khoản quản trị viên. Trả về 403 nếu role không phải ADMIN.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Đăng nhập Admin thành công' },
          '401': { description: 'Sai thông tin' },
          '403': { description: 'Tài khoản không có quyền Admin' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Đăng xuất',
        description: 'Hủy phiên đăng nhập hiện tại.',
        responses: { '200': { description: 'Đăng xuất thành công' } },
      },
    },
    '/me': {
      get: {
        tags: ['Users'],
        summary: 'Xem thông tin tài khoản',
        description: 'Trả về thông tin profile của user đang đăng nhập. Protected User.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Thành công', content: { 'application/json': { schema: { type: 'object', properties: { user: { '$ref': '#/components/schemas/UserProfile' } } } } } },
          '401': { description: 'Chưa đăng nhập' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Cập nhật thông tin tài khoản',
        description: 'Cập nhật tên, số điện thoại, avatar. Protected User.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Cập nhật thành công' },
          '401': { description: 'Chưa đăng nhập' },
        },
      },
    },
    '/invitations': {
      get: {
        tags: ['Invitations'],
        summary: 'Danh sách thiệp của tôi',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Danh sách thiệp', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { '$ref': '#/components/schemas/Invitation' } } } } } } } },
      },
      post: {
        tags: ['Invitations'],
        summary: 'Tạo thiệp mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'slug', 'templateId', 'categoryId', 'eventDate', 'venueName'],
                properties: {
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  templateId: { type: 'string' },
                  categoryId: { type: 'string' },
                  eventDate: { type: 'string', format: 'date' },
                  venueName: { type: 'string' },
                  venueAddress: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Tạo thành công' },
          '422': { description: 'Dữ liệu không hợp lệ' },
        },
      },
    },
    '/invitations/{id}': {
      get: {
        tags: ['Invitations'],
        summary: 'Chi tiết thiệp theo ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Chi tiết thiệp' }, '404': { description: 'Không tìm thấy' } },
      },
      patch: {
        tags: ['Invitations'],
        summary: 'Cập nhật thiệp',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
      delete: {
        tags: ['Invitations'],
        summary: 'Xóa thiệp',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Đã xóa' } },
      },
    },
    '/invitations/{id}/guests': {
      get: {
        tags: ['Guests'],
        summary: 'Danh sách khách mời của thiệp',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Danh sách khách' } },
      },
      post: {
        tags: ['Guests'],
        summary: 'Thêm khách mời',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'groupName'],
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  groupName: { type: 'string' },
                  maxGuests: { type: 'integer', default: 1 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Thêm thành công' } },
      },
    },
    '/invitations/{id}/rsvps': {
      post: {
        tags: ['RSVP'],
        summary: 'Gửi phản hồi tham dự',
        description: 'Public API — khách mời gửi xác nhận tham dự.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['guestId', 'attendance'],
                properties: {
                  guestId: { type: 'string' },
                  attendance: { type: 'string', enum: ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'] },
                  guestCount: { type: 'integer', minimum: 0 },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Phản hồi thành công' }, '422': { description: 'Dữ liệu không hợp lệ' } },
      },
    },
    '/invitations/{id}/wishes': {
      get: {
        tags: ['Wishes'],
        summary: 'Danh sách lời chúc hiển thị',
        description: 'Public API — trả về lời chúc is_visible = true.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Danh sách lời chúc' } },
      },
      post: {
        tags: ['Wishes'],
        summary: 'Gửi lời chúc',
        description: 'Public API — khách mời gửi lời chúc.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['guestName', 'message'],
                properties: {
                  guestName: { type: 'string' },
                  message: { type: 'string' },
                  guestId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Gửi thành công' } },
      },
    },
    '/invitations/{id}/gifts': {
      get: {
        tags: ['Gifts'],
        summary: 'Xem thông tin quà tặng của thiệp',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Thông tin quà tặng' } },
      },
      post: {
        tags: ['Gifts'],
        summary: 'Cập nhật cấu hình quà tặng',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bankName', 'accountName', 'accountNumber'],
                properties: {
                  title: { type: 'string', default: 'Quà Mừng Chúc Phúc' },
                  description: { type: 'string' },
                  bankName: { type: 'string', example: 'Vietcombank (VCB)' },
                  accountName: { type: 'string', example: 'NGUYEN VAN A' },
                  accountNumber: { type: 'string', example: '012345678910' },
                  qrImageUrl: { type: 'string' },
                  isVisible: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/invitations/{id}/signatures': {
      get: {
        tags: ['Signatures'],
        summary: 'Danh sách lưu bút hiển thị',
        description: 'Public API — trả về chữ ký/lưu bút is_visible = true.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Danh sách chữ ký' } },
      },
      post: {
        tags: ['Signatures'],
        summary: 'Gửi chữ ký / lưu bút',
        description: 'Public API — khách mời ký tên và gửi lời nhắn.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['guestName', 'message'],
                properties: {
                  guestName: { type: 'string' },
                  message: { type: 'string' },
                  signatureImageUrl: { type: 'string', nullable: true },
                  guestId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Gửi thành công' } },
      },
    },
    '/feedback': {
      get: {
        tags: ['Feedback'],
        summary: 'Danh sách góp ý',
        description: 'User xem góp ý của mình, Admin xem tất cả. Protected User/Admin.',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Danh sách feedback' }, '401': { description: 'Chưa đăng nhập' } },
      },
      post: {
        tags: ['Feedback'],
        summary: 'Gửi góp ý mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'title', 'content', 'rating'],
                properties: {
                  type: { type: 'string', enum: ['BUG', 'FEATURE', 'UI_UX', 'OTHER'] },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Gửi thành công' }, '401': { description: 'Chưa đăng nhập' } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
