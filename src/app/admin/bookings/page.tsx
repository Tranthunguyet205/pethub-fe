'use client'

import React, { useState, useMemo } from 'react'
import {
  useBookings,
  useUpdateBookingStatus,
  useDeleteBooking,
  useCancelBooking,
  useAssignRoom,
  useAssignStaff,
  useAddBookingServiceItem,
  useRemoveBookingServiceItem,
} from '@/hooks/useBookingQueries'
import { useBoardingRooms } from '@/hooks/useBoardingRoomQueries'
import { useStaffList } from '@/hooks/useUserQueries'
import { useServices } from '@/hooks/useServiceQueries'
import { useFormatters } from '@/hooks/useFormatters'
import type { Booking, BookingStatus, BookingType, GetAllBookingParams } from '@/types'

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'CHECKED_IN', label: 'Đã tiếp nhận' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'NO_SHOW', label: 'Không đến' },
]

/**
 * Bước kế tiếp theo máy trạng thái của backend.
 * PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED
 * KHÔNG được nhảy cóc (vd CONFIRMED → IN_PROGRESS) — backend sẽ trả 400.
 */
const nextStatusMap: Partial<Record<BookingStatus, { status: BookingStatus; label: string; color: string }>> = {
  PENDING: { status: 'CONFIRMED', label: 'Xác nhận', color: 'bg-blue-600 hover:bg-blue-700' },
  CONFIRMED: { status: 'CHECKED_IN', label: 'Tiếp nhận thú cưng', color: 'bg-violet-600 hover:bg-violet-700' },
  CHECKED_IN: { status: 'IN_PROGRESS', label: 'Bắt đầu dịch vụ', color: 'bg-teal-600 hover:bg-teal-700' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Hoàn thành', color: 'bg-emerald-600 hover:bg-emerald-700' },
}

/**
 * Trạng thái còn hủy được, khớp đúng máy trạng thái backend.
 * Đơn đang IN_PROGRESS thì KHÔNG hủy được (chỉ còn đường tới COMPLETED),
 * nên không hiện nút hủy ở đó — hiện ra là bấm vào ăn 400.
 */
const CANCELLABLE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN']

const bookingTypeLabels: Record<BookingType, string> = {
  GROOMING: 'Grooming',
  BOARDING: 'Boarding',
}

export default function AdminBookingsPage() {
  const { formatVND, getStatusBadge } = useFormatters()
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateBookingStatus()
  const { mutateAsync: deleteBooking, isPending: isDeleting } = useDeleteBooking()
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking()
  const { mutateAsync: assignRoom, isPending: isAssigningRoom } = useAssignRoom()
  const { mutateAsync: assignStaff, isPending: isAssigningStaff } = useAssignStaff()
  const { mutateAsync: addServiceItem, isPending: isAddingService } = useAddBookingServiceItem()
  const { mutateAsync: removeServiceItem, isPending: isRemovingService } = useRemoveBookingServiceItem()

  // Nhân viên cho ô phân công từng bước dịch vụ
  const { data: staffList } = useStaffList()

  // Phòng gán được cho đơn lưu trú.
  // Phải dùng `assignable`, KHÔNG dùng status='AVAILABLE': một phòng đã bị đơn
  // CONFIRMED khác giữ vẫn mang status AVAILABLE nhưng gán vào sẽ bị backend trả 400.
  const { data: roomResponse } = useBoardingRooms({ assignable: 'true', limit: 100 })
  const availableRooms = useMemo(() => roomResponse?.data ?? [], [roomResponse])

  // Bảng giá đầy đủ để thêm dịch vụ phát sinh (limit=100 vì backend mặc định chỉ trả 10)
  const { data: serviceResponse } = useServices({ limit: 100 })
  const allServices = useMemo(() => serviceResponse?.data ?? [], [serviceResponse])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus | ''>('')
  const [filterType, setFilterType] = useState<BookingType | ''>('')
  const [page, setPage] = useState(1)
  const limit = 10

  const queryParams = useMemo<GetAllBookingParams>(() => ({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    status: filterStatus || undefined,
    bookingType: filterType || undefined,
  }), [page, searchQuery, filterStatus, filterType])

  const { data: response, isLoading } = useBookings(queryParams)
  const allBookings = useMemo(() => response?.data ?? [], [response])
  const pagination = response?.meta
  const totalPages = pagination?.totalPages ?? 1

  const stats = useMemo(() => ({
    total: pagination?.total ?? allBookings.length,
    pending: allBookings.filter(b => b.status === 'PENDING').length,
    inProgress: allBookings.filter(b => b.status === 'IN_PROGRESS').length,
    completed: allBookings.filter(b => b.status === 'COMPLETED').length,
  }), [allBookings, pagination])

  // Toast
  const [toastMessage, setToastMessage] = useState('')
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Detail Modal
  // Giữ ID thay vì bản sao object: sau khi gán phòng / phân công nhân viên,
  // react-query invalidate xong là modal tự hiện dữ liệu mới.
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const selectedBooking = useMemo(
    () => allBookings.find(b => b.id === selectedBookingId) ?? null,
    [allBookings, selectedBookingId],
  )

  const openDetail = (b: Booking) => {
    setSelectedBookingId(b.id)
    setIsDetailOpen(true)
  }

  // Gán phòng lưu trú — backend chặn CONFIRMED -> CHECKED_IN nếu đơn BOARDING
  // chưa có phòng, nên thiếu bước này thì đơn lưu trú kẹt mãi ở CONFIRMED.
  const [roomToAssign, setRoomToAssign] = useState<number | ''>('')
  const needsRoom = (b: Booking) => b.bookingType === 'BOARDING' && !b.bookingBoardingRoom
  const canCancel = (b: Booking) => CANCELLABLE_STATUSES.includes(b.status)

  // Thêm / bỏ dịch vụ phát sinh giữa kỳ
  const [serviceToAdd, setServiceToAdd] = useState<number | ''>('')
  const canEditServices = (b: Booking) =>
    !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)

  /** Bỏ hai bước hệ thống và những dịch vụ đã có trong đơn */
  const addableServices = (b: Booking) => {
    const existing = new Set(b.bookingServices.map(bs => bs.serviceId))
    return allServices.filter(
      sv =>
        sv.category !== 'CHECK_IN' && sv.category !== 'CHECK_OUT' && !existing.has(sv.id),
    )
  }

  // Cancel Modal
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const openCancelModal = (b: Booking) => {
    setBookingToCancel(b)
    setCancelReason('')
    setIsCancelOpen(true)
    setIsDetailOpen(false)
  }

  // Delete Modal
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const openDeleteModal = (b: Booking) => {
    setBookingToDelete(b)
    setIsDeleteOpen(true)
    setIsDetailOpen(false)
  }

  // Helpers
  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '—'
    return `${formatDate(iso)} ${formatTime(iso)}`
  }

  const getServiceNames = (booking: Booking) => {
    return booking.bookingServices
      .filter(bs => bs.service.category !== 'CHECK_IN' && bs.service.category !== 'CHECK_OUT')
      .map(bs => bs.service.name)
      .join(', ') || 'Chưa có dịch vụ'
  }

  /**
   * Tổng tiền ưu tiên costBreakdown của backend — nó gồm CẢ tiền phòng lưu trú.
   * Tự cộng bookingServices sẽ thiếu tiền phòng với đơn BOARDING.
   */
  const getTotalPrice = (booking: Booking) => {
    if (booking.costBreakdown) return booking.costBreakdown.totalAmount
    return booking.bookingServices.reduce((sum, bs) => sum + bs.price, 0)
  }

  // Actions
  const handleUpdateStatus = async (booking: Booking, newStatus: BookingStatus) => {
    try {
      await updateStatus({ id: booking.id, dto: { status: newStatus } })
      const label = statusOptions.find(s => s.value === newStatus)?.label || newStatus
      showToast(`Booking #${booking.id} → ${label}`)
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể cập nhật'}`)
    }
  }

  const handleCancel = async () => {
    if (!bookingToCancel) return
    try {
      await cancelBooking({
        id: bookingToCancel.id,
        cancelReason: cancelReason.trim() || undefined,
      })
      showToast(`Đã hủy booking #${bookingToCancel.id}`)
      setIsCancelOpen(false)
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể hủy'}`)
    }
  }

  const handleAssignRoom = async (booking: Booking) => {
    if (!roomToAssign) return
    try {
      await assignRoom({ bookingId: booking.id, boardingRoomId: Number(roomToAssign) })
      showToast(`Đã gán phòng cho booking #${booking.id}`)
      setRoomToAssign('')
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể gán phòng'}`)
    }
  }

  const handleAssignStaff = async (serviceItemId: number, staffId: number) => {
    if (!staffId) return
    try {
      await assignStaff({ serviceItemId, staffId })
      showToast('Đã phân công nhân viên')
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể phân công'}`)
    }
  }

  const handleAddService = async (booking: Booking) => {
    if (!serviceToAdd) return
    try {
      await addServiceItem({ bookingId: booking.id, serviceId: Number(serviceToAdd) })
      showToast('Đã thêm dịch vụ vào đơn')
      setServiceToAdd('')
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể thêm dịch vụ'}`)
    }
  }

  const handleRemoveService = async (bs: { id: number; service: { name: string } }) => {
    try {
      await removeServiceItem(bs.id)
      showToast(`Đã bỏ "${bs.service.name}" khỏi đơn`)
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể bỏ dịch vụ'}`)
    }
  }

  const handleDelete = async () => {
    if (!bookingToDelete) return
    try {
      await deleteBooking(bookingToDelete.id)
      showToast(`Đã xóa booking #${bookingToDelete.id}`)
      setIsDeleteOpen(false)
    } catch (err: any) {
      showToast(`Lỗi: ${err?.data?.message || err?.message || 'Không thể xóa'}`)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Quản lý Đặt lịch (Bookings)</h1>
        <p className="text-xs text-slate-500">Xem, xác nhận, chuyển trạng thái và quản lý tất cả đơn đặt lịch trong hệ thống.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng đơn</div>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ xác nhận</div>
          <div className="text-2xl font-extrabold font-display text-amber-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang thực hiện</div>
          <div className="text-2xl font-extrabold font-display text-teal-600 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoàn thành</div>
          <div className="text-2xl font-extrabold font-display text-emerald-600 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
          type="text"
          placeholder="Tìm tên pet, chủ nuôi, SĐT, email..."
          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-brand-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as BookingStatus | ''); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as BookingType | ''); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
        >
          <option value="">Tất cả loại</option>
          <option value="GROOMING">Grooming</option>
          <option value="BOARDING">Boarding</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Đang tải dữ liệu...</div>
        ) : allBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Không tìm thấy đơn đặt lịch nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Thú cưng</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Dịch vụ</th>
                  <th className="py-3 px-4">Lịch hẹn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBookings.map((b) => {
                  const badge = getStatusBadge(b.status)
                  const next = nextStatusMap[b.status]
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => openDetail(b)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{b.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {b.pet?.avatarUrl ? (
                            <img src={b.pet.avatarUrl} alt={b.pet?.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🐾</div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800">{b.pet?.name || '—'}</div>
                            <div className="text-[10px] text-slate-400">{b.pet?.species} · {b.pet?.breed || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{b.user?.fullName}</div>
                        <div className="text-[10px] text-slate-400">{b.user?.phoneNumber || b.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.bookingType === 'GROOMING' ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'}`}>
                          {bookingTypeLabels[b.bookingType]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate">{getServiceNames(b)}</td>
                      <td className="py-3.5 px-4">
                        <div>{formatDate(b.expectedCheckInDate)}</div>
                        {b.expectedCheckInDate && (
                          <div className="text-[10px] text-slate-400">
                            {formatTime(b.expectedCheckInDate)}
                            {b.expectedCheckOutDate && <> → {formatTime(b.expectedCheckOutDate)}</>}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {next && (
                            <button
                              onClick={() => handleUpdateStatus(b, next.status)}
                              disabled={isUpdating || (next.status === 'CHECKED_IN' && needsRoom(b))}
                              title={next.status === 'CHECKED_IN' && needsRoom(b) ? 'Cần gán phòng lưu trú trước — mở chi tiết đơn để gán' : ''}
                              className={`px-2.5 py-1 rounded-lg text-white font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${next.color}`}
                            >
                              {next.label}
                            </button>
                          )}
                          {/* Nhắc gán phòng: đơn BOARDING chưa có phòng thì không check-in được */}
                          {needsRoom(b) && (b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                            <button
                              onClick={() => openDetail(b)}
                              title="Đơn lưu trú chưa có phòng"
                              className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 font-bold text-[10px] border border-violet-200 hover:bg-violet-100 cursor-pointer"
                            >
                              Gán phòng
                            </button>
                          )}
                          {canCancel(b) && (
                            <button
                              onClick={() => openCancelModal(b)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Trang {page} / {totalPages} · Tổng {pagination?.total} đơn</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg font-bold transition-colors cursor-pointer ${p === page ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ Detail Modal ═══════════════ */}
      {isDetailOpen && selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Booking #{selectedBooking.id}</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {bookingTypeLabels[selectedBooking.bookingType]} · Tạo lúc {formatDateTime(selectedBooking.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedBooking.status).className}`}>
                  {getStatusBadge(selectedBooking.status).label}
                </span>
                <button onClick={() => setIsDetailOpen(false)} className="text-white/70 hover:text-white text-lg font-bold ml-2 cursor-pointer">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Pet + Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Thú cưng</span>
                  <div className="flex items-center gap-3">
                    {selectedBooking.pet?.avatarUrl ? (
                      <img src={selectedBooking.pet.avatarUrl} alt={selectedBooking.pet?.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">🐾</div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{selectedBooking.pet?.name}</div>
                      <div className="text-slate-500">{selectedBooking.pet?.species} · {selectedBooking.pet?.breed || 'Không rõ giống'}</div>
                      <div className="text-slate-500">{selectedBooking.pet?.weight} kg · {selectedBooking.pet?.gender === 'MALE' ? 'Đực' : selectedBooking.pet?.gender === 'FEMALE' ? 'Cái' : 'Không rõ'}</div>
                    </div>
                  </div>
                  {selectedBooking.pet?.allergyNotes && (
                    <div className="bg-rose-50 rounded-lg p-2 border border-rose-200 text-rose-700 font-medium">
                      ⚠️ Dị ứng: {selectedBooking.pet.allergyNotes}
                    </div>
                  )}
                  {selectedBooking.pet?.specialNotes && (
                    <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 text-amber-700 font-medium">
                      📝 {selectedBooking.pet.specialNotes}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Khách hàng</span>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{selectedBooking.user?.fullName}</div>
                    <div className="text-slate-500 mt-1">{selectedBooking.user?.email}</div>
                    <div className="text-slate-500">{selectedBooking.user?.phoneNumber || 'Chưa có SĐT'}</div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-200 text-xs">
                <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Lịch hẹn</span>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-slate-400 block">Check-in dự kiến</span>
                    <span className="font-bold text-slate-900">{formatDateTime(selectedBooking.expectedCheckInDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Check-out dự kiến</span>
                    <span className="font-bold text-slate-900">{formatDateTime(selectedBooking.expectedCheckOutDate)}</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú của chủ nuôi */}
              {selectedBooking.notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs">
                  <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Ghi chú của chủ nuôi</span>
                  <p className="text-slate-700 mt-1 whitespace-pre-line">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Lý do hủy */}
              {selectedBooking.status === 'CANCELLED' && selectedBooking.cancelReason && (
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-200 text-xs">
                  <span className="text-rose-500 font-bold uppercase tracking-wider text-[10px]">Lý do hủy</span>
                  <p className="text-slate-700 mt-1">{selectedBooking.cancelReason}</p>
                </div>
              )}

              {/* Phòng lưu trú (chỉ đơn BOARDING) */}
              {selectedBooking.bookingType === 'BOARDING' && (
                <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-200 text-xs">
                  <span className="text-violet-400 font-bold uppercase tracking-wider text-[10px]">Phòng lưu trú</span>

                  {selectedBooking.bookingBoardingRoom ? (
                    <div className="flex items-center gap-3 mt-2">
                      {selectedBooking.bookingBoardingRoom.boardingRoom?.imageUrl && (
                        <img
                          src={selectedBooking.bookingBoardingRoom.boardingRoom.imageUrl}
                          className="w-12 h-12 rounded-lg object-cover border border-violet-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">
                          {selectedBooking.bookingBoardingRoom.boardingRoom?.name}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {formatVND(selectedBooking.bookingBoardingRoom.pricePerNight)}/đêm
                          {!!selectedBooking.costBreakdown?.stayNights && (
                            <>
                              {' · '}{selectedBooking.costBreakdown.stayNights} đêm ·{' '}
                              <strong className="text-slate-700">
                                {formatVND(selectedBooking.costBreakdown.roomAmount)}
                              </strong>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-violet-100 text-violet-700 font-bold text-[10px]">
                        {selectedBooking.bookingBoardingRoom.boardingRoom?.status}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-rose-600 font-semibold">
                        Đơn lưu trú này chưa được gán phòng. Phải gán phòng trước khi tiếp nhận thú cưng.
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={roomToAssign}
                          onChange={(e) => setRoomToAssign(e.target.value ? Number(e.target.value) : '')}
                          className="flex-1 px-3 py-2 rounded-xl border border-violet-200 bg-white text-xs font-semibold"
                        >
                          <option value="">— Chọn phòng còn trống —</option>
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name} — {formatVND(room.pricePerNight)}/đêm
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!roomToAssign || isAssigningRoom}
                          onClick={() => handleAssignRoom(selectedBooking)}
                          className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isAssigningRoom ? 'Đang gán...' : 'Gán phòng'}
                        </button>
                      </div>
                      {!availableRooms.length && (
                        <p className="text-slate-500">Hiện không có phòng nào trống.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Services */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Danh sách dịch vụ</span>
                <div className="space-y-2">
                  {selectedBooking.bookingServices.map((bs) => (
                    <div key={bs.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200 text-xs">
                      <div className="flex items-center gap-3">
                        {bs.service?.imageUrl ? (
                          <img src={bs.service.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
                            {bs.service?.category === 'CHECK_IN' ? '📋' : bs.service?.category === 'CHECK_OUT' ? '✅' : '✨'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{bs.service?.name}</div>
                          <div className="text-[10px] text-slate-400">{bs.service?.category}</div>
                          {/* Hai bước hệ thống do backend tự quản, không phân công */}
                          {bs.service?.category !== 'CHECK_IN' && bs.service?.category !== 'CHECK_OUT' ? (
                            <select
                              value={bs.staffId ?? ''}
                              disabled={isAssigningStaff}
                              onChange={(e) => handleAssignStaff(bs.id, Number(e.target.value))}
                              className="mt-1 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold disabled:opacity-50"
                            >
                              <option value="">— Chưa phân công —</option>
                              {(staffList ?? []).map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.fullName}{st.specialty ? ` (${st.specialty})` : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            bs.staff && <div className="text-[10px] text-slate-400 mt-0.5">NV: {bs.staff.fullName}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">{formatVND(bs.price)}</div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${bs.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : bs.status === 'IN_PROGRESS' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                          {bs.status}
                        </span>
                        {/* Chỉ bỏ được bước chưa làm, và không phải bước hệ thống */}
                        {canEditServices(selectedBooking)
                          && bs.status === 'PENDING'
                          && bs.service?.category !== 'CHECK_IN'
                          && bs.service?.category !== 'CHECK_OUT' && (
                          <button
                            onClick={() => handleRemoveService(bs)}
                            disabled={isRemovingService}
                            className="block mt-1 text-[9px] font-bold text-rose-600 hover:underline disabled:opacity-50 cursor-pointer"
                          >
                            Bỏ dịch vụ
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thêm dịch vụ phát sinh giữa kỳ */}
                {canEditServices(selectedBooking) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Thêm dịch vụ phát sinh
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={serviceToAdd}
                        onChange={(e) => setServiceToAdd(e.target.value ? Number(e.target.value) : '')}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="">— Chọn dịch vụ —</option>
                        {addableServices(selectedBooking).map((sv) => (
                          <option key={sv.id} value={sv.id}>
                            {sv.name} — {formatVND(sv.basePrice)}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!serviceToAdd || isAddingService}
                        onClick={() => handleAddService(selectedBooking)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        {isAddingService ? 'Đang thêm...' : 'Thêm'}
                      </button>
                    </div>
                    {addableServices(selectedBooking).length === 0 ? (
                      <p className="text-[10px] text-slate-500">Đơn đã có toàn bộ dịch vụ trong bảng giá.</p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Khách phát sinh yêu cầu giữa kỳ (ví dụ đang lưu trú muốn tắm tỉa thêm) thì ghi thêm tại đây.
                        Tổng tiền cập nhật ngay, chốt lại khi bàn giao.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Tổng cộng:</span>
                    <div className="text-lg font-extrabold font-display text-brand-700">{formatVND(getTotalPrice(selectedBooking))}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {nextStatusMap[selectedBooking.status] && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking, nextStatusMap[selectedBooking.status]!.status)}
                      disabled={isUpdating || (nextStatusMap[selectedBooking.status]!.status === 'CHECKED_IN' && needsRoom(selectedBooking))}
                      title={nextStatusMap[selectedBooking.status]!.status === 'CHECKED_IN' && needsRoom(selectedBooking) ? 'Cần gán phòng lưu trú trước' : ''}
                      className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${nextStatusMap[selectedBooking.status]!.color}`}
                    >
                      {isUpdating ? 'Đang xử lý...' : nextStatusMap[selectedBooking.status]!.label}
                    </button>
                  )}
                  {canCancel(selectedBooking) && (
                    <button
                      onClick={() => openCancelModal(selectedBooking)}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200 cursor-pointer"
                    >
                      Hủy đơn
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(selectedBooking)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 border border-slate-200 cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Cancel Confirm Modal ═══════════════ */}
      {isCancelOpen && bookingToCancel && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsCancelOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">✕</div>
              <h3 className="font-bold text-slate-900 mt-3">Hủy đơn đặt lịch?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking #{bookingToCancel.id} — {bookingToCancel.pet?.name} của {bookingToCancel.user?.fullName}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lý do hủy</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Ví dụ: Khách đổi lịch, cửa hàng hết chỗ..."
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none focus:outline-hidden focus:ring-2 focus:ring-rose-200"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Lý do sẽ được lưu vào đơn và chủ nuôi xem được. Có thể để trống.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsCancelOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                Không
              </button>
              <button onClick={handleCancel} disabled={isCancelling} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer disabled:opacity-50">
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Delete Confirm Modal ═══════════════ */}
      {isDeleteOpen && bookingToDelete && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">🗑️</div>
              <h3 className="font-bold text-slate-900 mt-3">Xóa đơn đặt lịch?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking #{bookingToDelete.id} sẽ bị xóa khỏi hệ thống (soft delete). Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer">
                Hủy bỏ
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer disabled:opacity-50">
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
