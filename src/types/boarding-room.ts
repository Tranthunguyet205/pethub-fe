export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'

/**
 * Giá phòng tính theo ĐÊM. Lưu trú qua đêm không tính theo giờ.
 * Số đêm được backend đếm theo ngày lịch giờ Việt Nam, tối thiểu 1 đêm.
 */

export interface BoardingRoom {
  id: number
  name: string
  description: string
  pricePerNight: number
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
  /**
   * 'true' = chỉ phòng THỰC SỰ gán được cho đơn lưu trú mới.
   * Khác với status='AVAILABLE': phòng đã bị một đơn CONFIRMED giữ vẫn mang
   * status AVAILABLE (chỉ chuyển OCCUPIED lúc check-in) nhưng gán vào sẽ bị 400.
   * Luôn dùng cờ này cho ô chọn phòng, đừng lọc theo status.
   */
  assignable?: 'true' | 'false'
}

/**
 * Khoảng giá phòng theo đêm — GET /boarding-rooms/price-range
 *
 * Chủ nuôi KHÔNG đọc được danh sách phòng (403), nên form đặt lịch dùng
 * endpoint này để ước lượng tiền phòng khi chưa biết sẽ được xếp phòng nào.
 */
export interface BoardingRoomPriceRange {
  min: number
  max: number
  roomCount: number
  unit: 'NIGHT'
}

export interface CreateBoardingRoomDto {
  name: string
  description: string
  pricePerNight: number
  status?: RoomStatus
  image?: File
}

export interface UpdateBoardingRoomDto {
  name?: string
  description?: string
  pricePerNight?: number
  status?: RoomStatus
  image?: File
}
