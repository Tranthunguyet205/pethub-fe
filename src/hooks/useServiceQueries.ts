import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceService } from '@/services/services.service'
import type { CreateServiceDto, GetAllServiceParams, UpdateServiceDto } from '@/types'

export const serviceKeys = {
  all: ['services'] as const,
  list: (params?: GetAllServiceParams) => ['services', 'list', params] as const,
  detail: (id: number) => ['services', 'detail', id] as const,
}

export function useServices(params?: GetAllServiceParams) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => serviceService.getAll(params),
  })
}

export function useServiceDetail(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: serviceKeys.detail(id || 0),
    queryFn: () => serviceService.getById(id!),
    enabled: enabled && !!id,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateServiceDto) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceDto }) =>
      serviceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all })
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all })
    },
  })
}
