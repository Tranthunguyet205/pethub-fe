'use client'

import React from 'react'
import { useFormatters } from '@/hooks/useFormatters'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/admin/reports.vue
const monthlyRevenue = [
  { month: 'Tháng 01', revenue: 25000000, bookings: 110 },
  { month: 'Tháng 02', revenue: 31000000, bookings: 135 },
  { month: 'Tháng 03', revenue: 28000000, bookings: 122 },
  { month: 'Tháng 04', revenue: 35000000, bookings: 154 },
]

export default function AdminReportsPage() {
  const { formatVND } = useFormatters()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Báo cáo Thống kê & Doanh thu (Reports & Analytics)
        </h1>
        <p className="text-xs text-slate-500">Dữ liệu tài chính và chỉ số dịch vụ phục vụ bảo vệ đồ án (Section 33).</p>
      </div>

      {/* Revenue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {monthlyRevenue.map((m) => (
          <div key={m.month} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.month}</span>
            <div className="text-2xl font-extrabold font-display text-slate-900 mt-2">{formatVND(m.revenue)}</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{m.bookings} lượt dịch vụ</p>
          </div>
        ))}
      </div>

      {/* Visual Bar comparison */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-display">Biểu đồ Doanh thu Theo Tháng (Triệu VNĐ)</h3>

        <div className="space-y-3 pt-2">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{m.month}</span>
                <span className="font-mono text-emerald-700">{formatVND(m.revenue)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                  style={{ width: `${(m.revenue / 35000000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
