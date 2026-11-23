'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useBookings } from '@/hooks/useBookingQueries'
import { useAuth } from '@/context/AuthContext'
import { useFormatters } from '@/hooks/useFormatters'
import type { Booking, BookingStatus, GetAllBookingParams } from '@/types'

const statusOptions: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'CONFIRMED', label: 'Chờ tiếp nhận' },
  { value: 'CHECKED_IN', label: 'Đã tiếp nhận' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
]

export default function StaffBookingsPage() {
  const { user } = useAuth()
  const { getStatusBadge } = useFormatters()

  /** ID nhân viên đang đăng nhập — chỉ lấy ca được phân công cho mình */
  const staffId = user?.id === undefined || user?.id === null ? undefined : Number(user.id)

  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('')
  const [page, setPage] = useState(1)
  const limit = 20

  const queryParams = useMemo<GetAllBookingParams>(
    () => ({ page, limit, staffId, status: filterStatus || undefined }),
    [page, staffId, filterStatus],
  )

  const { data: response, isLoading } = useBookings(queryParams)
  const bookings = useMemo(() => response?.data ?? [], [response])
  const meta = response?.meta
  const totalPages = meta?.totalPages ?? 1

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
  }

  /** Tên các dịch vụ khách chọn, bỏ hai bước hệ thống */
  const serviceNames = (b: Booking) =>
    b.bookingServices
      .filter((bs) => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT')
      .map((bs) => bs.service.name)
      .join(', ') || 'Chưa có dịch vụ'

  /** Tiến độ các bước mà ca này đã hoàn thành */
  const stepProgress = (b: Booking) => {
    const steps = b.bookingServices.filter(
      (bs) => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT',
    )
    return `${steps.filter((bs) => bs.status === 'COMPLETED').length}/${steps.length}`
  }

  const actionLabel = (status: BookingStatus) => {
    if (status === 'CONFIRMED') return 'Tiếp nhận'
    if (status === 'CHECKED_IN') return 'Bắt đầu'
    if (status === 'IN_PROGRESS') return 'Tiếp tục'
    return 'Xem'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Ca được phân công cho tôi
          </h1>
          <p className="text-xs text-slate-500">
            Chỉ hiện những đơn có ít nhất một bước dịch vụ được giao cho{' '}
            <strong>{user?.fullName || 'bạn'}</strong>.
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as BookingStatus | '')
            setPage(1)
          }}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">Đang tải danh sách ca...</div>
        ) : !bookings.length ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-3xl">📋</div>
            <p className="text-sm font-bold text-slate-800">Chưa có ca nào được phân công cho bạn</p>
            <p className="text-xs text-slate-500">
              Quản trị viên phân công nhân viên cho từng bước dịch vụ ở trang quản lý đơn đặt lịch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Thú cưng</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Giờ hẹn</th>
                  <th className="py-3 px-4">Dịch vụ</th>
                  <th className="py-3 px-4">Tiến độ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const badge = getStatusBadge(b.status)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{b.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {b.pet?.name}
                        <span className="block text-[10px] font-normal text-slate-400">{b.pet?.breed}</span>
                      </td>
                      <td className="py-3.5 px-4">{b.user?.fullName}</td>
                      <td className="py-3.5 px-4 font-mono">{formatDateTime(b.expectedCheckInDate)}</td>
                      <td className="py-3.5 px-4 max-w-56">{serviceNames(b)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{stepProgress(b)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/staff/care/${b.id}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold border border-indigo-200 whitespace-nowrap"
                        >
                          {actionLabel(b.status)} →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Trang {meta?.page} / {totalPages} • {meta?.total} ca
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
