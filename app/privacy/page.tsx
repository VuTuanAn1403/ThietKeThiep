import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Heart, ShieldCheck, Lock, Eye, Database, UserCheck, Mail, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật (Privacy Policy) | NHÀ CÓ TIỆC',
  description: 'Chính sách bảo mật thông tin người dùng, dữ liệu thiệp mời, danh sách khách mời và phản hồi RSVP trên nền tảng NHÀ CÓ TIỆC.',
  openGraph: {
    title: 'Chính sách bảo mật thông tin | NHÀ CÓ TIỆC',
    description: 'Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng và khách mời.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d3748] font-sans selection:bg-[#e85d75]/20">
      {/* Header */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-full border border-[#e8dfd8] shadow-sm px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-[#e85d75]">
            <div className="w-9 h-9 rounded-full bg-[#e85d75] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="tracking-tight text-gray-900 font-serif font-bold text-xl">NHÀ CÓ TIỆC</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#e85d75] transition-colors">Trang chủ</Link>
            <Link href="/templates" className="hover:text-[#e85d75] transition-colors">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#e85d75] transition-colors">Case Studies</Link>
            <Link href="/faq" className="hover:text-[#e85d75] transition-colors">FAQ</Link>
            <Link href="/privacy" className="text-[#e85d75] font-semibold">Bảo mật</Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Breadcrumbs items={[{ label: 'Chính sách bảo mật' }]} />

        {/* Title */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Minh Bạch & An Toàn</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Chính sách <span className="text-[#e85d75] italic">bảo mật thông tin</span>
          </h1>
          <p className="text-xs text-gray-500">
            Cập nhật lần cuối: Ngày 03 tháng 09 năm 2026 • Áp dụng cho toàn bộ người dùng và khách mời
          </p>
        </div>

        {/* Privacy Content Card */}
        <div className="bg-white rounded-3xl border border-[#e8dfd8] p-8 sm:p-12 shadow-sm space-y-8 text-sm leading-relaxed text-gray-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <UserCheck className="w-5 h-5 text-[#e85d75]" />
              <h2>1. Thu thập dữ liệu tài khoản</h2>
            </div>
            <p>
              Khi bạn đăng ký tài khoản trên NHÀ CÓ TIỆC, chúng tôi thu thập các thông tin cơ bản: họ tên, địa chỉ email, số điện thoại và mật khẩu mã hóa. Mật khẩu được băm bảo mật bằng thuật toán tiêu chuẩn công nghiệp và không thể đọc được dưới dạng văn bản thô.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <Database className="w-5 h-5 text-blue-600" />
              <h2>2. Dữ liệu thiệp mời & Nội dung sự kiện</h2>
            </div>
            <p>
              Dữ liệu bạn đăng tải lên thiệp cưới (hình ảnh cô dâu chú rể, tên hai bên gia đình, địa chỉ tổ chức, ngày giờ sự kiện, câu chuyện tình yêu, thông tin số tài khoản mừng cưới) thuộc quyền sở hữu hoàn toàn của bạn. Chúng tôi chỉ lưu trữ nhằm mục đích hiển thị thiệp theo yêu cầu cấu hình của bạn.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <Lock className="w-5 h-5 text-emerald-600" />
              <h2>3. Bảo vệ dữ liệu khách mời & Phản hồi RSVP</h2>
            </div>
            <p>
              Danh sách khách mời, số điện thoại, nhóm khách và dữ liệu xác nhận tham dự (RSVP) được cô lập nghiêm ngặt theo từng tài khoản thiệp bằng chính sách Row Level Security (RLS). Khách mời của thiệp này tuyệt đối không thể truy cập, xem hoặc chỉnh sửa dữ liệu của thiệp khác. Chúng tôi cam kết không bán hoặc chia sẻ danh bạ khách mời cho bất kỳ bên thứ ba nào.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <Eye className="w-5 h-5 text-amber-600" />
              <h2>4. Cookies & Lưu trữ cục bộ</h2>
            </div>
            <p>
              Chúng tôi sử dụng cookie phiên làm việc (Session Cookie) an toàn để duy trì trạng thái đăng nhập và phân quyền người dùng (User/Admin). Hệ thống không sử dụng cookie theo dõi hành vi xâm phạm quyền riêng tư của bên thứ ba trái phép.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-serif font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2>5. Quyền của người dùng đối với dữ liệu</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600">
              <li>Quyền xem, chỉnh sửa toàn bộ thông tin thiệp và khách mời trong Dashboard.</li>
              <li>Quyền ẩn hoặc xóa thiệp cưới bất kỳ lúc nào. Khi bạn xóa thiệp, toàn bộ ảnh và dữ liệu RSVP đi kèm sẽ được dọn dẹp khỏi hệ thống.</li>
              <li>Quyền yêu cầu đóng tài khoản hoặc xuất dữ liệu qua trung tâm hỗ trợ.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 bg-[#fdfbf7] rounded-2xl border border-[#e8dfd8]">
            <div className="flex items-center gap-2 text-base font-serif font-bold text-gray-900">
              <Mail className="w-5 h-5 text-[#e85d75]" />
              <h2>6. Liên hệ bộ phận bảo mật</h2>
            </div>
            <p className="text-xs text-gray-600">
              Nếu bạn có bất kỳ câu hỏi hoặc khiếu nại nào liên quan đến quyền riêng tư và dữ liệu cá nhân, vui lòng liên hệ với ban quản trị qua:
            </p>
            <div className="text-xs font-semibold text-gray-800 space-y-1 pt-1">
              <div>• Email: <a href="mailto:privacy@nhacotiec.vn" className="text-[#e85d75] hover:underline">privacy@nhacotiec.vn</a></div>
              <div>• Giờ làm việc: Thứ 2 - Thứ 7, 08:00 - 18:00</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#e8dfd8] text-center text-xs text-gray-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-[#e85d75] text-lg">
            <span>NHÀ CÓ TIỆC</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/templates" className="hover:text-[#e85d75]">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#e85d75]">Case Studies</Link>
            <Link href="/faq" className="hover:text-[#e85d75]">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#e85d75]">Bảo mật</Link>
          </div>
          <p>© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
