'use client'

import React from 'react'
import RoleGuard from '@/components/auth/RoleGuard'
import OwnerShell from '@/components/layout/OwnerShell'

/**
 * Layout cho mọi trang của chủ nuôi — tương đương pethub-app/app/layouts/owner.vue.
 * Route group (owner) không làm đổi URL: /dashboard, /pets, /bookings... giữ nguyên.
 * Khung giao diện nằm ở components/layout/OwnerShell.tsx để /profile dùng lại được.
 */
export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="OWNER">
      <OwnerShell>{children}</OwnerShell>
    </RoleGuard>
  )
}
