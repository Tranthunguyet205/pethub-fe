'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

/**
 * Chặn truy cập theo vai trò — tương đương pethub-app/app/middleware/auth.global.ts.
 * - `role` là một hoặc nhiều vai trò được phép.
 * - Bỏ trống `role` = chỉ cần đã đăng nhập (vd: /profile dùng chung cho mọi vai trò).
 * Sai vai trò hoặc chưa đăng nhập → đưa về /login.
 * Trong lúc chưa đọc xong cookie thì không render nội dung để tránh nháy trang.
 */
export default function RoleGuard({
  role,
  children,
}: {
  role?: UserRole | UserRole[]
  children: React.ReactNode
}) {
  const { role: currentRole, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const allowedRoles = role === undefined ? null : Array.isArray(role) ? role : [role]
  const allowed =
    isAuthenticated && (allowedRoles === null || (!!currentRole && allowedRoles.includes(currentRole)))

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace('/login')
    }
  }, [isLoading, allowed, router])

  if (isLoading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <span className="animate-spin">⏳</span>
          <span>Đang kiểm tra quyền truy cập...</span>
        </span>
      </div>
    )
  }

  return <>{children}</>
}
