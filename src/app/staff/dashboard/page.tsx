'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useBookings } from '@/hooks/useBookingQueries'
import { useAuth } from '@/context/AuthContext'
import { useFormatters } from '@/hooks/useFormatters'
import type { Booking, GetAllBookingParams } from '@/types'

/** Ngày hôm nay theo giờ máy (VN). Không dùng toISOString() vì nó cho ngày UTC. */
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const { getStatusBadge } = useFormatters()

  const staffId = user?.id === undefined || user?.id === null ? undefined : Number(user.id)

  // Lấy ngày hiện tại sau khi mount. Next 16 (cacheComponents) chặn đọc new Date()
  // trong lúc prerender, nên không thể tính trực tiếp khi render.
  const [today, setToday] = useState('')
  useEffect(() => setToday(todayLocal()), [])

  // Ca của hôm nay — backend hiểu from/to dạng YYYY-MM-DD theo giờ Việt Nam
  const todayParams = useMemo<GetAllBookingParams>(
    () => ({ staffId, from: today || undefined, to: today || undefined, limit: 100 }),
    [staffId, today],
  )

  // Ca đang chăm sóc, KHÔNG giới hạn ngày: đơn lưu trú nhiều ngày có giờ nhận
  // từ hôm trước nhưng vẫn đang chạy, nếu lọc theo hôm nay sẽ bị lọt.
  const activeParams = useMemo<GetAllBookingParams>(
    () => ({ staffId, status: 'IN_PROGRESS', limit: 20 }),
    [staffId],
  )

  const { data: todayResponse, isLoading } = useBookings(todayParams)
  const { data: activeResponse } = useBookings(activeParams)

  const todayBookings = useMemo<Booking[]>(
    () =>
      [...(todayResponse?.data ?? [])].sort((a, b) =>
        (a.expectedCheckInDate ?? '').localeCompare(b.expectedCheckInDate ?? ''),
      ),
    [todayResponse],
  )
  const activeBookings = useMemo<Booking[]>(() => activeResponse?.data ?? [], [activeResponse])

  const stats = useMemo(
    () => ({
      total: todayResponse?.meta?.total ?? todayBookings.length,
      waiting: todayBookings.filter((b) => b.status === 'CONFIRMED').length,
      inProgress: activeBookings.length,
      completed: todayBookings.filter((b) => b.status === 'COMPLETED').length,
    }),
    [todayBookings, activeBookings, todayResponse],
  )

  const activeBooking = activeBookings[0] ?? null

  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'

  const serviceNames = (b: Booking) =>
    b.bookingServices
      .filter((bs) => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT')
      .map((bs) => bs.service.name)
      .join(', ') || 'Chưa có dịch vụ'

  const stepProgress = (b: Booking) => {
    const steps = b.bookingServices.filter(
      (bs) => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT',
    )
    return { done: steps.filter((bs) => bs.status === 'COMPLETED').length, total: steps.length }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
          Bàn làm việc Kỹ thuật viên
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Xin chào <strong>{user?.fullName || 'bạn'}</strong> — ca trực hôm nay, tiếp nhận thú cưng và
          cập nhật tiến trình chăm sóc.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ca hôm nay</div>
          <div className="text-3xl font-extrabold font-display text-slate-900 mt-2">{stats.total}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">Được phân công cho tôi</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ tiếp nhận</div>
          <div className="text-3xl font-extrabold font-display text-amber-600 mt-2">{stats.waiting}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Khách sắp mang bé đến</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang chăm sóc</div>
          <div className="text-3xl font-extrabold font-display text-teal-600 mt-2">{stats.inProgress}</div>
          <div className="text-xs text-teal-600 font-medium mt-1">Đang cập nhật timeline</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Hoàn thành hôm nay
          </div>
          <div className="text-3xl font-extrabold font-display text-emerald-600 mt-2">{stats.completed}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Đã bàn giao</div>
        </div>
      </div>

      {/* Ca đang chăm sóc */}
      {activeBooking ? (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {activeBooking.pet?.avatarUrl ? (
              <img
                src={activeBooking.pet.avatarUrl}
                alt={activeBooking.pet?.name}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-indigo-400"
              />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-indigo-800 border-2 border-indigo-400 flex items-center justify-center text-2xl">
                🐾
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Đang chăm sóc trực tiếp
                </span>
                <span className="text-xs text-slate-300">
                  Nhận lúc {formatTime(activeBooking.expectedCheckInDate)} • Bước{' '}
                  {stepProgress(activeBooking).done}/{stepProgress(activeBooking).total}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display">
                Bé {activeBooking.pet?.name}
                {activeBooking.pet?.breed && (
                  <span className="font-normal text-slate-300"> ({activeBooking.pet.breed})</span>
                )}{' '}
                • {serviceNames(activeBooking)}
              </h2>
              {activeBooking.notes && (
                <p className="text-xs text-amber-200 font-medium">
                  Yêu cầu của chủ nuôi: {activeBooking.notes}
                </p>
              )}
              {activeBooking.pet?.allergyNotes && (
                <p className="text-xs text-rose-300 font-medium">
                  Dị ứng: {activeBooking.pet.allergyNotes}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/staff/care/${activeBooking.id}`}
            className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg whitespace-nowrap"
          >
            Vào phòng chăm sóc →
          </Link>
        </div>
      ) : (
        !isLoading && (
          <div className="bg-white rounded-3xl p-6 border border-dashed border-slate-300 text-center space-y-1">
            <div className="text-2xl">☕</div>
            <p className="text-sm font-bold text-slate-800">Hiện không có ca nào đang chăm sóc</p>
            <p className="text-xs text-slate-500">
              Tiếp nhận một ca ở bảng dưới để bắt đầu cập nhật timeline.
            </p>
          </div>
        )
      )}

      {/* Bảng ca hôm nay */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 font-display">Ca phục vụ hôm nay</h2>
          <Link href="/staff/schedule" className="text-xs font-bold text-indigo-600 hover:underline">
            Xem lịch theo ngày →
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">Đang tải ca trực...</div>
        ) : !todayBookings.length ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-3xl">📋</div>
            <p className="text-sm font-bold text-slate-800">Hôm nay bạn không có ca nào</p>
            <p className="text-xs text-slate-500">
              Ca chỉ hiện ở đây sau khi quản trị viên phân công bạn vào một bước dịch vụ.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Giờ</th>
                  <th className="py-3 px-4">Thú cưng</th>
                  <th className="py-3 px-4">Chủ nuôi</th>
                  <th className="py-3 px-4">Dịch vụ</th>
                  <th className="py-3 px-4">Lưu ý sức khỏe</th>
                  <th className="py-3 px-4">Tiến độ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Nghiệp vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayBookings.map((b) => {
                  const badge = getStatusBadge(b.status)
                  const progress = stepProgress(b)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatTime(b.expectedCheckInDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {b.pet?.name}
                        <span className="block text-[10px] font-normal text-slate-400">{b.pet?.breed}</span>
                      </td>
                      <td className="py-3.5 px-4">{b.user?.fullName}</td>
                      <td className="py-3.5 px-4 max-w-56">{serviceNames(b)}</td>
                      <td className="py-3.5 px-4 text-amber-700">
                        {b.pet?.allergyNotes || b.pet?.specialNotes || 'Bình thường'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {progress.done}/{progress.total}
                      </td>
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
                          Xử lý ca →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
