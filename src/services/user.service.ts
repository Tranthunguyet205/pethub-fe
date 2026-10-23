import { pethubFetch } from '@/utils/api'
import type {
  ApiResponse,
  ChangePasswordDto,
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
  User,
  UserQueryParams,
} from '@/types'

const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (key === 'avatar' && val instanceof File) {
        formData.append('avatar', val)
      } else if (key !== 'avatar' && key !== 'avatarUrl') {
        formData.append(key, String(val))
      }
    }
  })
  return formData
}

export const userService = {
  // 1. Lấy danh sách người dùng kèm phân trang & bộ lọc (Admin Only)
  getAll: (params?: UserQueryParams) => {
    const query: Record<string, any> = {}
    if (params?.page) query.page = params.page
    if (params?.limit) query.limit = params.limit
    if (params?.role && params.role !== 'ALL') query.role = params.role
    if (params?.search && params.search.trim()) query.search = params.search.trim()

    return pethubFetch<ApiResponse<User[]>>('/users', { query })
  },

  // 2. Lấy thông tin cá nhân hiện tại
  getMe: () => pethubFetch<ApiResponse<User>>('/users/me'),

  // 3. Cập nhật thông tin cá nhân & upload avatar (Update Me)
  updateMe: (data: UpdateProfileDto | FormData) => {
    const body = data instanceof FormData ? data : toFormData(data)
    return pethubFetch<ApiResponse<User>>('/users/me', {
      method: 'PATCH',
      body,
    })
  },

  // 4. Đổi mật khẩu cá nhân
  changePassword: (data: ChangePasswordDto) =>
    pethubFetch<ApiResponse<any>>('/users/me/change-password', {
      method: 'PATCH',
      body: data,
    }),

  // 5. Xem chi tiết người dùng theo ID (Admin Only)
  getById: (id: string | number) => pethubFetch<ApiResponse<User>>(`/users/${id}`),

  // 6. Tạo người dùng mới & upload avatar (Admin Only)
  createUser: (data: CreateUserDto | FormData) => {
    let body: any = data
    if (!(data instanceof FormData) && (data as CreateUserDto).avatar instanceof File) {
      body = toFormData(data)
    }
    return pethubFetch<ApiResponse<User>>('/users', {
      method: 'POST',
      body,
    })
  },

  // 7. Cập nhật thông tin người dùng theo ID & upload avatar (Admin Only)
  updateUser: (id: string | number, data: UpdateUserDto | FormData) => {
    const body = data instanceof FormData ? data : toFormData(data)
    return pethubFetch<ApiResponse<User>>(`/users/${id}`, {
      method: 'PATCH',
      body,
    })
  },

  // 8. Xóa mềm người dùng theo ID (Admin Only)
  deleteUser: (id: string | number) =>
    pethubFetch<ApiResponse<any>>(`/users/${id}`, {
      method: 'DELETE',
    }),
}
