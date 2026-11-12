import { pethubFetch } from '@/utils/api'
import type { Service, GetAllServiceParams, CreateServiceDto, UpdateServiceDto, Pagination } from '@/types'

const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (key === 'image' && val instanceof File) {
        formData.append('image', val)
      } else if (key !== 'image' && key !== 'imageUrl') {
        formData.append(key, String(val))
      }
    }
  })
  return formData
}

export const serviceService = {
  getAll(params?: GetAllServiceParams) {
    return pethubFetch<{ data: Service[]; pagination: Pagination }>('/services', { query: params })
  },

  getById(id: number) {
    return pethubFetch<Service>(`/services/${id}`)
  },

  create(data: CreateServiceDto) {
    return pethubFetch<Service>('/services', { method: 'POST', body: toFormData(data) })
  },

  update(id: number, data: UpdateServiceDto) {
    return pethubFetch<Service>(`/services/${id}`, { method: 'PATCH', body: toFormData(data) })
  },

  delete(id: number) {
    return pethubFetch<{ message: string }>(`/services/${id}`, { method: 'DELETE' })
  },
}
