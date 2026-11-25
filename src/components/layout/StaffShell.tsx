'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

/**
 * Layout chung cho mọi trang của nhân viên — tương đương pethub-app/app/layouts/staff.vue.
 * Sidebar dọc nền tối + header ngang hiển thị ca làm việc, giống hệt bên Vue.
 */
const staffMenu = [
  { label: 'Bàn làm việc (Dashboard)', route: '/staff/dashboard', icon: 'fa-solid fa-bolt' },
  { label: 'Lịch phân công hôm nay', route: '/staff/schedule', icon: 'fa-solid fa-calendar-day' },
  { label: 'Ca được phân công', route: '/staff/bookings', icon: 'fa-solid fa-clipboard-list' },
]

/**
 * Nav tách riêng vì usePathname() là dynamic hook — với cacheComponents của
 * Next 16, phần đọc giá trị động phải nằm trong một Suspense boundary, nếu không
 * build sẽ fail khi prerender (CLIENT_HOOK_DYNAMIC).
 */
function StaffNav() {
  const pathname = usePathname()
  return (
    <nav className="space-y-1">
      {staffMenu.map((item) => {
        const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)
        return (
          <Link
            key={item.route}
            href={item.route}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`${item.icon} w-4 text-center`} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function StaffShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const displayName = user?.fullName || 'Nhân viên'

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Staff Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-white p-5 flex flex-col justify-between shrink-0 shadow-lg">
          <div>
            {/* Logo & Role Pill */}
            <Link href="/staff/dashboard" className="flex items-center space-x-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-scissors" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg">
                  Pet<span className="text-indigo-400">Hub</span>
                </span>
                <span className="block text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded font-semibold border border-indigo-700/50 w-max">
                  Staff Operations Hub
                </span>
              </div>
            </Link>

            {/* Nav items */}
            <Suspense fallback={<nav className="space-y-1 h-36" />}>
              <StaffNav />
            </Suspense>
          </div>

          {/* User profile summary & Settings/Logout */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              title="Xem hồ sơ cá nhân"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Staff Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-indigo-400/50 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-indigo-300 truncate">
                  {user?.specialty || 'Chuyên viên nghiệp vụ'}
                </p>
              </div>
            </Link>

            {/* Quick Actions: Settings & Logout */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/profile"
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                title="Cài đặt & Hồ sơ"
              >
                <i className="fa-solid fa-gear" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Khu vực thao tác nghiệp vụ nhân viên chăm sóc
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Ca làm việc:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                08:00 - 17:00 (Sẵn sàng)
              </span>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Suspense
              fallback={
                <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
                  Đang tải...
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
