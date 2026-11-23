'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useBookingDetail } from '@/hooks/useBookingQueries'
import { useFormatters } from '@/hooks/useFormatters'
import StatusBadge from '@/components/common/StatusBadge'

/**
 * useParams() là dynamic hook. Với cacheComponents của Next 16, phần đọc giá trị
 * động phải nằm trong một Suspense boundary, nếu không build fail khi prerender
 * (CLIENT_HOOK_DYNAMIC). Nên tách nội dung ra và bọc Suspense ở default export.
 */
function BookingTimelineContent() {
  const params = useParams()
  const bookingId = Number(params.id)
  const { data: booking, isLoading } = useBookingDetail(bookingId)
  const pet = booking?.pet

  const { formatVND } = useFormatters()

  const displayServices = booking?.bookingServices ?? []

  const totalPrice = displayServices.reduce((sum, s) => sum + s.price, 0)
  const completedCount = displayServices.filter((s) => s.status === 'COMPLETED').length

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getServiceStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-50 border-emerald-300', icon: '✓', iconBg: 'bg-emerald-500 text-white', label: 'Hoàn thành', labelClass: 'text-emerald-700' }
      case 'IN_PROGRESS':
        return { bg: 'bg-teal-50 border-teal-300', icon: '▶', iconBg: 'bg-teal-500 text-white animate-pulse', label: 'Đang thực hiện', labelClass: 'text-teal-700' }
      default:
        return { bg: 'bg-slate-50 border-slate-200', icon: '○', iconBg: 'bg-slate-200 text-slate-500', label: 'Chờ thực hiện', labelClass: 'text-slate-500' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">Chi tiết lịch hẹn</h1>
            <p className="text-xs text-slate-500 mt-0.5">Booking #{booking?.id}</p>
          </div>
        </div>
        {booking && <StatusBadge status={booking.status} />}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Đang tải thông tin booking...</p>
          </div>
        </div>
      )}

      {!isLoading && booking && (
        <>
          {/* Pet Profile Brief Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={pet?.avatarUrl ?? ''}
                alt={pet?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{pet?.name}</h3>
                  <span className="text-[11px] text-slate-500">({pet?.breed})</span>
                </div>
                <p className="text-xs text-slate-500">
                  {pet?.weight} kg •{' '}
                  {pet?.gender === 'MALE' ? 'Đực' : pet?.gender === 'FEMALE' ? 'Cái' : ''} •{' '}
                  {booking.bookingType === 'GROOMING' ? 'Grooming' : 'Lưu trú'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Ngày hẹn</p>
              <p className="text-sm font-bold text-slate-800">
                {booking.expectedCheckInDate ? new Date(booking.expectedCheckInDate).toLocaleDateString('vi-VN') : '-'}
              </p>
            </div>
          </div>

          {/* Special notes */}
          {(pet?.allergyNotes || pet?.specialNotes) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
              {pet?.allergyNotes && (
                <div className="text-xs text-amber-900">
                  <span className="font-bold">⚠ Dị ứng:</span> {pet.allergyNotes}
                </div>
              )}
              {pet?.specialNotes && (
                <div className="text-xs text-amber-800">
                  <span className="font-bold">Lưu ý:</span> {pet.specialNotes}
                </div>
              )}
            </div>
          )}

          {/* Service Progress */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Tiến trình dịch vụ</h2>
              <span className="text-xs text-slate-500">
                {completedCount}/{displayServices.length} hoàn thành
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: displayServices.length ? `${(completedCount / displayServices.length) * 100}%` : '0%' }}
              />
            </div>

            <div className="space-y-3">
              {displayServices.map((svc, idx) => {
                const style = getServiceStatusStyle(svc.status)
                return (
                  <div key={svc.id} className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${style.bg}`}>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${style.iconBg}`}>
                        {style.icon}
                      </div>
                      {idx < displayServices.length - 1 && <div className="w-px h-4 bg-slate-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{svc.service.name}</h4>
                        <span className={`text-[11px] font-bold ${style.labelClass}`}>{style.label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        {svc.staff && <span>Nhân viên: <strong className="text-slate-700">{svc.staff.fullName}</strong></span>}
                        {formatDateTime(svc.actualStartTime) && <span>Bắt đầu: {formatDateTime(svc.actualStartTime)}</span>}
                        {formatDateTime(svc.actualEndTime) && <span>Kết thúc: {formatDateTime(svc.actualEndTime)}</span>}
                        <span className="font-semibold text-slate-700">{formatVND(svc.price)}</span>
                      </div>
                      {svc.imageUrl && (
                        <div className="mt-3">
                          <img src={svc.imageUrl} alt={svc.service.name} className="w-32 h-24 rounded-xl object-cover border border-slate-200" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {displayServices.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-400">
                  Chưa có dịch vụ nào được thêm vào booking này.
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">Tổng chi phí</span>
            <span className="text-xl font-extrabold font-display text-brand-700">{formatVND(totalPrice)}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default function BookingTimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
          Đang tải tiến trình chăm sóc...
        </div>
      }
    >
      <BookingTimelineContent />
    </Suspense>
  )
}
