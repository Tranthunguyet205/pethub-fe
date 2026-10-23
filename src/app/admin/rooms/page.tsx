'use client'

import React from 'react'

export default function AdminRoomsPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">🏠</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Phòng & Chuồng lưu trú (Rooms)</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Quản lý tình trạng phòng Standard, VIP, kiểm tra nhiệt độ và lịch dọn phòng nội trú.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang hoàn thiện tích hợp API Rooms
        </span>
      </div>
    </div>
  )
}
