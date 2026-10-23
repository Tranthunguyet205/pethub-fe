'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function OwnerDashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg">
            🐾
          </div>
          <span className="font-bold text-slate-900 text-lg">
            Pet<span className="text-emerald-600">Hub</span> Owner Portal
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/profile" className="text-slate-600 hover:text-emerald-700">
            Hồ sơ cá nhân ({user?.fullName || 'Chủ nuôi'})
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-900">
            Chào mừng {user?.fullName || 'bạn'} đến với PetHub!
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Khu vực dành cho chủ nuôi: theo dõi lịch sử tiêm phòng, đặt lịch spa / grooming, và
            cập nhật timeline chăm sóc thú cưng trực tiếp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-2xl mb-1">🐶</div>
              <div className="font-bold text-xs text-emerald-950">Thú cưng của tôi</div>
              <div className="text-[11px] text-emerald-700 mt-1">Đang kết nối API Pet List</div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <div className="text-2xl mb-1">📅</div>
              <div className="font-bold text-xs text-indigo-950">Đặt lịch chăm sóc</div>
              <div className="text-[11px] text-indigo-700 mt-1">Chọn gói dịch vụ & giờ hẹn</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
              <div className="text-2xl mb-1">🧾</div>
              <div className="font-bold text-xs text-purple-950">Lịch sử hóa đơn</div>
              <div className="text-[11px] text-purple-700 mt-1">Xem chi tiết thanh toán</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
