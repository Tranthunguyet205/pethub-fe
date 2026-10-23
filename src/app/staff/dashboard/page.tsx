'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function StaffDashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg">
            ✂️
          </div>
          <span className="font-bold text-slate-900 text-lg">
            Pet<span className="text-indigo-600">Hub</span> Staff Hub
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/profile" className="text-slate-600 hover:text-indigo-700">
            Hồ sơ ({user?.fullName || 'Nhân viên'})
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
            Khu vực làm việc Kỹ thuật viên & Bác sĩ thú y
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhận ca chăm sóc, cập nhật timeline dịch vụ theo thời gian thực (check-in, đang tắm,
            sấy lông, hoàn thành) và đính kèm hình ảnh trước/sau khi grooming.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <div className="text-2xl mb-1">📋</div>
              <div className="font-bold text-xs text-indigo-950">Lịch ca hôm nay</div>
              <div className="text-[11px] text-indigo-700 mt-1">Đang kết nối API Ca trực</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-2xl mb-1">📸</div>
              <div className="font-bold text-xs text-emerald-950">Cập nhật Timeline</div>
              <div className="text-[11px] text-emerald-700 mt-1">Tải ảnh thú cưng theo ca</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-bold text-xs text-purple-950">Đánh giá dịch vụ</div>
              <div className="text-[11px] text-purple-700 mt-1">Xem phản hồi từ chủ nuôi</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
