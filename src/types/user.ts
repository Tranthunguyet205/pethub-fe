// User roles & mappings (RBAC)
export type UserRole = 'ADMIN' | 'STAFF' | 'OWNER'

export const UserRoleMapping: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  STAFF: '/staff/dashboard',
  OWNER: '/dashboard',
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface UserQueryParams {
  page?: number
  limit?: number
  role?: UserRole | 'ALL'
  search?: string
}

export interface CreateUserDto {
  fullName: string
  email: string
  phoneNumber: string
  role: 'OWNER' | 'STAFF' | 'ADMIN'
  password?: string
  specialty?: string
  avatar?: File | null
}

export interface UpdateUserDto {
  fullName?: string
  phoneNumber?: string
  role?: UserRole
  specialty?: string | null
  avatar?: File | null
  avatarUrl?: string | null
}

export interface UpdateProfileDto {
  fullName?: string
  phoneNumber?: string
  avatar?: File | null
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

export interface User {
  id: string | number
  fullName: string
  email: string
  phoneNumber: string
  role: UserRole
  petCount?: number
  specialty?: string | null
  isDelete?: boolean
  status?: 'ACTIVE' | 'INACTIVE'
  avatarUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  meta?: Pagination
}
