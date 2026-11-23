import { pethubFetch } from '@/utils/api'
import type {
  Booking,
  GetAllBookingParams,
  CreateBookingDto,
  UpdateBookingStatusDto,
  UpdateBookingDto,
  UpdateBookingServiceDto,
  AddBookingServiceDto,
  BookingServiceItem,
  AvailabilityResponse,
  QueryAvailabilityParams,
  Pagination,
} from '@/types'

export const bookingsService = {
  getAll(params?: GetAllBookingParams) {
    return pethubFetch<{ data: Booking[]; meta: Pagination }>('/bookings', { query: params })
  },

  getById(id: number) {
    return pethubFetch<Booking>(`/bookings/${id}`)
  },

  create(dto: CreateBookingDto) {
    return pethubFetch<Booking>('/bookings', {
      method: 'POST',
      body: dto,
    })
  },

  /** Sửa đơn: đổi lịch hẹn / ghi chú / danh sách dịch vụ */
  update(id: number, dto: UpdateBookingDto) {
    return pethubFetch<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: dto,
    })
  },

  updateStatus(id: number, dto: UpdateBookingStatusDto) {
    return pethubFetch<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: dto,
    })
  },

  delete(id: number) {
    return pethubFetch<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    })
  },

  getAvailability(params: QueryAvailabilityParams) {
    return pethubFetch<AvailabilityResponse>('/bookings/availability', { query: params })
  },

  /** Chủ nuôi / admin hủy đơn kèm lý do */
  cancel(id: number, cancelReason?: string) {
    return bookingsService.updateStatus(id, { status: 'CANCELLED', cancelReason })
  },

  // ---- Các bước dịch vụ trong đơn (/booking-services) ----
  // Gộp vào file này vì /booking-services không có endpoint GET riêng — dữ liệu
  // luôn đọc lồng trong booking, và cache dùng chung key của booking.

  /**
   * QUAN TRỌNG: chỉ gửi `imageUrl` khi thực sự muốn đổi hoặc gỡ ảnh.
   * Không gửi -> backend giữ nguyên ảnh. Gửi chuỗi rỗng -> gỡ ảnh.
   */
  updateServiceItem(id: number, dto: UpdateBookingServiceDto) {
    if (dto.file) {
      const formData = new FormData()
      formData.append('file', dto.file)
      if (dto.status) formData.append('status', dto.status)
      if (dto.actualStartTime) formData.append('actualStartTime', dto.actualStartTime)
      if (dto.actualEndTime) formData.append('actualEndTime', dto.actualEndTime)
      if (dto.notes !== undefined) formData.append('notes', dto.notes)
      if (dto.staffId !== undefined) formData.append('staffId', String(dto.staffId))
      return pethubFetch<BookingServiceItem>(`/booking-services/${id}`, {
        method: 'PATCH',
        body: formData,
      })
    }
    const { file, ...body } = dto
    return pethubFetch<BookingServiceItem>(`/booking-services/${id}`, {
      method: 'PATCH',
      body,
    })
  },

  assignStaff(serviceItemId: number, staffId: number) {
    return bookingsService.updateServiceItem(serviceItemId, { staffId })
  },

  /** Thêm dịch vụ phát sinh vào đơn đang chạy */
  addServiceItem(dto: AddBookingServiceDto) {
    return pethubFetch<BookingServiceItem>('/booking-services', {
      method: 'POST',
      body: dto,
    })
  },

  /** Bỏ một dịch vụ khỏi đơn (backend chặn xoá hai bước hệ thống) */
  removeServiceItem(serviceItemId: number) {
    return pethubFetch<{ message: string }>(`/booking-services/${serviceItemId}`, {
      method: 'DELETE',
    })
  },

  // ---- Phòng lưu trú trong đơn (/booking-boarding-rooms) ----
  assignRoom(bookingId: number, boardingRoomId: number) {
    return pethubFetch('/booking-boarding-rooms', {
      method: 'POST',
      body: { bookingId, boardingRoomId },
    })
  },
}
