'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  useBookingDetail,
  useUpdateBookingStatus,
  useUpdateBookingServiceItem,
  useAddBookingServiceItem,
} from '@/hooks/useBookingQueries'
import { useServices } from '@/hooks/useServiceQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { BookingServiceItem, ServiceCategory, UpdateBookingServiceDto } from '@/types'

/**
 * Hai bước hệ thống do backend tự quản: CHECK_IN được đánh dấu khi chuyển
 * CHECKED_IN, CHECK_OUT khi chuyển COMPLETED. Nhân viên không tick tay.
 */
const SYSTEM_CATEGORIES: ServiceCategory[] = ['CHECK_IN', 'CHECK_OUT']

export default function StaffCarePage() {
  const params = useParams()
  const bookingId = Number(params?.id)

  const { data: booking, isLoading, isError } = useBookingDetail(bookingId)
  const { formatVND, getStatusBadge } = useFormatters()

  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus()
  const { mutateAsync: updateServiceItem } = useUpdateBookingServiceItem()
  const { mutateAsync: addServiceItem, isPending: isAddingService } = useAddBookingServiceItem()

  // Bảng giá để ghi thêm dịch vụ khách phát sinh giữa ca
  const { data: serviceResponse } = useServices({ limit: 100 })
  const allServices = useMemo(() => serviceResponse?.data ?? [], [serviceResponse])

  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null)
  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 4000)
  }
  const errText = (err: any, fallback: string) =>
    err?.data?.message || err?.message || fallback

  const pet = booking?.pet
  const allSteps = useMemo<BookingServiceItem[]>(() => booking?.bookingServices ?? [], [booking])
  const isSystemStep = (bs: BookingServiceItem) => SYSTEM_CATEGORIES.includes(bs.service.category)

  /** Thứ tự đã được backend sắp sẵn: CHECK_IN → giữa theo actualStartTime → CHECK_OUT */
  const workSteps = useMemo(() => allSteps.filter((bs) => !isSystemStep(bs)), [allSteps])
  const checkInStep = allSteps.find((bs) => bs.service.category === 'CHECK_IN')
  const checkOutStep = allSteps.find((bs) => bs.service.category === 'CHECK_OUT')

  const doneCount = workSteps.filter((bs) => bs.status === 'COMPLETED').length
  const progressPercent = workSteps.length ? Math.round((doneCount / workSteps.length) * 100) : 0

  // ── Điều kiện thao tác, khớp máy trạng thái backend ─
  const canCheckIn = booking?.status === 'CONFIRMED'
  const canStartService = booking?.status === 'CHECKED_IN'
  /** Chỉ tick được từng bước khi ca đã bắt đầu */
  const canWorkOnSteps = booking?.status === 'IN_PROGRESS'
  /** BR-05: backend chặn COMPLETED nếu còn bước chưa xong — disable sẵn cho đỡ ăn lỗi */
  const allStepsDone = workSteps.length > 0 && workSteps.every((bs) => bs.status === 'COMPLETED')
  const canComplete = booking?.status === 'IN_PROGRESS' && allStepsDone

  const changeStatus = async (
    status: 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED',
    msg: string,
  ) => {
    try {
      await updateStatus({ id: bookingId, dto: { status } })
      showToast(msg)
    } catch (err: any) {
      showToast(errText(err, 'Không thể cập nhật trạng thái'), true)
    }
  }

  // ── Thao tác trên từng bước chăm sóc ───────────────
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)

  const patchStep = async (
    bs: BookingServiceItem,
    dto: UpdateBookingServiceDto,
    successMsg: string,
  ) => {
    setPendingItemId(bs.id)
    try {
      await updateServiceItem({ id: bs.id, dto })
      showToast(successMsg)
    } catch (err: any) {
      showToast(errText(err, 'Không thể cập nhật bước chăm sóc'), true)
    } finally {
      setPendingItemId(null)
    }
  }

  const handleStartStep = (bs: BookingServiceItem) =>
    patchStep(
      bs,
      { status: 'IN_PROGRESS', actualStartTime: new Date().toISOString() },
      `Bắt đầu: ${bs.service.name}`,
    )

  const handleFinishStep = (bs: BookingServiceItem) =>
    patchStep(
      bs,
      { status: 'COMPLETED', actualEndTime: new Date().toISOString() },
      `Hoàn thành: ${bs.service.name}`,
    )

  // ── Ghi chú từng bước ──────────────────────────────
  // Giữ bản nháp riêng để người dùng gõ xong mới lưu, tránh gọi API mỗi ký tự.
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({})
  const noteValue = (bs: BookingServiceItem) => noteDrafts[bs.id] ?? bs.notes ?? ''
  const isNoteDirty = (bs: BookingServiceItem) =>
    noteDrafts[bs.id] !== undefined && noteDrafts[bs.id] !== (bs.notes ?? '')

  const handleSaveNote = async (bs: BookingServiceItem) => {
    await patchStep(bs, { notes: noteDrafts[bs.id] ?? '' }, 'Đã lưu ghi chú')
    setNoteDrafts((prev) => {
      const next = { ...prev }
      delete next[bs.id]
      return next
    })
  }

  // ── Ảnh báo cáo ────────────────────────────────────
  // Gửi file qua multipart. KHÔNG truyền imageUrl ở các lần patch khác,
  // nếu không backend sẽ hiểu là yêu cầu gỡ ảnh.
  const handlePickPhoto = async (bs: BookingServiceItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Chỉ chấp nhận tệp hình ảnh', true)
      input.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 5MB', true)
      input.value = ''
      return
    }

    await patchStep(bs, { file }, 'Đã tải ảnh báo cáo')
    input.value = ''
  }

  const handleRemovePhoto = (bs: BookingServiceItem) =>
    patchStep(bs, { imageUrl: '' }, 'Đã gỡ ảnh')

  // ── Ghi thêm dịch vụ phát sinh ─────────────────────
  const [serviceToAdd, setServiceToAdd] = useState<number | ''>('')
  const canAddService =
    !!booking && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)

  const addableServices = useMemo(() => {
    const existing = new Set(allSteps.map((bs) => bs.serviceId))
    return allServices.filter(
      (sv) => sv.category !== 'CHECK_IN' && sv.category !== 'CHECK_OUT' && !existing.has(sv.id),
    )
  }, [allServices, allSteps])

  const handleAddService = async () => {
    if (!serviceToAdd || !booking) return
    try {
      await addServiceItem({ bookingId: booking.id, serviceId: Number(serviceToAdd) })
      showToast('Đã ghi thêm dịch vụ vào đơn')
      setServiceToAdd('')
    } catch (err: any) {
      showToast(errText(err, 'Không thể thêm dịch vụ'), true)
    }
  }

  const formatTime = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'
  const formatDateTime = (iso?: string | null) =>
    iso ? `${new Date(iso).toLocaleDateString('vi-VN')} ${formatTime(iso)}` : '—'

  // ───────────────────────── Render ─────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
        Đang tải thông tin ca chăm sóc...
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-10 border border-rose-200 text-center space-y-3">
        <div className="text-3xl">🔍</div>
        <h2 className="font-bold text-slate-900">Không tìm thấy ca chăm sóc</h2>
        <p className="text-xs text-slate-500">
          Đơn đặt lịch #{String(params?.id)} không tồn tại, đã bị xóa, hoặc bạn không có quyền xem.
        </p>
        <Link
          href="/staff/bookings"
          className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Về danh sách ca được phân công
        </Link>
      </div>
    )
  }

  const badge = getStatusBadge(booking.status)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-100 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold max-w-sm ${
            toast.isError ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/bookings"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              Khu vực Chăm sóc &amp; Cập nhật Timeline
            </h1>
            <p className="text-xs text-slate-500">
              Ca phục vụ bé <strong className="text-slate-800">{pet?.name}</strong> • Đơn #{booking.id} •{' '}
              {booking.bookingType === 'BOARDING' ? 'Lưu trú' : 'Grooming'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}>
            {badge.label}
          </span>

          {canCheckIn && (
            <button
              onClick={() => changeStatus('CHECKED_IN', 'Đã tiếp nhận thú cưng')}
              disabled={isUpdatingStatus}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingStatus ? 'Đang xử lý...' : 'Tiếp nhận thú cưng'}
            </button>
          )}

          {canStartService && (
            <button
              onClick={() => changeStatus('IN_PROGRESS', 'Đã bắt đầu ca chăm sóc')}
              disabled={isUpdatingStatus}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingStatus ? 'Đang xử lý...' : 'Bắt đầu Dịch vụ'}
            </button>
          )}

          {booking.status === 'IN_PROGRESS' && (
            <button
              onClick={() => changeStatus('COMPLETED', 'Đã hoàn thành ca chăm sóc')}
              disabled={!canComplete || isUpdatingStatus}
              title={!allStepsDone ? `Còn ${workSteps.length - doneCount} bước chưa hoàn thành` : ''}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdatingStatus ? 'Đang xử lý...' : 'Hoàn thành ca chăm sóc'}
            </button>
          )}
        </div>
      </div>

      {/* Cảnh báo sức khỏe / ghi chú */}
      <div className="bg-amber-500/10 border-2 border-amber-300 rounded-2xl p-4 space-y-1">
        <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
          ⚠️ Lưu ý trước khi chăm sóc
        </h4>
        <p className="text-xs text-amber-950">
          Tính cách / thói quen: <strong>{pet?.specialNotes || 'Không có ghi chú'}</strong>
        </p>
        <p className="text-xs text-rose-800 font-bold">Dị ứng: {pet?.allergyNotes || 'Không'}</p>
        {booking.notes && (
          <p className="text-xs text-amber-950">
            Yêu cầu của chủ nuôi: <strong>{booking.notes}</strong>
          </p>
        )}
      </div>

      {/* Nhắc thao tác theo trạng thái */}
      {!canWorkOnSteps && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
          {canCheckIn ? (
            <>Đơn đã được xác nhận. Bấm <strong>&quot;Tiếp nhận thú cưng&quot;</strong> khi chủ nuôi mang bé đến.</>
          ) : canStartService ? (
            <>
              Đã tiếp nhận bé lúc {formatTime(checkInStep?.actualStartTime)}. Bấm{' '}
              <strong>&quot;Bắt đầu Dịch vụ&quot;</strong> để mở checklist chăm sóc.
            </>
          ) : booking.status === 'COMPLETED' ? (
            <>
              Ca chăm sóc đã hoàn tất lúc {formatDateTime(checkOutStep?.actualEndTime)}. Tổng tiền:{' '}
              <strong>{formatVND(booking.costBreakdown?.totalAmount ?? booking.totalAmount)}</strong>
            </>
          ) : (
            <>Đơn đang ở trạng thái <strong>{booking.status}</strong> — không thao tác chăm sóc được.</>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: checklist thật */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Checklist chăm sóc</h3>
                <span className="text-xs font-bold text-slate-500">
                  {doneCount}/{workSteps.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Mốc tiếp nhận (hệ thống) */}
            {checkInStep && (
              <div className="flex items-center justify-between text-xs bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                <span className="font-semibold text-violet-900">{checkInStep.service.name}</span>
                <span className="text-violet-700 font-mono">
                  {checkInStep.status === 'COMPLETED'
                    ? formatTime(checkInStep.actualStartTime)
                    : 'Chưa tiếp nhận'}
                </span>
              </div>
            )}

            {!workSteps.length && (
              <div className="text-xs text-slate-500 text-center py-4">
                Đơn này không có bước chăm sóc nào.
              </div>
            )}

            {workSteps.map((bs) => (
              <div
                key={bs.id}
                className={`rounded-2xl border p-3 space-y-2.5 transition-colors ${
                  bs.status === 'COMPLETED'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : bs.status === 'IN_PROGRESS'
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-800">{bs.service.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {bs.staff ? (
                        <span>NV: {bs.staff.fullName}</span>
                      ) : (
                        <span className="text-amber-700">Chưa phân công nhân viên</span>
                      )}
                      {bs.actualStartTime && <> · bắt đầu {formatTime(bs.actualStartTime)}</>}
                      {bs.actualEndTime && <> · xong {formatTime(bs.actualEndTime)}</>}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold shrink-0 ${
                      bs.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : bs.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {bs.status === 'COMPLETED' ? 'Xong' : bs.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chờ'}
                  </span>
                </div>

                {canWorkOnSteps && (
                  <div className="flex items-center gap-2">
                    {bs.status === 'PENDING' && (
                      <button
                        onClick={() => handleStartStep(bs)}
                        disabled={pendingItemId === bs.id}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] disabled:opacity-50 cursor-pointer"
                      >
                        {pendingItemId === bs.id ? '...' : 'Bắt đầu bước này'}
                      </button>
                    )}
                    {bs.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleFinishStep(bs)}
                        disabled={pendingItemId === bs.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] disabled:opacity-50 cursor-pointer"
                      >
                        {pendingItemId === bs.id ? '...' : 'Đánh dấu hoàn thành'}
                      </button>
                    )}

                    <label
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer border ${
                        pendingItemId === bs.id
                          ? 'opacity-50 pointer-events-none border-slate-200 bg-white text-slate-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      📷 {bs.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePickPhoto(bs, e)}
                      />
                    </label>
                  </div>
                )}

                {bs.imageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={bs.imageUrl}
                      alt="Ảnh báo cáo"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    {canWorkOnSteps && (
                      <button
                        onClick={() => handleRemovePhoto(bs)}
                        disabled={pendingItemId === bs.id}
                        className="text-[10px] font-bold text-rose-600 hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        Gỡ ảnh
                      </button>
                    )}
                  </div>
                )}

                {(canWorkOnSteps || bs.notes) && (
                  <div>
                    <textarea
                      value={noteValue(bs)}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [bs.id]: e.target.value }))
                      }
                      readOnly={!canWorkOnSteps}
                      rows={2}
                      maxLength={1000}
                      placeholder="Ghi chú chăm sóc, ví dụ: bé hơi nhát nước, tai trái hơi đỏ cần theo dõi..."
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-[11px] resize-none bg-white read-only:bg-slate-50 read-only:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-brand-200"
                    />
                    {isNoteDirty(bs) && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => handleSaveNote(bs)}
                          disabled={pendingItemId === bs.id}
                          className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] disabled:opacity-50 cursor-pointer"
                        >
                          {pendingItemId === bs.id ? 'Đang lưu...' : 'Lưu ghi chú'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Ghi thêm dịch vụ phát sinh */}
            {canAddService && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Khách phát sinh yêu cầu?
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={serviceToAdd}
                    onChange={(e) => setServiceToAdd(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-[11px] font-semibold"
                  >
                    <option value="">— Chọn dịch vụ thêm —</option>
                    {addableServices.map((sv) => (
                      <option key={sv.id} value={sv.id}>
                        {sv.name} — {sv.basePrice.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!serviceToAdd || isAddingService}
                    onClick={handleAddService}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    {isAddingService ? '...' : 'Ghi thêm'}
                  </button>
                </div>
                {addableServices.length === 0 ? (
                  <p className="text-[10px] text-slate-500">Đơn đã có toàn bộ dịch vụ trong bảng giá.</p>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    Bước mới sẽ hiện ngay trong checklist và tính vào tổng tiền khi bàn giao.
                  </p>
                )}
              </div>
            )}

            {/* Mốc bàn giao (hệ thống) */}
            {checkOutStep && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <span className="font-semibold text-emerald-900">{checkOutStep.service.name}</span>
                <span className="text-emerald-700 font-mono">
                  {checkOutStep.status === 'COMPLETED'
                    ? formatTime(checkOutStep.actualEndTime)
                    : 'Chưa bàn giao'}
                </span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
              Hai mốc <strong>tiếp nhận</strong> và <strong>bàn giao</strong> do hệ thống tự ghi khi bạn
              bấm &quot;Tiếp nhận thú cưng&quot; và &quot;Hoàn thành ca chăm sóc&quot;.
            </p>
          </div>
        </div>

        {/* Cột phải: timeline chủ nuôi nhìn thấy.
            Hệ thống không có bảng timeline — tiến trình chính là mảng bookingServices,
            backend đã sắp sẵn CHECK_IN → giữa theo actualStartTime → CHECK_OUT. */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Timeline chủ nuôi đang nhìn thấy</span>
            <span className="text-brand-600">Cập nhật ngay khi bạn tick</span>
          </div>

          <div className="bg-gradient-to-r from-brand-600 to-teal-700 rounded-2xl p-5 text-white shadow-card">
            <h3 className="text-xl font-bold font-display">
              Nhật ký chăm sóc của {pet?.name || 'thú cưng'}
            </h3>
            <p className="text-sm text-brand-100">
              Dịch vụ:{' '}
              <span className="text-white font-medium">
                {workSteps.map((bs) => bs.service.name).join(', ') || 'Chưa có dịch vụ'}
              </span>
            </p>
          </div>

          <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-brand-500 before:via-teal-300 before:to-slate-200">
            {allSteps.map((bs, idx) => (
              <div key={bs.id} className="relative">
                <div
                  className={`absolute -left-8 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-slate-100 text-xs font-bold ${
                    bs.status === 'COMPLETED'
                      ? 'bg-brand-600 text-white'
                      : bs.status === 'IN_PROGRESS'
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </div>

                <div
                  className={`rounded-2xl p-4 border bg-white shadow-soft ${
                    bs.status === 'IN_PROGRESS' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200/50">
                        {formatTime(bs.actualStartTime ?? bs.actualEndTime)}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{bs.service.name}</h4>
                    </div>
                    <span className="text-xs text-slate-500">
                      Nhân viên:{' '}
                      <strong className="text-slate-700">{bs.staff?.fullName ?? 'Chưa phân công'}</strong>
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {bs.notes || bs.service.description || 'Chưa có ghi chú cho bước này.'}
                  </p>

                  {bs.imageUrl && (
                    <img
                      src={bs.imageUrl}
                      alt="Ảnh báo cáo"
                      className="mt-3 w-32 h-32 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
