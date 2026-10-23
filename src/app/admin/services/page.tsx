'use client'

import React from 'react'

export default function AdminServicesPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">✂️</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Dịch vụ & Bảng giá Spa / Grooming</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Thiết lập các gói dịch vụ tắm sấy, cắt tỉa lông, tiêm vắc xin và khách sạn thú cưng.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang hoàn thiện tích hợp API Services
        </span>
      </div>
    </div>
  )
}
