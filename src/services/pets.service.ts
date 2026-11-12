import { pethubFetch } from '@/utils/api'
import type { Pet, GetAllPetParams, CreatePetDto, UpdatePetDto, Pagination } from '@/types'

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

export const petService = {
  getMyPets() {
    return pethubFetch<Pet[]>('/pets/my-pets')
  },

  getAll(params?: GetAllPetParams) {
    return pethubFetch<{ data: Pet[]; meta: Pagination }>('/pets', { query: params })
  },

  getById(id: number) {
    return pethubFetch<Pet>(`/pets/${id}`)
  },

  create(data: CreatePetDto) {
    return pethubFetch<Pet>('/pets', { method: 'POST', body: toFormData(data) })
  },

  update(id: number, data: UpdatePetDto) {
    return pethubFetch<Pet>(`/pets/${id}`, { method: 'PATCH', body: toFormData(data) })
  },

  delete(id: number) {
    return pethubFetch<{ message: string }>(`/pets/${id}`, { method: 'DELETE' })
  },
}
