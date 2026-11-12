import { pethubFetch } from '@/utils/api'
import type {
  Booking,
  GetAllBookingParams,
  CreateBookingDto,
  UpdateBookingStatusDto,
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
}
