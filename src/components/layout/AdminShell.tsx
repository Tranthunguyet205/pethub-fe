'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const menuItems = [
  { label: 'Tổng quan', route: '/admin/dashboard', icon: 'fa-solid fa-chart-line' },
  { label: 'Lịch hẹn (Bookings)', route: '/admin/bookings', icon: 'fa-solid fa-calendar-check' },
  { label: 'Dịch vụ & Bảng giá', route: '/admin/services', icon: 'fa-solid fa-scissors' },
  { label: 'Thú cưng (Pets)', route: '/admin/pets', icon: 'fa-solid fa-paw' },
  { label: 'Toàn bộ người dùng', route: '/admin/users', icon: 'fa-solid fa-users' },
  { label: 'Nhân viên (Staff)', route: '/admin/staff', icon: 'fa-solid fa-user-nurse' },
  { label: 'Phòng lưu trú (Rooms)', route: '/admin/boarding-rooms', icon: 'fa-solid fa-house' },
  { label: 'Hóa đơn & Doanh thu', route: '/admin/invoices', icon: 'fa-solid fa-money-bill-wave' },
  { label: 'Đánh giá (Reviews)', route: '/admin/reviews', icon: 'fa-solid fa-star' },
  { label: 'Báo cáo', route: '/admin/reports', icon: 'fa-solid fa-chart-pie' },
]

/**
 * Nav tách riêng vì usePathname() là dynamic hook — với cacheComponents của
 * Next 16, phần đọc giá trị động phải nằm trong Suspense boundary, nếu không
 * build sẽ fail khi prerender (CLIENT_HOOK_DYNAMIC).
 */
function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.route)
        return (
          <Link
            key={item.route}
            href={item.route}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <i className={`${item.icon} w-4 text-center`} />
              <span>{item.label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 shadow-sm">
          <div>
            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-crown" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">
                  Pet<span className="text-indigo-400">Hub</span>
                </span>
                <span className="block text-[10px] text-indigo-200 bg-indigo-900/50 px-1.5 py-0.2 rounded font-semibold border border-indigo-700 w-max">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <Suspense fallback={<nav className="space-y-1 h-96" />}>
              <AdminNav />
            </Suspense>
          </div>

          {/* User profile & Logout */}
          <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/70 transition-colors group cursor-pointer"
              title="Xem và chỉnh sửa hồ sơ cá nhân"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Admin Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                  {user?.fullName || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@pethub.com'}</p>
              </div>
              <span className="text-slate-500 group-hover:text-white text-xs">›</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header strip */}
          <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Quản trị hệ thống PetHub (RBAC React Next.js)
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <i className="fa-solid fa-users" />
                <span>Quản lý người dùng</span>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto"><Suspense
            fallback={
              <div className="max-w-7xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
                Đang tải...
              </div>
            }
          >
            {children}
          </Suspense></main>
        </div>
      </div>
    </div>
  )
}
