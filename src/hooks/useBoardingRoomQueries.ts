import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardingRoomService } from '@/services/boarding-rooms.service'
import type {
  CreateBoardingRoomDto,
  GetAllBoardingRoomParams,
  UpdateBoardingRoomDto,
} from '@/types'

export const boardingRoomKeys = {
  all: ['boarding-rooms'] as const,
  list: (params?: GetAllBoardingRoomParams) => ['boarding-rooms', 'list', params] as const,
  detail: (id: number) => ['boarding-rooms', 'detail', id] as const,
  priceRange: ['boarding-rooms', 'price-range'] as const,
}

export function useBoardingRooms(params?: GetAllBoardingRoomParams) {
  return useQuery({
    queryKey: boardingRoomKeys.list(params),
    queryFn: () => boardingRoomService.getAll(params),
  })
}

/**
 * Khoảng giá phòng theo đêm, cho form đặt lịch của chủ nuôi.
 * Chủ nuôi KHÔNG đọc được danh sách phòng (403) nên phải dùng endpoint này.
 * Bảng giá ít đổi -> cache lâu.
 */
export function useBoardingRoomPriceRange() {
  return useQuery({
    queryKey: boardingRoomKeys.priceRange,
    queryFn: () => boardingRoomService.getPriceRange(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useBoardingRoomDetail(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: boardingRoomKeys.detail(id || 0),
    queryFn: () => boardingRoomService.getById(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateBoardingRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBoardingRoomDto) => boardingRoomService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}

export function useUpdateBoardingRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBoardingRoomDto }) =>
      boardingRoomService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.detail(variables.id) })
    },
  })
}

export function useDeleteBoardingRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => boardingRoomService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardingRoomKeys.all })
    },
  })
}
