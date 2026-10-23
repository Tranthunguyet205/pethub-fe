'use client'

import React from 'react'

export default function AdminStaffPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">👨‍⚕️</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Nhân viên & Kỹ thuật viên (Staff)</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Theo dõi ca trực, phân bổ lịch chăm sóc và hiệu suất làm việc của bác sĩ thú y & groomer.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang kết nối danh sách Staff từ API Users
        </span>
      </div>
    </div>
  )
}
