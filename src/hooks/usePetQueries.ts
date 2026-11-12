import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { petService } from '@/services/pets.service'
import type { CreatePetDto, GetAllPetParams, UpdatePetDto } from '@/types'

export const petKeys = {
  all: ['pets'] as const,
  myPets: ['pets', 'my-pets'] as const,
  list: (params?: GetAllPetParams) => ['pets', 'list', params] as const,
  detail: (id: number) => ['pets', 'detail', id] as const,
}

export function useMyPets() {
  return useQuery({
    queryKey: petKeys.myPets,
    queryFn: () => petService.getMyPets(),
  })
}

export function usePets(params?: GetAllPetParams) {
  return useQuery({
    queryKey: petKeys.list(params),
    queryFn: () => petService.getAll(params),
  })
}

export function usePetDetail(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: petKeys.detail(id || 0),
    queryFn: () => petService.getById(id!),
    enabled: enabled && !!id,
  })
}

export function useCreatePet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePetDto) => petService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all })
    },
  })
}

export function useUpdatePet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePetDto }) => petService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: petKeys.all })
      queryClient.invalidateQueries({ queryKey: petKeys.detail(variables.id) })
    },
  })
}

export function useDeletePet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all })
    },
  })
}
