export * from './user'
export * from './pet'
export * from './service'
export * from './booking'
export * from './boarding-room'

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}
