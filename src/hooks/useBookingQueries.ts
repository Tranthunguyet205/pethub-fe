import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '@/services/bookings.service'
import type {
  CreateBookingDto,
  GetAllBookingParams,
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

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateBookingStatusDto }) =>
      bookingsService.updateStatus(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
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
