'use client'

import React from 'react'
import { useFormatters } from '@/hooks/useFormatters'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/admin/invoices.vue
const invoices = [
  { id: 'inv_1', code: 'INV-2026-001', customer: 'Trần Minh Tuấn', pet: 'Milo', total: 350000, method: 'CASH', status: 'PENDING', date: '18/09/2026' },
  { id: 'inv_2', code: 'INV-2026-002', customer: 'Trần Minh Tuấn', pet: 'Luna', total: 150000, method: 'BANK_TRANSFER', status: 'PAID', date: '18/09/2026' },
  { id: 'inv_3', code: 'INV-2026-003', customer: 'Nguyễn Bích Ngọc', pet: 'Coco', total: 150000, method: 'ONLINE', status: 'PAID', date: '15/09/2026' },
]

export default function AdminInvoicesPage() {
  const { formatVND } = useFormatters()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Quản lý Hóa đơn & Thanh toán (Invoices & Payments)
        </h1>
        <p className="text-xs text-slate-500">Mô phỏng thanh toán tiền mặt, chuyển khoản và cổng online (Section 17).</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Số hóa đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Thú cưng</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.customer}</td>
                  <td className="py-3.5 px-4">{inv.pet}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatVND(inv.total)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{inv.method}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'PAID' ? '✓ Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
                      In hóa đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
