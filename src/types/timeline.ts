// Pet Care Timeline - Core Showcase Feature (Section 6, 14)
export type TimelineEventType =
  | 'CHECK_IN'
  | 'HEALTH_CHECK'
  | 'FEEDING'
  | 'WALKING'
  | 'MEDICATION'
  | 'BATH'
  | 'DRYING'
  | 'GROOMING'
  | 'NAIL_TRIM'
  | 'EAR_CLEANING'
  | 'PHOTO'
  | 'NOTE'
  | 'CHECK_OUT'

export interface CareTimelineEvent {
  id: number
  bookingId: number
  time: string // HH:mm
  type: TimelineEventType
  title: string
  staffName: string
  description: string
  images?: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'
}

// Care Checklist (Section 13)
export interface ChecklistItem {
  id: number
  label: string
  type: TimelineEventType
  isDone: boolean
  completedAt?: string
  note?: string
}
