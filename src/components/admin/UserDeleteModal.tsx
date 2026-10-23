'use client'

import React, { useState } from 'react'
import type { User } from '@/types'
import { useDeleteUser } from '@/hooks/useUserQueries'

interface UserDeleteModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSuccess: (deletedUser: User) => void
}

export function UserDeleteModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: UserDeleteModalProps) {
  const deleteUserMutation = useDeleteUser()
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen || !user) return null

  const handleConfirmDelete = async () => {
    setErrorMessage('')
    try {
      await deleteUserMutation.mutateAsync(user.id)
      onSuccess(user)
      onClose()
    } catch (err: any) {
      console.error('Lỗi khi xóa mềm user:', err)
      setErrorMessage(
        err?.data?.message || err?.message || 'Không thể vô hiệu hóa tài khoản này!'
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Xóa mềm người dùng (DELETE)</h3>
            <p className="text-[11px] text-slate-500">Chuyển sang trạng thái INACTIVE</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Bạn có chắc chắn muốn xóa mềm / vô hiệu hóa tài khoản của{' '}
          <strong className="text-slate-900">{user.fullName}</strong> (ID:{' '}
          <span className="font-mono">#{user.id}</span>)?
        </p>

        <p className="text-[11px] text-slate-400">
          * Hệ thống sẽ gọi API{' '}
          <code className="bg-slate-100 text-rose-600 px-1 py-0.5 rounded font-mono">
            DELETE /api/users/{user.id}
          </code>{' '}
          để cập nhật isDelete = true và vô hiệu hóa quyền đăng nhập.
        </p>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteUserMutation.isPending}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {deleteUserMutation.isPending && <span className="animate-spin text-xs">⏳</span>}
            <span>{deleteUserMutation.isPending ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
