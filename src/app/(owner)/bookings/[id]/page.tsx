'use client'

import React, { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  useBookingDetail,
  useBookingAvailability,
  useCancelBooking,
  useUpdateBooking,
} from '@/hooks/useBookingQueries'
import { useServices } from '@/hooks/useServiceQueries'
import { useFormatters } from '@/hooks/useFormatters'
import StatusBadge from '@/components/common/StatusBadge'

/** BR-02: chủ nuôi chỉ hủy được khi còn cách giờ hẹn ít nhất 12 tiếng. */
const CANCEL_DEADLINE_HOURS = 12

/** Máy trạng thái chỉ cho hủy từ 3 trạng thái này (xem bookings.service.ts). */
const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN']

// Ô "Thanh toán" tạm ẩn: chưa endpoint nào ghi `paymentStatus` nên nó luôn là UNPAID.
// Thêm lại khi có module Payment.

// Danh mục dịch vụ của hai loại đơn không giao nhau. Hai bước CHECK_IN / CHECK_OUT do backend
// tự giữ lại khi thay serviceIds, khách không chọn.
const GROOMING_CATEGORIES = ['BATH_AND_DRY', 'HAIRCUT', 'HYGIENE', 'FULL_GROOMING']
const BOARDING_CATEGORIES = [
  'ASSIGN_ROOM', 'FEEDING', 'WATER', 'WALKING', 'MEDICATION', 'CLEANING', 'DAILY_HEALTH_CHECK',
]

/** 16 khung giờ làm việc của backend (mục 2.17). Gửi giờ ngoài danh sách này là 400. */
const SLOT_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
]

/** Ngày theo giờ máy. KHÔNG dùng toISOString() — trước 7h sáng giờ VN sẽ ra ngày hôm trước. */
const localDateString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * useParams() là dynamic hook. Với cacheComponents của Next 16, phần đọc giá trị
 * động phải nằm trong một Suspense boundary, nếu không build fail khi prerender.
 */
function BookingDetailContent() {
  const params = useParams()
  const bookingId = Number(params.id)
  const { data: booking, isLoading } = useBookingDetail(bookingId)

  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking()
  const [showCancelPanel, setShowCancelPanel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelErrorMessage, setCancelErrorMessage] = useState('')

  // ── Đổi lịch
  const { mutateAsync: updateBooking, isPending: isRescheduling } = useUpdateBooking()
  const [showReschedulePanel, setShowReschedulePanel] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [newCheckOutDate, setNewCheckOutDate] = useState('')
  const [newCheckOutTime, setNewCheckOutTime] = useState('17:00')
  const [newServiceIds, setNewServiceIds] = useState<number[]>([])
  const [rescheduleErrorMessage, setRescheduleErrorMessage] = useState('')

  // limit=100 vì backend mặc định chỉ trả 10 mà hệ thống có 13 dịch vụ
  const { data: serviceData } = useServices({ limit: 100 })

  const isBoarding = booking?.bookingType === 'BOARDING'
  /** Owner chỉ sửa được khi đơn còn PENDING (bookings.service.ts:654). */
  const canReschedule = booking?.status === 'PENDING'

  /**
   * `excludeBookingId` để đơn đang sửa không tự chiếm chỗ của mình rồi báo hết chỗ,
   * khiến khách không chọn lại được đúng khung giờ cũ.
   */
  const availabilityParams = useMemo(
    () =>
      newDate && booking
        ? { date: newDate, bookingType: booking.bookingType, excludeBookingId: booking.id }
        : undefined,
    [newDate, booking?.bookingType, booking?.id]
  )
  const { data: availability, isFetching: availabilityFetching } =
    useBookingAvailability(availabilityParams)

  const getSlotInfo = (time: string) => availability?.slots?.find((s) => s.time === time)

  const selectableServices = useMemo(() => {
    const allowed = isBoarding ? BOARDING_CATEGORIES : GROOMING_CATEGORIES
    return (serviceData?.data ?? []).filter((s) => allowed.includes(s.category))
  }, [serviceData, isBoarding])

  /** Tiền dịch vụ sau khi sửa. Tiền phòng không đổi nên chỉ cần so phần này. */
  const newServiceAmount = useMemo(
    () =>
      selectableServices
        .filter((s) => newServiceIds.includes(s.id))
        .reduce((sum, s) => sum + s.basePrice, 0),
    [selectableServices, newServiceIds]
  )

  const toggleServiceId = (id: number) =>
    setNewServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  /** Mở panel với ngày/giờ đang có của đơn, để khách thấy mình đang đổi từ đâu. */
  const openReschedulePanel = () => {
    const timeString = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

    if (booking?.expectedCheckInDate) {
      const d = new Date(booking.expectedCheckInDate)
      setNewDate(localDateString(d))
      setNewSlot(timeString(d))
    }
    if (booking?.expectedCheckOutDate) {
      const d = new Date(booking.expectedCheckOutDate)
      setNewCheckOutDate(localDateString(d))
      setNewCheckOutTime(timeString(d))
    }

    // Chỉ lấy dịch vụ khách chọn, bỏ hai bước hệ thống — backend tự giữ chúng khi thay serviceIds.
    const systemCategories = ['CHECK_IN', 'CHECK_OUT']
    setNewServiceIds(
      (booking?.bookingServices ?? [])
        .filter((bs) => !systemCategories.includes(bs.service.category))
        .map((bs) => bs.serviceId)
    )

    setRescheduleErrorMessage('')
    setShowReschedulePanel(true)
  }

  const handleReschedule = async () => {
    if (!booking) return
    setRescheduleErrorMessage('')

    const nextCheckIn = new Date(`${newDate}T${newSlot}:00`)

    /**
     * Đơn GROOMING cũng có `expectedCheckOutDate` (giờ hẹn + thời lượng dịch vụ).
     * Nếu chỉ đổi giờ nhận, giờ trả cũ sẽ nằm trước giờ nhận mới và backend chặn 400
     * ("Thời gian check-out dự kiến phải sau thời gian check-in dự kiến").
     * Nên giữ nguyên thời lượng và dịch cả hai mốc.
     */
    let nextCheckOut: Date | undefined
    if (isBoarding) {
      nextCheckOut = new Date(`${newCheckOutDate}T${newCheckOutTime}:00`)
    } else if (booking.expectedCheckInDate && booking.expectedCheckOutDate) {
      const durationMs =
        new Date(booking.expectedCheckOutDate).getTime() -
        new Date(booking.expectedCheckInDate).getTime()
      nextCheckOut = new Date(nextCheckIn.getTime() + durationMs)
    }

    try {
      await updateBooking({
        id: booking.id,
        dto: {
          // Phải gửi ISO có múi giờ. Chuỗi naive sẽ bị backend (TZ=UTC) hiểu sai 7 tiếng.
          expectedCheckInDate: nextCheckIn.toISOString(),
          ...(nextCheckOut ? { expectedCheckOutDate: nextCheckOut.toISOString() } : {}),
          // THAY TOÀN BỘ phần khách chọn, nên phải gửi cả danh sách — gửi thiếu là mất dịch vụ.
          serviceIds: newServiceIds,
        },
      })
      setShowReschedulePanel(false)
    } catch (err: any) {
      setRescheduleErrorMessage(err?.data?.message || err?.message || 'Không thể đổi lịch hẹn!')
    }
  }

  const canSubmitReschedule =
    !!newDate &&
    !!newSlot &&
    (!isBoarding || !!newCheckOutDate) &&
    // Đơn GROOMING bắt buộc còn ít nhất 1 dịch vụ, gửi mảng rỗng là backend trả 400
    (isBoarding || newServiceIds.length > 0) &&
    !isRescheduling

  const { formatVND } = useFormatters()

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hoursUntilCheckIn = booking?.expectedCheckInDate
    ? (new Date(booking.expectedCheckInDate).getTime() - Date.now()) / 3_600_000
    : null

  const isCancellableStatus = !!booking && CANCELLABLE_STATUSES.includes(booking.status)
  const isPastDeadline = hoursUntilCheckIn !== null && hoursUntilCheckIn < CANCEL_DEADLINE_HOURS
  const canCancel = isCancellableStatus && !isPastDeadline

  // Tiền phòng chỉ nằm trong costBreakdown — tự cộng bookingServices sẽ thiếu với đơn BOARDING.
  const totalAmount = booking
    ? (booking.costBreakdown?.totalAmount ?? booking.bookingServices.reduce((sum, s) => sum + s.price, 0))
    : 0

  const handleCancel = async () => {
    if (!booking) return
    setCancelErrorMessage('')
    try {
      await cancelBooking({ id: booking.id, cancelReason: cancelReason.trim() || undefined })
      setShowCancelPanel(false)
      setCancelReason('')
    } catch (err: any) {
      setCancelErrorMessage(err?.data?.message || err?.message || 'Không thể hủy lịch hẹn!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <p className="text-xs text-slate-500 mt-0.5">Booking #{bookingId}</p>
          </div>
        </div>
        {booking && <StatusBadge status={booking.status} />}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Đang tải thông tin lịch hẹn...</p>
          </div>
        </div>
      ) : !booking ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy lịch hẹn</h3>
          <p className="text-sm text-slate-500 mb-6">
            Lịch hẹn này không tồn tại, đã bị xóa, hoặc không thuộc về bạn.
          </p>
          <Link href="/bookings" className="text-sm font-bold text-brand-600 hover:text-brand-700">
            ← Quay lại danh sách
          </Link>
        </div>
      ) : (
        <>
          {/* Thú cưng + lịch hẹn */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={booking.pet?.avatarUrl ?? ''}
                alt={booking.pet?.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-slate-900">{booking.pet?.name}</h2>
                  <span className="text-xs text-slate-500">({booking.pet?.breed})</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {booking.pet?.weight} kg
                  {booking.pet?.gender === 'MALE' && ' • Đực'}
                  {booking.pet?.gender === 'FEMALE' && ' • Cái'}
                  {' • '}
                  {booking.bookingType === 'GROOMING' ? 'Chăm sóc / Spa' : 'Lưu trú'}
                </p>
              </div>
              <Link
                href={`/pets/${booking.petId}`}
                className="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
              >
                Xem hồ sơ bé →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {booking.bookingType === 'BOARDING' ? 'Ngày nhận bé' : 'Giờ hẹn'}
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {formatDateTime(booking.expectedCheckInDate)}
                </p>
              </div>
              {booking.bookingType === 'BOARDING' && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày trả bé</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {formatDateTime(booking.expectedCheckOutDate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ngày đặt</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{formatDateTime(booking.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Dị ứng / lưu ý của bé */}
          {(booking.pet?.allergyNotes || booking.pet?.specialNotes) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
              {booking.pet?.allergyNotes && (
                <div className="text-xs text-amber-900">
                  <span className="font-bold">⚠ Dị ứng:</span> {booking.pet.allergyNotes}
                </div>
              )}
              {booking.pet?.specialNotes && (
                <div className="text-xs text-amber-800">
                  <span className="font-bold">Lưu ý:</span> {booking.pet.specialNotes}
                </div>
              )}
            </div>
          )}

          {/* Ghi chú của chủ nuôi */}
          {booking.notes && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú của bạn</p>
              <p className="text-sm text-slate-700 mt-1.5 whitespace-pre-line">{booking.notes}</p>
            </div>
          )}

          {/* Lý do hủy */}
          {booking.status === 'CANCELLED' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Đơn đã hủy</p>
              <p className="text-sm text-rose-800 mt-1.5">
                {booking.cancelReason || 'Không có lý do được ghi nhận.'}
              </p>
              {booking.cancelledAt && (
                <p className="text-xs text-rose-500 mt-1">Thời điểm hủy: {formatDateTime(booking.cancelledAt)}</p>
              )}
            </div>
          )}

          {/* Phòng lưu trú */}
          {booking.bookingType === 'BOARDING' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phòng lưu trú</p>
              {booking.bookingBoardingRoom ? (
                <div className="flex items-center gap-3 mt-3">
                  {booking.bookingBoardingRoom.boardingRoom?.imageUrl && (
                    <img
                      src={booking.bookingBoardingRoom.boardingRoom.imageUrl}
                      alt={booking.bookingBoardingRoom.boardingRoom?.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900">
                      {booking.bookingBoardingRoom.boardingRoom?.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatVND(booking.bookingBoardingRoom.pricePerNight)}/đêm
                      {!!booking.costBreakdown?.stayNights && (
                        <> · {booking.costBreakdown.stayNights} đêm</>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Cửa hàng sẽ xếp phòng cho bé khi xác nhận đơn.
                </p>
              )}
            </div>
          )}

          {/* Dịch vụ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Dịch vụ đã đặt</h3>
            {booking.bookingServices.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Chưa có dịch vụ nào trong đơn này.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {booking.bookingServices.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{svc.service.name}</p>
                      {svc.staff && (
                        <p className="text-xs text-slate-500 mt-0.5">Nhân viên: {svc.staff.fullName}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 shrink-0">{formatVND(svc.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chi phí */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-2.5">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Chi phí</h3>
            {booking.costBreakdown ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Tiền dịch vụ</span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(booking.costBreakdown.serviceAmount)}
                  </span>
                </div>
                {booking.costBreakdown.roomAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Tiền phòng
                      {!!booking.costBreakdown.stayNights && ` (${booking.costBreakdown.stayNights} đêm)`}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatVND(booking.costBreakdown.roomAmount)}
                    </span>
                  </div>
                )}
              </>
            ) : null}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-600">
                {booking.status === 'COMPLETED' ? 'Tổng cộng' : 'Tổng dự tính'}
              </span>
              <span className="text-xl font-extrabold font-display text-brand-700">{formatVND(totalAmount)}</span>
            </div>
            {booking.status !== 'COMPLETED' && (
              <p className="text-[11px] text-slate-400">
                Số tiền được chốt chính thức khi cửa hàng hoàn thành đơn.
              </p>
            )}
          </div>

          {cancelErrorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
              {cancelErrorMessage}
            </div>
          )}

          {/* Panel đổi lịch */}
          {showReschedulePanel && (
            <div className="bg-white rounded-2xl p-5 border border-brand-200 shadow-soft space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Sửa đơn</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dịch vụ
                  {!isBoarding && (
                    <span className="font-normal text-slate-400"> (chọn ít nhất 1)</span>
                  )}
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectableServices.map((service) => {
                    const checked = newServiceIds.includes(service.id)
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleServiceId(service.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          checked
                            ? 'bg-brand-50 border-brand-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center text-[10px] font-bold ${
                              checked
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            {checked ? '✓' : ''}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {service.name}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-slate-600 shrink-0">
                          {formatVND(service.basePrice)}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Khách đổi dịch vụ là tiền đổi theo — hiện ngay để không bị bất ngờ lúc trả bé */}
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tiền dịch vụ sau khi sửa</span>
                  <span className="font-bold text-slate-900">{formatVND(newServiceAmount)}</span>
                </div>
                {newServiceAmount !== (booking.costBreakdown?.serviceAmount ?? 0) && (
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Trước đó: {formatVND(booking.costBreakdown?.serviceAmount ?? 0)}
                    {isBoarding && ' · tiền phòng không đổi'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBoarding ? 'Ngày nhận bé' : 'Ngày hẹn'}
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={localDateString()}
                  onChange={(e) => {
                    setNewDate(e.target.value)
                    setNewSlot('')
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                />
              </div>

              {isBoarding && (
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày trả bé</label>
                    <input
                      type="date"
                      value={newCheckOutDate}
                      min={newDate || localDateString()}
                      onChange={(e) => setNewCheckOutDate(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Giờ trả bé</label>
                    <input
                      type="time"
                      value={newCheckOutTime}
                      onChange={(e) => setNewCheckOutTime(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Giờ hẹn <span className="font-normal text-slate-400">(16 khung, mỗi khung 30 phút)</span>
                  {availabilityFetching && (
                    <span className="font-normal text-slate-400 ml-1">· Đang kiểm tra chỗ trống...</span>
                  )}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SLOT_TIMES.map((time) => {
                    const info = getSlotInfo(time)
                    const isFull = info ? !info.available : false
                    const isSelected = newSlot === time
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!newDate || isFull}
                        onClick={() => setNewSlot(time)}
                        title={info ? `${info.current}/${info.max} chỗ đã đặt` : undefined}
                        className={`px-2 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
                {!newDate && (
                  <p className="text-[11px] text-slate-400 mt-1.5">Chọn ngày trước để xem khung giờ.</p>
                )}
              </div>

              {rescheduleErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {rescheduleErrorMessage}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={!canSubmitReschedule}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRescheduling ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReschedulePanel(false)}
                  disabled={isRescheduling}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}

          {/* Panel hủy đơn */}
          {showCancelPanel && (
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-soft space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Lý do hủy <span className="font-normal text-slate-400">(không bắt buộc)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Ví dụ: bé bị mệt, gia đình có việc đột xuất..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelPanel(false)
                    setCancelErrorMessage('')
                  }}
                  disabled={isCancelling}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Giữ lịch hẹn
                </button>
              </div>
            </div>
          )}

          {/* Hành động */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/bookings/${booking.id}/timeline`}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-all"
            >
              Xem tiến trình chăm sóc →
            </Link>

            {canReschedule && !showReschedulePanel && (
              <button
                type="button"
                onClick={openReschedulePanel}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                Sửa đơn (lịch hẹn / dịch vụ)
              </button>
            )}

            {canCancel && !showCancelPanel && (
              <button
                type="button"
                onClick={() => setShowCancelPanel(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
              >
                Hủy lịch hẹn
              </button>
            )}

            {isCancellableStatus && isPastDeadline && (
              <p className="text-xs text-slate-500">
                Chỉ hủy được trước giờ hẹn ít nhất {CANCEL_DEADLINE_HOURS} tiếng. Vui lòng liên hệ cửa hàng.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 border border-slate-200 text-center text-sm text-slate-500">
          Đang tải chi tiết lịch hẹn...
        </div>
      }
    >
      <BookingDetailContent />
    </Suspense>
  )
}
