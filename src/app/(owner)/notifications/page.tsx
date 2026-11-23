'use client'

import React from 'react'

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Thông báo (Notifications)</h1>
        <p className="text-xs text-slate-500">Cập nhật tức thời về lịch hẹn và tiến trình Pet Care Timeline.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">🔔</div>
        <h3 className="font-bold text-slate-700">Chưa có thông báo</h3>
        <p className="text-xs text-slate-500 mt-1">Tính năng thông báo sẽ sớm được kết nối.</p>
      </div>
    </div>
  )
}
