import type { Pet } from './pet'
import type { Service } from './service'

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
  price: number
  createdAt: string
  updatedAt: string
}

export interface BookingBoardingRoom {
  id: number
  bookingId: number
  boardingRoomId: number
  boardingRoom: {
    id: number
    name: string
    roomType: string
    status: string
  }
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
  isDelete: boolean
  createdAt: string
  updatedAt: string
  bookingServices: BookingServiceItem[]
  bookingBoardingRoom?: BookingBoardingRoom | null
}

export interface GetAllBookingParams {
  page?: number
  limit?: number
  status?: BookingStatus
  bookingType?: BookingType
  petId?: number
  userId?: number
  search?: string
}

export interface CreateBookingDto {
  petId: number
  bookingType: BookingType
  userId?: number
  expectedCheckInDate?: string
  expectedCheckOutDate?: string
  serviceIds?: number[]
}

export interface UpdateBookingStatusDto {
  status: BookingStatus
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
