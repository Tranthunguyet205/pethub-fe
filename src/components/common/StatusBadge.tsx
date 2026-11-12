'use client'

import { useFormatters } from '@/hooks/useFormatters'
import type { BookingStatus } from '@/types'

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const { getStatusBadge } = useFormatters()
  const badge = getStatusBadge(status)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.className}`}>
      {badge.label}
    </span>
  )
}
