'use client'

import React from 'react'
import Link from 'next/link'

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3 max-w-lg w-full">
        <div className="text-4xl">📋</div>
        <h2 className="text-xl font-bold font-display text-slate-900">Lịch hẹn & Tiến trình</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Theo dõi trạng thái lịch đặt chăm sóc, check-in và timeline thực hiện của kỹ thuật viên.
        </p>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Sẽ tích hợp API Bookings (/api/bookings) ở giai đoạn tiếp theo
          </span>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/dashboard" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
