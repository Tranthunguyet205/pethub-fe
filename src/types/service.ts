export type ServiceCategory =
  | 'CHECK_IN'
  | 'BATH_AND_DRY'
  | 'HAIRCUT'
  | 'HYGIENE'
  | 'FULL_GROOMING'
  | 'CHECK_OUT'
  | 'ASSIGN_ROOM'
  | 'FEEDING'
  | 'WATER'
  | 'WALKING'
  | 'MEDICATION'
  | 'CLEANING'
  | 'DAILY_HEALTH_CHECK'

export interface Service {
  id: number
  name: string
  description: string | null
  basePrice: number
  durationMinutes: number
  category: ServiceCategory
  imageUrl: string | null
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface GetAllServiceParams {
  search?: string
  category?: ServiceCategory
  page?: number
  limit?: number
}

export interface CreateServiceDto {
  name: string
  description?: string
  basePrice: number
  durationMinutes: number
  category: ServiceCategory
  image?: File
}

export interface UpdateServiceDto {
  name?: string
  description?: string
  basePrice?: number
  durationMinutes?: number
  image?: File
}
