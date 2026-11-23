'use client'

import React from 'react'
import RoleGuard from '@/components/auth/RoleGuard'
import AdminShell from '@/components/layout/AdminShell'

/**
 * Khung giao diện admin nằm ở components/layout/AdminShell.tsx
 * (tách ra để /profile dùng lại được, vì layout.tsx không được export thêm).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  )
}
