'use client'

import React from 'react'

export default function AdminReportsPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">📊</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Báo cáo & Thống kê tài chính</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Biểu đồ doanh thu hàng tuần, báo cáo tăng trưởng khách hàng và phân tích tỷ lệ khách quay lại.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang hoàn thiện tích hợp API Reports
        </span>
      </div>
    </div>
  )
}
