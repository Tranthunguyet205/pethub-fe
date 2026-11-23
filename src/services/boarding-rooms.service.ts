import { pethubFetch } from '@/utils/api'
import type {
  BoardingRoom,
  GetAllBoardingRoomParams,
  BoardingRoomPriceRange,
  CreateBoardingRoomDto,
  UpdateBoardingRoomDto,
  Pagination,
} from '@/types'

const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (key === 'image' && val instanceof File) {
        formData.append('image', val)
      } else if (key !== 'image' && key !== 'imageUrl') {
        formData.append(key, String(val))
      }
    }
  })
  return formData
}

export const boardingRoomService = {
  getAll(params?: GetAllBoardingRoomParams) {
    return pethubFetch<{ data: BoardingRoom[]; meta: Pagination }>('/boarding-rooms', {
      query: params,
    })
  },

  /** Khoảng giá theo đêm — chủ nuôi gọi được, không trả danh sách phòng */
  getPriceRange() {
    return pethubFetch<BoardingRoomPriceRange>('/boarding-rooms/price-range')
  },

  getById(id: number) {
    return pethubFetch<BoardingRoom>(`/boarding-rooms/${id}`)
  },

  create(data: CreateBoardingRoomDto) {
    return pethubFetch<BoardingRoom>('/boarding-rooms', {
      method: 'POST',
      body: toFormData(data),
    })
  },

  update(id: number, data: UpdateBoardingRoomDto) {
    return pethubFetch<BoardingRoom>(`/boarding-rooms/${id}`, {
      method: 'PATCH',
      body: toFormData(data),
    })
  },

  delete(id: number) {
    return pethubFetch<{ message: string }>(`/boarding-rooms/${id}`, { method: 'DELETE' })
  },
}
