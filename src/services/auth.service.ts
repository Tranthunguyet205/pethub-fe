import { pethubFetch } from '@/utils/api'
import type { LoginRequest, LoginResponse } from '@/types'

export const authService = {
  // Backend trả thẳng { user, accessToken, refreshToken }, không bọc { success, data }
  login: (data: LoginRequest) =>
    pethubFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data,
    }),

  refreshToken: (refreshToken: string) =>
    pethubFetch<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    }),
}
