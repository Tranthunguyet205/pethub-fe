import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import type {
  ChangePasswordDto,
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserQueryParams,
} from '@/types'

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: UserQueryParams) => ['users', 'list', params] as const,
    detail: (id: string | number) => ['users', 'detail', String(id)] as const,
    staff: ['users', 'staff'] as const,
    stats: ['users', 'stats'] as const,
  },
}

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userService.getAll(params),
  })
}

/**
 * Danh sách nhân viên để phân công booking.
 * GET /users là ADMIN-only nên UI của Staff không dùng thay được.
 * Ít đổi -> cache lâu.
 */
export function useStaffList() {
  return useQuery({
    queryKey: queryKeys.users.staff,
    queryFn: () => userService.getStaffList(),
    staleTime: 5 * 60 * 1000,
  })
}

/** Số user theo vai trò trên toàn hệ thống — không phụ thuộc trang/bộ lọc đang xem */
export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: () => userService.getStats(),
  })
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => userService.getMe(),
  })
}

export function useUserDetail(id: string | number | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(id || ''),
    queryFn: () => userService.getById(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserDto | FormData) => userService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateUserDto | FormData }) =>
      userService.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
    },
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfileDto | FormData) => userService.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordDto) => userService.changePassword(payload),
  })
}
