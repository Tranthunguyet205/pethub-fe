'use client'

import React from 'react'

export default function AdminInvoicesPage() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3">
      <div className="text-4xl">💰</div>
      <h2 className="text-xl font-bold font-display text-slate-900">Hóa đơn & Doanh thu (Invoices)</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Theo dõi trạng thái thanh toán, xuất hóa đơn dịch vụ và tích hợp cổng thanh toán.
      </p>
      <div className="pt-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Đang hoàn thiện tích hợp API Invoices
        </span>
      </div>
    </div>
  )
}
