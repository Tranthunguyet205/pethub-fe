import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '@/services/bookings.service'
import { boardingRoomKeys } from './useBoardingRoomQueries'
import type {
  AddBookingServiceDto,
  CreateBookingDto,
  GetAllBookingParams,
  UpdateBookingDto,
  UpdateBookingServiceDto,
  UpdateBookingStatusDto,
  QueryAvailabilityParams,
} from '@/types'

export const bookingKeys = {
  all: ['bookings'] as const,
  list: (params?: GetAllBookingParams) => ['bookings', 'list', params] as const,
  detail: (id: number) => ['bookings', 'detail', id] as const,
  availability: (params?: QueryAvailabilityParams) => ['bookings', 'availability', params] as const,
}

export function useBookings(params?: GetAllBookingParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingsService.getAll(params),
  })
}

export function useBookingDetail(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.detail(id || 0),
    queryFn: () => bookingsService.getById(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateBookingDto) => bookingsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/**
 * Chuyển trạng thái đơn theo máy trạng thái của backend.
 *
 * Phải invalidate CẢ phòng lưu trú: backend tự đổi RoomStatus trong cùng
 * transaction (CHECKED_IN -> OCCUPIED, COMPLETED/CANCELLED -> AVAILABLE).
 * Thiếu bước này thì trang /admin/boarding-rooms vẫn hiện trạng thái cũ.
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateBookingStatusDto }) =>
      bookingsService.updateStatus(id, dto),
    onSuccess: () => {
      // bookingKeys.all là tiền tố của list/detail/availability nên invalidate nó là đủ
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}

/** Sửa đơn: đổi lịch hẹn / ghi chú / danh sách dịch vụ */
export function useUpdateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateBookingDto }) =>
      bookingsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/** Hủy đơn kèm lý do. Hủy cũng nhả phòng ở backend. */
export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cancelReason }: { id: number; cancelReason?: string }) =>
      bookingsService.cancel(id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}

/**
 * Cập nhật một BƯỚC chăm sóc trong đơn.
 *
 * BookingService không có query riêng — nó nằm lồng trong booking, nên phải
 * invalidate key của booking, không phải key của chính nó.
 */
export function useUpdateBookingServiceItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateBookingServiceDto }) =>
      bookingsService.updateServiceItem(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/** Phân công nhân viên cho một bước dịch vụ */
export function useAssignStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ serviceItemId, staffId }: { serviceItemId: number; staffId: number }) =>
      bookingsService.assignStaff(serviceItemId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/** Thêm dịch vụ phát sinh (bé đang lưu trú, chủ gọi xin tắm tỉa thêm) */
export function useAddBookingServiceItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: AddBookingServiceDto) => bookingsService.addServiceItem(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/** Bỏ một dịch vụ khỏi đơn */
export function useRemoveBookingServiceItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceItemId: number) => bookingsService.removeServiceItem(serviceItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
  })
}

/**
 * Gán phòng lưu trú cho đơn BOARDING.
 * Bắt buộc phải có phòng trước khi backend cho phép CONFIRMED -> CHECKED_IN.
 */
export function useAssignRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, boardingRoomId }: { bookingId: number; boardingRoomId: number }) =>
      bookingsService.assignRoom(bookingId, boardingRoomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      // Xoá mềm đơn đang CHECKED_IN/IN_PROGRESS cũng nhả phòng ở backend
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}

export function useBookingAvailability(params: QueryAvailabilityParams | undefined) {
  return useQuery({
    queryKey: bookingKeys.availability(params),
    queryFn: () => bookingsService.getAvailability(params!),
    enabled: !!params?.date,
  })
}
