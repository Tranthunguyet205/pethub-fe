'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useBookings } from '@/hooks/useBookingQueries'
import { useAuth } from '@/context/AuthContext'
import { useFormatters } from '@/hooks/useFormatters'
import type { Booking, GetAllBookingParams } from '@/types'

/**
 * Ngày theo giờ máy người dùng (Việt Nam), KHÔNG dùng toISOString()
 * vì nó trả về ngày theo UTC — trước 7h sáng sẽ ra ngày hôm trước.
 */
const localDateString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function StaffSchedulePage() {
  const { user } = useAuth()
  const { getStatusBadge } = useFormatters()

  const staffId = user?.id === undefined || user?.id === null ? undefined : Number(user.id)

  // Khởi tạo sau khi mount: Next 16 (cacheComponents) chặn đọc new Date() lúc prerender
  const [selectedDate, setSelectedDate] = useState('')
  useEffect(() => {
    if (!selectedDate) setSelectedDate(localDateString())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shiftDay = (delta: number) => {
    const d = new Date(`${selectedDate}T12:00:00`)
    d.setDate(d.getDate() + delta)
    setSelectedDate(localDateString(d))
  }

  const [todayStr, setTodayStr] = useState('')
  useEffect(() => setTodayStr(localDateString()), [])
  const isToday = !!selectedDate && selectedDate === todayStr

  // Backend hiểu from/to dạng YYYY-MM-DD là đầu/cuối ngày theo giờ Việt Nam
  const queryParams = useMemo<GetAllBookingParams>(
    () => ({
      staffId,
      from: selectedDate || undefined,
      to: selectedDate || undefined,
      limit: 100,
    }),
    [staffId, selectedDate],
  )

  const { data: response, isLoading } = useBookings(queryParams)

  /** Sắp theo giờ hẹn tăng dần — backend trả theo createdAt desc */
  const bookings = useMemo<Booking[]>(
    () =>
      [...(response?.data ?? [])].sort((a, b) =>
        (a.expectedCheckInDate ?? '').localeCompare(b.expectedCheckInDate ?? ''),
      ),
    [response],
  )

  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const prettyDate = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : ''

  const serviceNames = (b: Booking) =>
    b.bookingServices
      .filter((bs) => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT')
      .map((bs) => bs.service.name)
      .join(', ') || 'Chưa có dịch vụ'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Lịch làm việc</h1>
          <p className="text-xs text-slate-500">
            Khung giờ phục vụ 08:00 – 17:00 • Nhân viên: <strong>{user?.fullName || '—'}</strong>
            {user?.specialty ? ` • ${user.specialty}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDay(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ‹
          </button>
          <input
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            type="date"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
          />
          <button
            onClick={() => shiftDay(1)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ›
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs cursor-pointer"
            >
              Hôm nay
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 capitalize">{prettyDate}</span>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
          {bookings.length} ca
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">Đang tải lịch làm việc...</div>
        ) : !bookings.length ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-3xl">🗓️</div>
            <p className="text-sm font-bold text-slate-800">Không có ca nào trong ngày này</p>
            <p className="text-xs text-slate-500">
              Chọn ngày khác, hoặc kiểm tra lại việc phân công ở trang quản lý đơn đặt lịch.
            </p>
          </div>
        ) : (
          bookings.map((b) => {
            const badge = getStatusBadge(b.status)
            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 text-center font-mono font-bold text-sm bg-indigo-50 text-indigo-800 py-2 rounded-xl border border-indigo-200">
                    {formatTime(b.expectedCheckInDate)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        Bé {b.pet?.name}
                        {b.pet?.breed && <span className="font-normal text-slate-500"> ({b.pet.breed})</span>}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                      {b.bookingType === 'BOARDING' && (
                        <span className="px-2 py-0.5 rounded-lg bg-violet-100 text-violet-700 text-[10px] font-bold">
                          Lưu trú
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {serviceNames(b)} • Chủ nuôi: {b.user?.fullName}
                    </p>
                    {b.pet?.allergyNotes && (
                      <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                        Dị ứng: {b.pet.allergyNotes}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/staff/care/${b.id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs whitespace-nowrap"
                >
                  Xử lý ca →
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
