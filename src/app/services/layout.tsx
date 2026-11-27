'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import AdminShell from '@/components/layout/AdminShell'
import StaffShell from '@/components/layout/StaffShell'
import OwnerShell from '@/components/layout/OwnerShell'

/**
 * /services là trang CÔNG KHAI — landing trỏ tới và khách chưa đăng nhập phải xem được,
 * nên KHÔNG bọc RoleGuard ở đây (bọc vào là khách bị đẩy sang /login).
 *
 * Đã đăng nhập thì hiện khung giao diện theo vai trò để không bị rơi ra khỏi sidebar khi
 * bấm "Bảng giá dịch vụ" trong menu. Tương ứng setPageLayout() ở pages/services/index.vue bên Nuxt.
 */
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <>{children}</>
  if (role === 'ADMIN') return <AdminShell>{children}</AdminShell>
  if (role === 'STAFF') return <StaffShell>{children}</StaffShell>
  return <OwnerShell>{children}</OwnerShell>
}
