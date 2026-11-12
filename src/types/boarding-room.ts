export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'

export interface BoardingRoom {
  id: number
  name: string
  description: string
  pricePerHour: number
  status: RoomStatus
  imageUrl: string | null
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface GetAllBoardingRoomParams {
  page?: number
  limit?: number
  search?: string
  status?: RoomStatus
}

export interface CreateBoardingRoomDto {
  name: string
  description: string
  pricePerHour: number
  status?: RoomStatus
  image?: File
}

export interface UpdateBoardingRoomDto {
  name?: string
  description?: string
  pricePerHour?: number
  status?: RoomStatus
  image?: File
}
