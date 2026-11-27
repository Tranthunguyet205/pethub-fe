'use client'

import React from 'react'
import Link from 'next/link'
import { useBookings, useCancelBooking } from '@/hooks/useBookingQueries'
import { useFormatters } from '@/hooks/useFormatters'
import StatusBadge from '@/components/common/StatusBadge'
import type { BookingStatus } from '@/types'

const PAGE_SIZE = 10

/** '' = tất cả. Giữ 1:1 với enum của backend để lọc được ở server, không lọc tay trên client. */
const STATUS_TABS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'CHECKED_IN', label: 'Đã tiếp nhận' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'NO_SHOW', label: 'Không đến' },
]

export default function BookingsPage() {
  const [page, setPage] = React.useState(1)
  const [filterStatus, setFilterStatus] = React.useState<BookingStatus | ''>('')

  const params = React.useMemo(
    () => ({ page, limit: PAGE_SIZE, ...(filterStatus ? { status: filterStatus } : {}) }),
    [page, filterStatus]
  )
  const { data: bookingData, isLoading } = useBookings(params)
  const bookings = bookingData?.data ?? []
  const meta = bookingData?.meta
  const totalPages = meta?.totalPages ?? 1

  const selectStatus = (value: BookingStatus | '') => {
    setFilterStatus(value)
    setPage(1)
  }

  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking()
  const [cancellingId, setCancellingId] = React.useState<number | null>(null)
  const [cancelErrorMessage, setCancelErrorMessage] = React.useState('')

  const { formatVND } = useFormatters()

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getServiceNames = (b: (typeof bookings)[0]) => {
    return b.bookingServices
      .filter((s) => s.service.category !== 'CHECK_IN' && s.service.category !== 'CHECK_OUT')
      .map((s) => s.service.name)
  }

  // Tiền phòng chỉ nằm trong costBreakdown — tự cộng bookingServices sẽ thiếu với đơn BOARDING.
  const getTotalPrice = (b: (typeof bookings)[0]) =>
    b.costBreakdown?.totalAmount ?? b.bookingServices.reduce((sum, s) => sum + s.price, 0)

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return
    const cancelReason = prompt('Lý do hủy (không bắt buộc):') ?? undefined
    setCancellingId(id)
    setCancelErrorMessage('')
    try {
      await cancelBooking({ id, cancelReason: cancelReason || undefined })
    } catch (err: any) {
      setCancelErrorMessage(err?.data?.message || err?.message || 'Không thể hủy lịch hẹn!')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Lịch hẹn & Tiến trình Dịch vụ
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Theo dõi trạng thái tiếp nhận, check-in và trực tiếp xem Pet Care Timeline.
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all"
        >
          + Đặt lịch mới
        </Link>
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => selectStatus(tab.value)}
            className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap border transition-all cursor-pointer ${
              filterStatus === tab.value
                ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {cancelErrorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
          {cancelErrorMessage}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Đang tải danh sách lịch hẹn...</p>
          </div>
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl">
            📋
          </div>
          {filterStatus ? (
            <>
              <h3 className="text-lg font-bold text-slate-900">Không có lịch hẹn nào ở trạng thái này</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thử chọn một trạng thái khác, hoặc xem tất cả lịch hẹn của bạn.
              </p>
              <button
                type="button"
                onClick={() => selectStatus('')}
                className="inline-block px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Xem tất cả
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-slate-900">Chưa có lịch hẹn nào</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Bạn chưa đặt lịch dịch vụ nào cho thú cưng. Hãy tạo lịch hẹn đầu tiên ngay!
              </p>
              <Link
                href="/bookings/new"
                className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-soft transition-all"
              >
                + Đặt lịch mới
              </Link>
            </>
          )}
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <img
                    src={b.pet?.avatarUrl ?? ''}
                    alt={b.pet?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{b.id}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">
                      {b.pet?.name} • {b.bookingType === 'GROOMING' ? 'Grooming' : 'Lưu trú'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ngày: <strong className="text-slate-800">{formatDate(b.expectedCheckInDate)}</strong>
                      {b.expectedCheckOutDate && <> → {formatDate(b.expectedCheckOutDate)}</>}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-brand-700">{formatVND(getTotalPrice(b))}</span>
                  <div className="flex items-center gap-2">
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={isCancelling && cancellingId === b.id}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isCancelling && cancellingId === b.id ? 'Đang hủy...' : 'Hủy lịch'}
                      </button>
                    )}
                    <Link
                      href={`/bookings/${b.id}`}
                      className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-all"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>
              </div>

              {getServiceNames(b).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {getServiceNames(b).map((name) => (
                    <span
                      key={name}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

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
