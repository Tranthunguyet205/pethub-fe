'use client'

import React, { useState } from 'react'
import type { User } from '@/types'

interface UserDetailModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserDetailModal({
  isOpen,
  user,
  onClose,
  onEdit,
  onDelete,
}: UserDetailModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !user) return null

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    } catch {
      return dateStr
    }
  }

  const copyText = async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Thông tin cá nhân</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-600'
                      : user.role === 'STAFF'
                      ? 'bg-indigo-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {user.fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base truncate">{user.fullName}</h4>
                <span className="text-xs text-slate-400 font-mono">#{user.id}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'STAFF'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span>{user.role === 'ADMIN' ? '⚙️' : user.role === 'STAFF' ? '✂️' : '🐶'}</span>
                  <span>{user.role}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    !user.isDelete ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      !user.isDelete ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  ></span>
                  {!user.isDelete ? 'Hoạt động' : 'Đã vô hiệu'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 divide-y divide-slate-100 text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Email</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <span>{user.email}</span>
                <button
                  type="button"
                  onClick={() => copyText(user.email)}
                  className="text-slate-400 hover:text-purple-600 text-[11px] p-0.5 cursor-pointer"
                  title="Sao chép"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Số điện thoại</span>
              <span className="font-mono font-medium text-slate-800">{user.phoneNumber || '—'}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Chuyên môn</span>
              <span className="font-medium text-slate-800">{user.specialty || 'Không có'}</span>
            </div>

            {user.role === 'OWNER' && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500">Số thú cưng</span>
                <span className="font-medium text-slate-800">🐾 {user.petCount ?? 0} bé</span>
              </div>
            )}

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Ngày tạo</span>
              <span className="text-slate-700">{formatDateTime(user.createdAt)}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Cập nhật lần cuối</span>
              <span className="text-slate-700">{formatDateTime(user.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onEdit(user)
                onClose()
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>✏️</span>
              <span>Chỉnh sửa</span>
            </button>

            {user.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  onDelete(user)
                  onClose()
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Xóa mềm / vô hiệu hóa người dùng (DELETE /api/users/{id})"
              >
                <span>🔒</span>
                <span>Vô hiệu hóa</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
