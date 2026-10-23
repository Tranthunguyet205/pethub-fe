'use client'

import React from 'react'

export default function AdminBookingsPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">📅</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Quản lý Lịch hẹn (Bookings)</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Khu vực theo dõi lịch đặt dịch vụ, kiểm tra trạng thái phòng và phân công nhân viên chăm sóc.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang hoàn thiện tích hợp API Bookings
        </span>
      </div>
    </div>
  )
}
