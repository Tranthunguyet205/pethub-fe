'use client'

import React from 'react'
import Link from 'next/link'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3 max-w-lg w-full">
        <div className="text-4xl">🔔</div>
        <h2 className="text-xl font-bold font-display text-slate-900">Thông báo hệ thống</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Nhận nhắc nhở lịch hẹn sắp tới, cảnh báo tiêm phòng định kỳ và ưu đãi mới nhất.
        </p>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Sẽ tích hợp API Notifications
          </span>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/dashboard" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
