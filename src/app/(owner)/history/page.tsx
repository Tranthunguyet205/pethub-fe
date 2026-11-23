'use client'

import React from 'react'
import Link from 'next/link'
import { useFormatters } from '@/hooks/useFormatters'

// Dữ liệu mô phỏng — giữ đồng bộ với pethub-app/app/pages/history/index.vue
const historyRecords = [
  {
    id: 'bk_103',
    code: 'BK-20260915-09',
    petName: 'Coco (Poodle)',
    serviceName: 'Bath & Blow Dry',
    date: '15/09/2026',
    staff: 'Nguyễn Văn An',
    totalPrice: 150000,
    paymentStatus: 'PAID',
    paymentMethod: 'Chuyển khoản (BANK_TRANSFER)',
    rating: 5,
    comment: 'Bé Coco được sấy rất tơi lông, thơm lâu và nhân viên cực kỳ nhẹ nhàng!',
  },
  {
    id: 'bk_98',
    code: 'BK-20260828-14',
    petName: 'Milo (Golden)',
    serviceName: 'Full Grooming',
    date: '28/08/2026',
    staff: 'Nguyễn Văn An',
    totalPrice: 350000,
    paymentStatus: 'PAID',
    paymentMethod: 'Tiền mặt (CASH)',
    rating: 5,
    comment: 'Tỉa form gấu rất đẹp, Milo không bị sợ sệt khi về nhà.',
  },
]

export default function HistoryPage() {
  const { formatVND } = useFormatters()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Lịch sử Dịch vụ & Hóa đơn (Service History)
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Lưu trữ toàn bộ nhật ký chăm sóc, hóa đơn thanh toán và đánh giá chất lượng (Section 16, 19).
        </p>
      </div>

      <div className="space-y-4">
        {historyRecords.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {item.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Đã thanh toán
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {item.petName} • {item.serviceName}
                </h3>
                <p className="text-xs text-slate-500">
                  Ngày thực hiện: {item.date} • Kỹ thuật viên: {item.staff}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Tổng hóa đơn</span>
                <span className="text-xl font-extrabold font-display text-slate-900">{formatVND(item.totalPrice)}</span>
                <span className="text-[11px] text-slate-500 block">{item.paymentMethod}</span>
              </div>
            </div>

            {/* Rating & Review Section (Section 19) */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                  <span>★★★★★</span>
                  <span className="font-bold text-xs text-amber-900">5.0 / 5.0</span>
                </div>
                <p className="text-xs text-amber-950 mt-1 italic">&quot;{item.comment}&quot;</p>
              </div>

              <Link
                href={`/bookings/${item.id}/timeline`}
                className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 shadow-xs"
              >
                Xem lại Timeline & Ảnh →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
