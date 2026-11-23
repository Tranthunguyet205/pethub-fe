'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const staffMenu = [
  { label: 'Bàn làm việc', route: '/staff/dashboard' },
  { label: 'Lịch làm việc', route: '/staff/schedule' },
  { label: 'Ca được phân công', route: '/staff/bookings' },
]

/**
 * Nav tách riêng vì usePathname() là dynamic hook — với cacheComponents của
 * Next 16, phần đọc giá trị động phải nằm trong một Suspense boundary, nếu không
 * build sẽ fail khi prerender (CLIENT_HOOK_DYNAMIC).
 */
function StaffNav() {
  const pathname = usePathname()
  return (
    <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
      {staffMenu.map((item) => {
        const active = pathname === item.route || pathname.startsWith(`${item.route}/`)
        return (
          <Link
            key={item.route}
            href={item.route}
            className={`px-3 py-2 rounded-xl transition-colors ${
              active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function StaffShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/staff/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg">
              ✂️
            </div>
            <span className="font-bold text-slate-900 text-lg">
              Pet<span className="text-indigo-600">Hub</span> Staff
            </span>
          </Link>

          <Suspense fallback={<div className="hidden md:block w-80" />}>
            <StaffNav />
          </Suspense>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="hidden sm:block text-right">
            <div className="text-slate-800 font-bold">{user?.fullName || 'Nhân viên'}</div>
            <div className="text-[10px] text-slate-400">{user?.specialty || 'Chuyên viên nghiệp vụ'}</div>
          </div>
          <Link href="/profile" className="text-slate-600 hover:text-indigo-700">
            Hồ sơ
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 w-full">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
              Đang tải...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  )
}
