import { pethubFetch } from '@/utils/api'
import type { ApiResponse, LoginRequest, LoginResponse } from '@/types'

export const authService = {
  login: (data: LoginRequest) =>
    pethubFetch<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: data,
    }),

  refreshToken: (refreshToken: string) =>
    pethubFetch<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
}
