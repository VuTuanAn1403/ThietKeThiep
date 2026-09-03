import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { JsonLd } from '@/components/JsonLd';
import { AuthProvider } from '@/lib/auth/auth-context';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhacotiec.vn';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NHÀ CÓ TIỆC — Nền tảng thiết kế & quản lý thiệp online cao cấp',
    template: '%s | NHÀ CÓ TIỆC',
  },
  description: 'Nền tảng tạo thiệp cưới, sinh nhật, sự kiện online thông minh. Cá nhân hóa từng khách mời, xác nhận tham dự (RSVP) tức thì, mã QR Code sắc nét và tiết kiệm 80% chi phí.',
  keywords: [
    'thiệp cưới online',
    'thiệp mời online',
    'tạo thiệp online',
    'rsvp online',
    'nhà có tiệc',
    'thiết kế thiệp cưới',
    'thiệp sinh nhật online',
    'thiệp tân gia online',
  ],
  authors: [{ name: 'Đội ngũ Nhà Có Tiệc', url: siteUrl }],
  creator: 'NHÀ CÓ TIỆC',
  publisher: 'NHÀ CÓ TIỆC',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NHÀ CÓ TIỆC — Nền tảng thiết kế & quản lý thiệp online',
    description: 'Mỗi bữa tiệc là một câu chuyện đáng nhớ. Tạo thiệp cưới, sinh nhật, tân gia cá nhân hóa sang trọng và tiện lợi.',
    url: siteUrl,
    siteName: 'NHÀ CÓ TIỆC',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NHÀ CÓ TIỆC — Nền tảng thiết kế thiệp online',
    description: 'Tạo thiệp cưới, sự kiện online thông minh với RSVP & QR code cá nhân hóa.',
    creator: '@nhacotiec',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className="antialiased font-sans bg-[#FFFDFB] text-[#1F1B1C] min-h-screen selection:bg-[#E85B6A]/15 selection:text-[#E85B6A]">
        <AuthProvider>
          <GoogleAnalytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
