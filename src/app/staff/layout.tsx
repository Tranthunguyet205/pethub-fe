'use client'

import React from 'react'
import RoleGuard from '@/components/auth/RoleGuard'
import StaffShell from '@/components/layout/StaffShell'

/**
 * Khung giao diện staff nằm ở components/layout/StaffShell.tsx
 * (tách ra để /profile dùng lại được, vì layout.tsx không được export thêm).
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="STAFF">
      <StaffShell>{children}</StaffShell>
    </RoleGuard>
  )
}
