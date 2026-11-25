// Notifications (Section 18)
export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PICKUP_READY'
  | 'PAYMENT_COMPLETED'
  | 'REMINDER'

export interface NotificationItem {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  linkUrl?: string
}
