'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl: string
}

const featuredServices: ServiceItem[] = [
  {
    id: 'srv_bath',
    name: 'Bath & Blow Dry (Tắm Sấy)',
    description:
      'Quy trình tắm 3 bước với dầu gội hữu cơ cao cấp, vắt tuyến hôi, sấy khô chải xù và dưỡng mượt lông.',
    price: 150000,
    durationMinutes: 60,
    imageUrl:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'srv_full_grooming',
    name: 'Full Grooming (Cắt Tỉa Toàn Diện)',
    description:
      'Gói chăm sóc cao cấp trọn vẹn: Tắm sấy, cắt tỉa lông tạo kiểu nghệ thuật theo giống loài, cắt dũa móng, vệ sinh tai và răng.',
    price: 350000,
    durationMinutes: 120,
    imageUrl:
      'https://images.unsplash.com/photo-1599140994530-a0fa80d96d39?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'srv_nail_trim',
    name: 'Nail Trim & Grind (Cắt Mài Móng)',
    description:
      'Cắt tỉa móng cẩn thận tránh chạm tủy máu, mài tròn cạnh móng bằng máy êm giảm sắc nhọn.',
    price: 50000,
    durationMinutes: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
  },
]

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Main Navigation Header (from default.vue) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <span className="text-xl">🐾</span>
            </div>
            <div>
              <span className="text-xl font-bold font-display text-slate-900 tracking-tight">
                Pet<span className="text-brand-600">Hub</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                Pet Care Platform
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link href="/" className="text-brand-600 font-semibold transition-colors">
              Trang chủ
            </Link>
            <Link href="/services" className="hover:text-brand-600 transition-colors">
              Dịch vụ & Bảng giá
            </Link>
            <Link
              href="/bookings"
              className="hover:text-brand-600 transition-colors flex items-center gap-1.5 text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
            >
              <span>⭐ Demo Live Timeline</span>
            </Link>
            <Link href="/admin/users" className="hover:text-brand-600 transition-colors">
              Quản lý người dùng
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <span>👤</span>
                  <span>{user?.fullName || user?.email}</span>
                </Link>
                <Link
                  href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-soft hover:shadow-card transition-all"
                >
                  Vào Trang Quản Lý →
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-soft hover:shadow-card transition-all"
                >
                  Vào Trang Quản Lý →
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content (Exact mirror of index.vue) */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 text-brand-800 text-xs font-semibold border border-brand-200">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  <span>Nền tảng quản lý chăm sóc thú cưng hiện đại</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.15]">
                  Yêu thương trọn vẹn, <br />
                  <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
                    Minh bạch từng khoảnh khắc
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  PetHub kết nối chủ nuôi và đội ngũ chăm sóc thông qua <strong>Pet Care Timeline</strong>. Không còn nỗi lo lắng khi gửi thú cưng — theo dõi trực tiếp từ lúc Check-in, tắm sấy, cắt tỉa đến khi hoàn thành cùng báo cáo hình ảnh chân thực.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/bookings"
                    className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-card hover:shadow-glow transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>🐾 Đặt lịch chăm sóc ngay</span>
                  </Link>

                  <Link
                    href="/bookings"
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-soft hover:border-brand-300 transition-all flex items-center gap-2"
                  >
                    <span>⭐ Xem demo Pet Care Timeline</span>
                  </Link>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                  <div>
                    <div className="text-2xl font-bold font-display text-slate-900">100%</div>
                    <div className="text-xs text-slate-500 font-medium">Báo cáo ảnh thực tế</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-display text-slate-900">0</div>
                    <div className="text-xs text-slate-500 font-medium">Xung đột lịch hẹn</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-display text-slate-900">4.9 ★</div>
                    <div className="text-xs text-slate-500 font-medium">Mức độ hài lòng</div>
                  </div>
                </div>
              </div>

              {/* Hero Graphic / Timeline Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-72 h-72 bg-brand-200/50 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80"
                          alt="Milo"
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Milo (Golden Retriever)</h3>
                          <p className="text-xs text-slate-500">Full Grooming • NV: Nguyễn An</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 animate-pulse">
                        Đang chăm sóc
                      </span>
                    </div>

                    {/* Mini Timeline Items */}
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        <span className="font-mono text-slate-500 font-bold">09:58</span>
                        <span className="text-slate-700 font-medium">Check-in tiếp nhận thành công</span>
                        <span className="ml-auto text-emerald-600 font-bold">✓</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        <span className="font-mono text-slate-500 font-bold">10:15</span>
                        <span className="text-slate-700 font-medium">Tắm sạch & dưỡng ẩm thảo dược</span>
                        <span className="ml-auto text-emerald-600 font-bold">✓</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-amber-50 border border-amber-200/80">
                        <span className="font-mono text-amber-700 font-bold">11:15</span>
                        <span className="text-amber-900 font-bold">Đang cắt tỉa lông tạo kiểu form gấu</span>
                        <span className="ml-auto text-amber-600 font-bold">⚡</span>
                      </div>
                    </div>

                    <Link
                      href="/bookings"
                      className="block text-center w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-brand-600 font-bold text-xs transition-colors"
                    >
                      Mở toàn màn hình Pet Care Timeline →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200/60">
                Dịch vụ chuyên nghiệp
              </span>
              <h2 className="text-3xl font-extrabold font-display text-slate-900 mt-2">
                Gói dịch vụ chăm sóc chuẩn Spa
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Quy trình minh bạch, bảng giá niêm yết rõ ràng và nhân viên có chứng chỉ chuyên môn cao.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-slate-50 hover:bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-800 shadow-sm">
                      ⏱ {service.durationMinutes} phút
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Giá dịch vụ</span>
                        <span className="text-lg font-extrabold font-display text-brand-700">
                          {formatVND(service.price)}
                        </span>
                      </div>
                      <Link
                        href="/bookings"
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Đặt ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800"
              >
                <span>Xem tất cả danh mục dịch vụ & giá add-on</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Why PetHub Section (Section 2 & 6 from index.vue) */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
                Điểm khác biệt cốt lõi
              </span>
              <h2 className="text-3xl font-extrabold font-display text-slate-900 mt-2">
                Trải nghiệm dịch vụ không còn là &quot;Hộp đen&quot;
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Khác với việc chỉ gửi thú cưng và chờ tin nhắn chung chung, PetHub số hóa toàn bộ quy trình chăm sóc.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center mb-4">
                  📅
                </div>
                <h3 className="font-bold text-base text-slate-900">Chống trùng lịch hẹn</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Hệ thống tự động kiểm tra xung đột thời gian và nhân viên trước khi nhận đặt lịch, bảo đảm không bị quá tải.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 text-2xl flex items-center justify-center mb-4">
                  🩺
                </div>
                <h3 className="font-bold text-base text-slate-900">Check-in tình trạng</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Ghi nhận kỹ tình trạng da lông, cân nặng, tiền sử dị ứng và lưu ý đặc biệt từ chủ nuôi trước khi thao tác.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-card ring-2 ring-brand-100">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 text-2xl flex items-center justify-center mb-4">
                  ⭐
                </div>
                <h3 className="font-bold text-base text-slate-900">Pet Care Timeline</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Mỗi bước tắm, sấy, tỉa móng, cho ăn được ghi nhận thời gian thực cùng hình ảnh báo cáo gửi đến chủ nuôi.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 text-2xl flex items-center justify-center mb-4">
                  🧾
                </div>
                <h3 className="font-bold text-base text-slate-900">Check-out & Đánh giá</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Bàn giao minh bạch với hóa đơn rõ ràng, lưu trữ lịch sử chăm sóc và cho phép đánh giá chất lượng nhân viên.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer (from default.vue) */}
      <footer className="bg-slate-900 text-slate-400 text-sm py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold text-lg">
                <span>🐾 PetHub</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nền tảng quản lý trải nghiệm dịch vụ chăm sóc thú cưng khép kín: Đặt lịch, Check-in, Pet Care Timeline, Báo cáo hình ảnh & Thanh toán.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Dịch vụ chính</h4>
              <ul className="space-y-2 text-xs">
                <li>Grooming Cắt tỉa tạo kiểu</li>
                <li>Tắm gội & Dưỡng lông thảo dược</li>
                <li>Khách sạn thú cưng (Boarding)</li>
                <li>Vệ sinh tai mắt & Cắt mài móng</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Tính năng đặc trưng</h4>
              <ul className="space-y-2 text-xs">
                <li className="text-brand-400 font-medium">⭐ Pet Care Timeline</li>
                <li>Kiểm tra xung đột lịch (Conflict Detection)</li>
                <li>Báo cáo hình ảnh thực tế (Photo Report)</li>
                <li>State Machine quy trình dịch vụ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Đồ án tốt nghiệp</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xây dựng bằng React 19, Next.js 16, TypeScript, TanStack Query và Tailwind CSS.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2026 PetHub Platform. Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin.
          </div>
        </div>
      </footer>
    </div>
  )
}
