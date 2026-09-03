import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'NHÀ CÓ TIỆC — Nền tảng thiết kế & quản lý thiệp online cao cấp';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fdfbf7 0%, #faede8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(232, 93, 117, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'rgba(232, 93, 117, 0.08)',
          }}
        />

        {/* Content Box */}
        <div
          style={{
            background: 'white',
            borderRadius: '40px',
            border: '2px solid #e8dfd8',
            padding: '48px 64px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            maxWidth: '1000px',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#e85d75',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
              }}
            >
              ❤️
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1a202c',
                letterSpacing: '-0.5px',
              }}
            >
              NHÀ CÓ TIỆC
            </span>
          </div>

          <h1
            style={{
              fontSize: '46px',
              fontWeight: 'bold',
              color: '#2d3748',
              lineHeight: '1.2',
              margin: '0 0 16px 0',
            }}
          >
            Nền Tảng Thiệp Mời Online Thông Minh
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#718096',
              margin: '0 0 28px 0',
              fontFamily: 'sans-serif',
            }}
          >
            Đám Cưới • Sinh Nhật • Tân Gia • Thôi Nôi • Kỷ Niệm
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '16px',
              color: '#e85d75',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
            }}
          >
            <span>✨ Cá nhân hóa từng khách mời</span>
            <span>•</span>
            <span>📱 Xác nhận RSVP tức thì</span>
            <span>•</span>
            <span>⚡ Tiết kiệm 80% chi phí</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
