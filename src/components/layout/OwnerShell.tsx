'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBookings } from '@/hooks/useBookingQueries'

/**
 * Layout chung cho mọi trang của chủ nuôi — tương đương pethub-app/app/layouts/owner.vue.
 * Route group (owner) không làm thay đổi URL: /dashboard, /pets, /bookings... giữ nguyên.
 */
const menuItems = [
  { label: 'Tổng quan (Dashboard)', route: '/dashboard', icon: '📊' },
  { label: 'Thú cưng của tôi', route: '/pets', icon: '🐾' },
  { label: 'Đặt lịch chăm sóc', route: '/bookings/new', icon: '📅' },
  { label: 'Lịch hẹn & Tiến trình', route: '/bookings', icon: '📋' },
  { label: 'Lịch sử & Hóa đơn', route: '/history', icon: '🧾' },
  { label: 'Thông báo', route: '/notifications', icon: '🔔' },
  { label: 'Hồ sơ cá nhân', route: '/profile', icon: '👤' },
]

/**
 * Tìm mục menu khớp dài nhất để /bookings/new không làm sáng luôn /bookings.
 * Nav tách riêng vì usePathname() cần nằm trong Suspense với cacheComponents (Next 16).
 */
function OwnerNav() {
  const pathname = usePathname()
  const activeRoute = menuItems
    .filter((item) => pathname === item.route || pathname.startsWith(`${item.route}/`))
    .sort((a, b) => b.route.length - a.route.length)[0]?.route

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = item.route === activeRoute
        return (
          <Link
            key={item.route}
            href={item.route}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200/60 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-4 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

/** Dải trên cùng: lối tắt tới timeline của bé đang được chăm sóc */
function ActiveBookingStrip() {
  const { data } = useBookings({ status: 'IN_PROGRESS', limit: 1 })
  const activeBooking = data?.data?.[0] ?? null

  if (!activeBooking) return null

  return (
    <Link
      href={`/bookings/${activeBooking.id}/timeline`}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
    >
      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
      <span>Theo dõi {activeBooking.pet?.name} đang chăm sóc</span>
    </Link>
  )
}

export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const displayName = user?.fullName || 'Chủ nuôi'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 shadow-xs">
          <div>
            <Link href="/dashboard" className="flex items-center space-x-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm">
                🐾
              </div>
              <div>
                <span className="font-display font-bold text-slate-900 text-lg">
                  Pet<span className="text-brand-600">Hub</span>
                </span>
                <span className="block text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200/60 w-max">
                  Owner Portal
                </span>
              </div>
            </Link>

            <Suspense fallback={<nav className="space-y-1 h-80" />}>
              <OwnerNav />
            </Suspense>
          </div>

          {/* User profile summary & Logout */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
              title="Xem hồ sơ cá nhân"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Owner Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/profile"
                className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                title="Cài đặt & Hồ sơ"
              >
                ⚙️
              </Link>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                🚪
              </button>
            </div>
          </div>
        </aside>

        {/* Main Portal Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
            <div className="text-xs text-slate-500">Cơ sở PetHub Care Center • Hotline: 1900 6868</div>
            <div className="flex items-center gap-3">
              <ActiveBookingStrip />
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
