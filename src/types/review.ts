// Review & Feedback (Section 19)
export interface Review {
  id: string
  bookingId: string
  ownerName: string
  petName: string
  serviceName: string
  staffName?: string
  rating: number // 1 to 5
  comment: string
  createdAt: string
}
