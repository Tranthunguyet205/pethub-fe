import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import type { LoginRequest } from '@/types'

export const authQueryKeys = {
  login: ['auth', 'login'] as const,
}

export function useAuthQueries() {
  const loginMutation = useMutation({
    mutationKey: authQueryKeys.login,
    mutationFn: (data: LoginRequest) => authService.login(data),
  })

  return {
    loginMutation,
  }
}
