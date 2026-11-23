import type { Pet } from './pet'
import type { Service } from './service'
import type { BoardingRoom } from './boarding-room'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type BookingType = 'GROOMING' | 'BOARDING'

export type ServiceItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface BookingUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl?: string | null
}

export interface BookingStaff {
  id: number
  fullName: string
  email: string
}

export interface BookingServiceItem {
  id: number
  bookingId: number
  serviceId: number
  service: Service
  staffId: number | null
  staff: BookingStaff | null
  actualStartTime: string | null
  actualEndTime: string | null
  status: ServiceItemStatus
  imageUrl: string | null
  /** Ghi chú chăm sóc của staff cho riêng bước này */
  notes?: string | null
  price: number
  createdAt: string
  updatedAt: string
}

export interface BookingBoardingRoom {
  id: number
  bookingId: number
  boardingRoomId: number
  /**
   * Đơn giá CHỐT tại thời điểm gán phòng.
   * Dùng field này để tính tiền, không dùng boardingRoom.pricePerNight
   * (giá phòng có thể đã bị admin đổi sau đó).
   */
  pricePerNight: number
  boardingRoom: BoardingRoom
}

export interface CostBreakdown {
  serviceAmount: number
  roomAmount: number
  /** Số ĐÊM lưu trú. Đơn GROOMING luôn là 0. */
  stayNights: number
  totalAmount: number
}

export interface Booking {
  id: number
  userId: number
  user: BookingUser
  petId: number
  pet: Pet
  bookingType: BookingType
  status: BookingStatus
  expectedCheckInDate: string | null
  expectedCheckOutDate: string | null
  /** Ghi chú của chủ nuôi khi đặt lịch */
  notes?: string | null
  cancelReason?: string | null
  cancelledAt?: string | null
  /** Chỉ được backend chốt khi đơn COMPLETED; trước đó là 0 */
  totalAmount: number
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED'
  isDelete: boolean
  createdAt: string
  updatedAt: string
  bookingServices: BookingServiceItem[]
  bookingBoardingRoom?: BookingBoardingRoom | null
  /** Có ở cả list và detail. Dùng cái này để hiện tổng tiền, nó gồm cả tiền phòng. */
  costBreakdown?: CostBreakdown
}

export interface GetAllBookingParams {
  page?: number
  limit?: number
  status?: BookingStatus
  bookingType?: BookingType
  petId?: number
  userId?: number
  /** Đơn có ít nhất 1 bước dịch vụ được phân công cho nhân viên này */
  staffId?: number
  search?: string
  /** 'YYYY-MM-DD' được backend hiểu là đầu/cuối ngày theo GIỜ VIỆT NAM */
  from?: string
  to?: string
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED'
}

export interface CreateBookingDto {
  petId: number
  bookingType: BookingType
  userId?: number
  expectedCheckInDate?: string
  /** BẮT BUỘC với đơn BOARDING, thiếu là 400 */
  expectedCheckOutDate?: string
  serviceIds?: number[]
  notes?: string
}

export interface UpdateBookingStatusDto {
  status: BookingStatus
  /** Chỉ có tác dụng khi status = CANCELLED */
  cancelReason?: string
}

/**
 * Sửa đơn — PATCH /bookings/:id
 *
 * OWNER chỉ sửa được đơn của mình khi còn PENDING; ADMIN/STAFF khi PENDING hoặc
 * CONFIRMED. Từ CHECKED_IN trở đi backend khoá (400).
 * Không dùng để đổi trạng thái — việc đó đi qua updateStatus().
 */
export interface UpdateBookingDto {
  expectedCheckInDate?: string
  expectedCheckOutDate?: string
  /** Gửi chuỗi rỗng để xóa ghi chú */
  notes?: string
  /**
   * Nếu truyền, TOÀN BỘ dịch vụ khách chọn sẽ bị thay thế.
   * Hai bước hệ thống CHECK_IN / CHECK_OUT luôn được backend giữ nguyên.
   */
  serviceIds?: number[]
}

/**
 * Cập nhật một BƯỚC chăm sóc — PATCH /booking-services/:id
 *
 * QUY TẮC ẢNH: không gửi `imageUrl` -> giữ nguyên ảnh hiện tại.
 * Gửi chuỗi rỗng -> gỡ ảnh. Gửi `file` -> thay ảnh mới.
 */
export interface UpdateBookingServiceDto {
  status?: ServiceItemStatus
  actualStartTime?: string
  actualEndTime?: string
  notes?: string
  staffId?: number
  imageUrl?: string
  file?: File
}

/**
 * Thêm dịch vụ phát sinh vào đơn đang chạy — POST /booking-services
 *
 * Backend chặn: dịch vụ hệ thống (CHECK_IN/CHECK_OUT), dịch vụ đã có trong đơn,
 * đơn đã COMPLETED/CANCELLED/NO_SHOW, staffId không đúng role STAFF.
 */
export interface AddBookingServiceDto {
  bookingId: number
  serviceId: number
  staffId?: number
}

export interface SlotAvailability {
  time: string
  current: number
  max: number
  available: boolean
}

export interface AvailabilityResponse {
  date: string
  slots: SlotAvailability[]
}

export interface QueryAvailabilityParams {
  date: string
  bookingType?: BookingType
}
