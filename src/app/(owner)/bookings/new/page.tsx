'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useMyPets } from '@/hooks/usePetQueries'
import { useServices } from '@/hooks/useServiceQueries'
import { useCreateBooking, useBookingAvailability } from '@/hooks/useBookingQueries'
import { useBoardingRoomPriceRange } from '@/hooks/useBoardingRoomQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { BookingType } from '@/types'

// Danh mục dịch vụ của hai loại đơn không giao nhau.
// Hai bước hệ thống CHECK_IN / CHECK_OUT do backend tự chèn, khách không chọn.
const GROOMING_CATEGORIES = ['BATH_AND_DRY', 'HAIRCUT', 'HYGIENE', 'FULL_GROOMING']
const BOARDING_CATEGORIES = [
  'ASSIGN_ROOM', 'FEEDING', 'WATER', 'WALKING', 'MEDICATION', 'CLEANING', 'DAILY_HEALTH_CHECK',
]

/**
 * Ngày theo giờ máy người dùng. KHÔNG dùng toISOString() vì nó trả ngày theo UTC —
 * trước 7h sáng giờ Việt Nam sẽ ra ngày hôm trước.
 */
const localDateString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (dateStr: string, days: number) => {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + days)
  return localDateString(d)
}

export default function NewBookingPage() {
  const { data: pets, isLoading: petsLoading } = useMyPets()
  // limit=100 vì backend mặc định chỉ trả 10 mà hệ thống có 13 dịch vụ
  const { data: serviceData, isLoading: servicesLoading } = useServices({ limit: 100 })
  const services = useMemo(() => serviceData?.data ?? [], [serviceData])

  const { mutateAsync: createBooking, isPending: isSubmitting } = useCreateBooking()
  const { formatVND } = useFormatters()

  // Khoảng giá phòng theo đêm. Lúc đặt, khách chưa biết được xếp phòng nào
  // (cửa hàng xếp khi xác nhận đơn) nên chỉ ước lượng được một khoảng.
  const { data: roomPriceRange } = useBoardingRoomPriceRange()

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null)
  const [bookingType, setBookingType] = useState<BookingType>('GROOMING')

  /**
   * Lưu lựa chọn dịch vụ TÁCH RIÊNG cho từng loại booking.
   * Danh sách của GROOMING và BOARDING không giao nhau, nên nếu dùng chung một
   * mảng thì khi đổi tab buộc phải xoá hết — người dùng mất công chọn lại.
   */
  const [selectionsByType, setSelectionsByType] = useState<Record<BookingType, number[]>>({
    GROOMING: [],
    BOARDING: [],
  })
  const selectedServiceIds = selectionsByType[bookingType]

  // Khởi tạo sau khi mount: Next 16 (cacheComponents) chặn đọc new Date() lúc prerender
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('09:00')

  /** Ngày và giờ trả thú cưng — chỉ dùng cho đơn BOARDING, backend bắt buộc */
  const [checkOutDate, setCheckOutDate] = useState('')

  const [todayStr, setTodayStr] = useState('')
  useEffect(() => {
    const t = localDateString()
    setTodayStr(t)
    setBookingDate((prev) => prev || t)
    setCheckOutDate((prev) => prev || addDays(t, 1))
  }, [])
  const [checkOutTime, setCheckOutTime] = useState('17:00')

  /** Ghi chú của chủ nuôi, backend lưu vào Booking.notes */
  const [bookingNotes, setBookingNotes] = useState('')

  const [errorMessage, setErrorMessage] = useState('')

  const isBoarding = bookingType === 'BOARDING'

  /** Số đêm lưu trú, chỉ để hiển thị cho người dùng dễ hình dung */
  const nightCount = useMemo(() => {
    if (!isBoarding) return 0
    const diff = Math.round(
      (new Date(`${checkOutDate}T00:00:00`).getTime() - new Date(`${bookingDate}T00:00:00`).getTime())
      / 86400000,
    )
    return diff > 0 ? diff : 0
  }, [isBoarding, bookingDate, checkOutDate])

  /** Ngày trả phải sau ngày nhận — backend cũng chặn, đây chỉ để báo sớm */
  const checkOutError = useMemo(() => {
    if (!isBoarding) return ''
    const checkIn = new Date(`${bookingDate}T${bookingTime}:00`)
    const checkOut = new Date(`${checkOutDate}T${checkOutTime}:00`)
    if (Number.isNaN(checkOut.getTime())) return 'Vui lòng chọn ngày trả thú cưng'
    if (checkOut <= checkIn) return 'Thời gian trả phải sau thời gian nhận'
    return ''
  }, [isBoarding, bookingDate, bookingTime, checkOutDate, checkOutTime])

  // Dịch ngày trả theo nếu người dùng đổi ngày nhận muộn hơn
  useEffect(() => {
    if (bookingDate && checkOutDate <= bookingDate) setCheckOutDate(addDays(bookingDate, 1))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate])
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)

  const availabilityParams = useMemo(() => ({ date: bookingDate, bookingType }), [bookingDate, bookingType])
  const { data: availability, isLoading: availabilityLoading } = useBookingAvailability(availabilityParams)

  useEffect(() => {
    if (pets?.length && !selectedPetId) {
      setSelectedPetId(pets[0].id)
    }
  }, [pets, selectedPetId])

  const filteredServices = useMemo(() => {
    const allowed = isBoarding ? BOARDING_CATEGORIES : GROOMING_CATEGORIES
    return services.filter((s) => allowed.includes(s.category))
  }, [services, isBoarding])

  const isSlotPast = (slot: string) => {
    if (!bookingDate || bookingDate !== todayStr) return false
    const now = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    return slot <= now
  }

  const getSlotInfo = (slot: string) => {
    return availability?.slots?.find((s) => s.time === slot) ?? null
  }

  const isSlotDisabled = (slot: string) => {
    if (isSlotPast(slot)) return true
    const info = getSlotInfo(slot)
    if (info && !info.available) return true
    return false
  }

  useEffect(() => {
    if (isSlotDisabled(bookingTime) && availability?.slots) {
      const firstAvailable = availability.slots.find((s) => !isSlotDisabled(s.time))
      setBookingTime(firstAvailable?.time ?? '09:00')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate, availability])

  const toggleServiceId = (id: number) => {
    setSelectionsByType((prev) => {
      const list = prev[bookingType]
      return {
        ...prev,
        [bookingType]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      }
    })
  }

  const totalPrice = useMemo(() =>
    filteredServices
      .filter((s) => selectedServiceIds.includes(s.id))
      .reduce((sum, s) => sum + s.basePrice, 0),
    [filteredServices, selectedServiceIds]
  )

  /** Tiền phòng dự tính: khoảng giá × số đêm */
  const estimatedRoomCost = useMemo(() => {
    if (!isBoarding || !roomPriceRange || !nightCount) return null
    return { min: roomPriceRange.min * nightCount, max: roomPriceRange.max * nightCount }
  }, [isBoarding, roomPriceRange, nightCount])

  /** Tổng dự tính = tiền dịch vụ + khoảng tiền phòng */
  const estimatedTotal = useMemo(() => {
    if (!estimatedRoomCost) return null
    return { min: totalPrice + estimatedRoomCost.min, max: totalPrice + estimatedRoomCost.max }
  }, [estimatedRoomCost, totalPrice])

  const canSubmit = !!selectedPetId && selectedServiceIds.length > 0 && !isSubmitting && !checkOutError

  const handleCreateBooking = async () => {
    if (!canSubmit || !selectedPetId) return
    setErrorMessage('')
    try {
      const notes = bookingNotes.trim()
      const result = await createBooking({
        petId: selectedPetId,
        bookingType,
        // Phải gửi ISO có múi giờ. Chuỗi naive sẽ bị backend (TZ=UTC) hiểu sai 7 tiếng.
        expectedCheckInDate: new Date(`${bookingDate}T${bookingTime}:00`).toISOString(),
        // Đơn lưu trú bắt buộc phải có ngày trả, thiếu là backend trả 400
        ...(isBoarding
          ? { expectedCheckOutDate: new Date(`${checkOutDate}T${checkOutTime}:00`).toISOString() }
          : {}),
        serviceIds: [...selectedServiceIds],
        ...(notes ? { notes } : {}),
      })
      setBookingSuccess(true)
      setCreatedBookingId(result.id)
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Đặt lịch thất bại. Vui lòng thử lại.')
    }
  }

  const resetForm = () => {
    setBookingSuccess(false)
    setCreatedBookingId(null)
    setSelectionsByType({ GROOMING: [], BOARDING: [] })
    setBookingTime('09:00')
    setBookingNotes('')
    setCheckOutDate(bookingDate ? addDays(bookingDate, 1) : '')
    setCheckOutTime('17:00')
    setErrorMessage('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/bookings"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Đặt lịch dịch vụ chăm sóc
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Chọn thú cưng, dịch vụ và ngày hẹn để đặt lịch chăm sóc.
          </p>
        </div>
      </div>

      {bookingSuccess ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-4 shadow-card">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Đặt lịch thành công!</h3>
          <p className="text-sm text-emerald-700">
            Mã booking: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">#{createdBookingId}</span>. Trạng thái: <strong>PENDING</strong> — chờ tiếp nhận.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/bookings"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-all"
            >
              Xem danh sách lịch hẹn →
            </Link>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Đặt thêm lịch khác
            </button>
          </div>
        </div>
      ) : (petsLoading || servicesLoading) ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-8">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-sm text-rose-800 flex items-center gap-3">
              <span className="shrink-0 text-lg">⚠</span>
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="ml-auto text-rose-400 hover:text-rose-600 font-bold cursor-pointer">✕</button>
            </div>
          )}

          {/* Step 1: Select Pet */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Chọn thú cưng sẽ được chăm sóc:
            </label>
            {(!pets || pets.length === 0) ? (
              <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">
                Bạn chưa có hồ sơ thú cưng nào.{' '}
                <Link href="/pets/new" className="text-brand-600 font-bold hover:underline">Tạo hồ sơ ngay →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      selectedPetId === pet.id
                        ? 'border-brand-600 bg-brand-50/50 shadow-soft ring-2 ring-brand-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={pet.avatarUrl ?? ''} alt={pet.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{pet.name}</p>
                      <p className="text-xs text-slate-500">{pet.breed} ({pet.weight}kg)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Booking Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. Loại dịch vụ:
            </label>
            <div className="flex gap-4">
              {(['GROOMING', 'BOARDING'] as BookingType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setBookingType(type)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                    bookingType === type
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type === 'GROOMING' ? 'Grooming' : 'Boarding (Lưu trú)'}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Select Services */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              3. Chọn dịch vụ ({selectedServiceIds.length} đã chọn):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleServiceId(service.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-start ${
                    selectedServiceIds.includes(service.id)
                      ? 'border-brand-600 bg-brand-50/50 shadow-soft ring-2 ring-brand-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Thời lượng: {service.durationMinutes} phút</p>
                  </div>
                  <span className="font-bold text-sm text-brand-700">
                    {formatVND(service.basePrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Select Date & Time */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              4. {isBoarding ? 'Ngày nhận và ngày trả:' : 'Ngày và giờ hẹn:'}
            </label>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {isBoarding ? 'Ngày nhận bé' : 'Ngày hẹn'}
                </span>
                <input
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  type="date"
                  min={todayStr || undefined}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-sm focus:outline-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Đơn lưu trú bắt buộc có ngày + giờ trả */}
              {isBoarding && (
                <>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Ngày trả bé</span>
                    <input
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      type="date"
                      min={bookingDate ? addDays(bookingDate, 1) : undefined}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-sm focus:outline-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Giờ trả bé</span>
                    <input
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      type="time"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-sm focus:outline-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </>
              )}
            </div>

            {isBoarding && (
              <div className="text-xs">
                {checkOutError ? (
                  <p className="text-rose-600 font-semibold">{checkOutError}</p>
                ) : (
                  <p className="text-slate-500">
                    Thời gian lưu trú: <strong className="text-slate-800">{nightCount} đêm</strong>.
                    {roomPriceRange && (
                      <> Giá phòng {formatVND(roomPriceRange.min)} – {formatVND(roomPriceRange.max)}/đêm
                      tuỳ loại phòng, cửa hàng xếp phòng khi xác nhận đơn.</>
                    )}
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Chọn khung giờ:
                {availabilityLoading && <span className="text-slate-400 ml-1">Đang kiểm tra...</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {(availability?.slots ?? []).map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => !isSlotDisabled(slot.time) && setBookingTime(slot.time)}
                    disabled={isSlotDisabled(slot.time)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer disabled:cursor-not-allowed ${
                      isSlotDisabled(slot.time)
                        ? 'border-slate-100 bg-slate-50 text-slate-300 line-through'
                        : bookingTime === slot.time
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slot.time}</span>
                    {isSlotPast(slot.time) ? (
                      <span className="block text-[10px] font-normal mt-0.5 text-slate-300">Đã qua</span>
                    ) : (
                      <span className={`block text-[10px] font-normal mt-0.5 ${slot.available ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {slot.available ? `${slot.max - slot.current}/${slot.max} chỗ` : 'Hết chỗ'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 5: Ghi chú cho nhân viên */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              5. Ghi chú cho nhân viên{' '}
              <span className="font-normal normal-case text-slate-400">(không bắt buộc)</span>:
            </label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ví dụ: Bé sợ máy sấy công suất lớn, nhờ sấy nhẹ tay. Bé ăn 2 bữa/ngày..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              Nhân viên sẽ thấy ghi chú này ngay trên màn hình chăm sóc. {bookingNotes.length}/1000
            </p>
          </div>

          {/* Summary and Submit */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              {/* GROOMING: một con số chắc chắn */}
              {!isBoarding ? (
                <>
                  <span className="text-xs text-slate-400 block">Tổng thanh toán dự tính:</span>
                  <span className="text-2xl font-extrabold font-display text-brand-700">
                    {formatVND(totalPrice)}
                  </span>
                </>
              ) : (
                /* BOARDING: tách tiền dịch vụ và tiền phòng, tổng là một khoảng */
                <>
                  <div className="space-y-0.5 text-xs text-slate-500">
                    <div className="flex gap-2">
                      <span className="w-28">Tiền dịch vụ:</span>
                      <strong className="text-slate-800">{formatVND(totalPrice)}</strong>
                    </div>
                    {estimatedRoomCost && (
                      <div className="flex gap-2">
                        <span className="w-28">Tiền phòng:</span>
                        <strong className="text-slate-800">
                          {formatVND(estimatedRoomCost.min)} – {formatVND(estimatedRoomCost.max)}
                        </strong>
                        <span className="text-slate-400">({nightCount} đêm)</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block mt-1.5">Tổng thanh toán dự tính:</span>
                  <span className="text-2xl font-extrabold font-display text-brand-700">
                    {estimatedTotal
                      ? `${formatVND(estimatedTotal.min)} – ${formatVND(estimatedTotal.max)}`
                      : formatVND(totalPrice)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Số chính xác phụ thuộc phòng được xếp và được chốt khi bàn giao bé.
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleCreateBooking}
              disabled={!canSubmit}
              className={`px-8 py-3 rounded-2xl font-bold text-sm text-white shadow-soft transition-all cursor-pointer disabled:cursor-not-allowed ${
                !canSubmit ? 'bg-slate-300' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-card'
              }`}
            >
              {isSubmitting ? 'Đang tạo lịch...' : 'Xác nhận Đặt lịch'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
