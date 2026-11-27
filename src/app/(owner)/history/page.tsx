'use client'

import React from 'react'
import Link from 'next/link'
import { useBookings } from '@/hooks/useBookingQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { Booking } from '@/types'

const PAGE_SIZE = 10

// Badge trạng thái thanh toán tạm ẩn: chưa endpoint nào ghi `paymentStatus`, nên đơn đã xong
// vẫn luôn là UNPAID và badge chỉ hiện "Chưa thanh toán" mãi. Thêm lại khi có module Payment.

export default function HistoryPage() {
  const [page, setPage] = React.useState(1)

  // Lịch sử = đơn đã hoàn thành. Đơn đang chạy xem ở /bookings.
  const params = React.useMemo(
    () => ({ page, limit: PAGE_SIZE, status: 'COMPLETED' as const }),
    [page]
  )
  const { data: bookingData, isLoading } = useBookings(params)
  const records = bookingData?.data ?? []
  const meta = bookingData?.meta
  const totalPages = meta?.totalPages ?? 1

  const { formatVND } = useFormatters()

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  /** Mốc hoàn thành thật nằm ở actualEndTime của bước CHECK_OUT (xem mục 2.10 PROGRESS.md). */
  const getCompletedDate = (b: Booking) => {
    const checkOut = b.bookingServices.find((s) => s.service.category === 'CHECK_OUT')
    return checkOut?.actualEndTime ?? b.expectedCheckOutDate ?? b.expectedCheckInDate
  }

  const getServiceNames = (b: Booking) =>
    b.bookingServices
      .filter((s) => s.service.category !== 'CHECK_IN' && s.service.category !== 'CHECK_OUT')
      .map((s) => s.service.name)

  const getStaffNames = (b: Booking) => [
    ...new Set(b.bookingServices.map((s) => s.staff?.fullName).filter(Boolean)),
  ]

  const getTotal = (b: Booking) =>
    b.costBreakdown?.totalAmount ?? b.totalAmount ?? b.bookingServices.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Lịch sử Dịch vụ & Hóa đơn
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Các đơn đã hoàn thành cùng chi phí được chốt. Đơn đang thực hiện xem ở{' '}
          <Link href="/bookings" className="font-semibold text-brand-600 hover:text-brand-700">
            Lịch hẹn
          </Link>
          .
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Đang tải lịch sử dịch vụ...</p>
          </div>
        </div>
      )}

      {!isLoading && records.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl">
            🧾
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chưa có lịch sử dịch vụ</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Khi một đơn được cửa hàng hoàn thành, hóa đơn của đơn đó sẽ xuất hiện ở đây.
          </p>
          <Link
            href="/bookings"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-soft transition-all"
          >
            Xem lịch hẹn hiện tại
          </Link>
        </div>
      )}

      {!isLoading && records.length > 0 && (
        <div className="space-y-4">
          {records.map((item) => {
            const staffNames = getStaffNames(item)
            const serviceNames = getServiceNames(item)

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      #{item.id}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5">
                      {item.pet?.name} • {item.bookingType === 'GROOMING' ? 'Grooming' : 'Lưu trú'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hoàn thành: {formatDate(getCompletedDate(item))}
                      {staffNames.length > 0 && <> • Nhân viên: {staffNames.join(', ')}</>}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Tổng hóa đơn</span>
                    <span className="text-xl font-extrabold font-display text-slate-900">
                      {formatVND(getTotal(item))}
                    </span>
                    {!!item.costBreakdown?.roomAmount && (
                      <span className="text-[11px] text-slate-500 block">
                        gồm {formatVND(item.costBreakdown.roomAmount)} tiền phòng
                        {!!item.costBreakdown.stayNights && ` (${item.costBreakdown.stayNights} đêm)`}
                      </span>
                    )}
                  </div>
                </div>

                {serviceNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {serviceNames.map((name) => (
                      <span
                        key={name}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/bookings/${item.id}`}
                    className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
                  >
                    Chi tiết hóa đơn →
                  </Link>
                  <Link
                    href={`/bookings/${item.id}/timeline`}
                    className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
                  >
                    Xem lại Timeline & Ảnh →
                  </Link>
                </div>
              </div>
            )
          })}

          {totalPages > 1 && (
            <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Trang {page} / {totalPages} · Tổng {meta?.total} đơn
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${
                      p === page ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
