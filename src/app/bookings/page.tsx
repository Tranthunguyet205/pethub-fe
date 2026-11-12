'use client'

import React from 'react'
import Link from 'next/link'
import { useBookings, useDeleteBooking } from '@/hooks/useBookingQueries'
import { useFormatters } from '@/hooks/useFormatters'
import StatusBadge from '@/components/common/StatusBadge'

export default function BookingsPage() {
  const { data: bookingData, isLoading } = useBookings()
  const bookings = bookingData?.data ?? []

  const { mutateAsync: deleteBooking, isPending: isDeleting } = useDeleteBooking()
  const [deletingId, setDeletingId] = React.useState<number | null>(null)

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

  const getTotalPrice = (b: (typeof bookings)[0]) => {
    return b.bookingServices.reduce((sum, s) => sum + s.price, 0)
  }

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return
    setDeletingId(id)
    try {
      await deleteBooking(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
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
                        disabled={isDeleting && deletingId === b.id}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting && deletingId === b.id ? 'Đang hủy...' : 'Hủy lịch'}
                      </button>
                    )}
                    <Link
                      href={`/bookings/${b.id}/timeline`}
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
        </div>
      )}
    </div>
  )
}
