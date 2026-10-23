'use client'

import React from 'react'
import Link from 'next/link'

export default function PetsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft text-center space-y-3 max-w-lg w-full">
        <div className="text-4xl">🐶</div>
        <h2 className="text-xl font-bold font-display text-slate-900">Danh sách Thú cưng của tôi</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Quản lý hồ sơ chó, mèo, theo dõi cân nặng, ngày sinh, và ghi chú dị ứng chăm sóc.
        </p>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Sẽ tích hợp API Pets (/api/pets/my-pets) ở giai đoạn tiếp theo
          </span>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/dashboard" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            ← Quay lại Owner Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
