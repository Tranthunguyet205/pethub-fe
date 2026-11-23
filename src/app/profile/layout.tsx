'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import RoleGuard from '@/components/auth/RoleGuard'
import AdminShell from '@/components/layout/AdminShell'
import StaffShell from '@/components/layout/StaffShell'
import OwnerShell from '@/components/layout/OwnerShell'

/**
 * /profile dùng chung cho cả 3 vai trò, nên không nằm trong route group nào.
 * Layout tự chọn khung giao diện theo vai trò — giống setPageLayout() trong
 * pethub-app/app/pages/profile/index.vue.
 */
function ShellByRole({ children }: { children: React.ReactNode }) {
  const { role } = useAuth()
  if (role === 'ADMIN') return <AdminShell>{children}</AdminShell>
  if (role === 'STAFF') return <StaffShell>{children}</StaffShell>
  return <OwnerShell>{children}</OwnerShell>
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <ShellByRole>{children}</ShellByRole>
    </RoleGuard>
  )
}
