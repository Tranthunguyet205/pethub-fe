export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface PetOwner {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  role?: string
}

export interface Pet {
  id: number
  userId: number
  user?: PetOwner
  name: string
  species: string
  breed: string | null
  gender: PetGender
  birthDate: string | null
  weight: number
  avatarUrl: string | null
  allergyNotes: string | null
  specialNotes: string | null
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface GetAllPetParams {
  search?: string
  species?: string
  gender?: PetGender
  userId?: number
  page?: number
  limit?: number
}

export interface CreatePetDto {
  name: string
  species: string
  breed?: string
  gender?: PetGender
  birthDate?: string
  weight: number
  allergyNotes?: string
  specialNotes?: string
  userId?: number
  avatar?: File
}

export interface UpdatePetDto {
  name?: string
  species?: string
  breed?: string
  gender?: PetGender
  birthDate?: string
  weight?: number
  allergyNotes?: string
  specialNotes?: string
  avatar?: File
}
