'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { UpdateUserDto, User, UserRole } from '@/types'
import { useUpdateUser } from '@/hooks/useUserQueries'

interface UserEditModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSuccess: (updated: Partial<User>) => void
  onDelete: (user: User) => void
}

const specialtyOptions = [
  'Chuyên viên Grooming & Spa',
  'Bác sĩ thú y (Khám & Tiêm phòng)',
  'Chăm sóc nội trú & Boarding',
  'Lễ tân & Điều phối dịch vụ',
]

export function UserEditModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  onDelete,
}: UserEditModalProps) {
  const updateUserMutation = useUpdateUser()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState<UserRole>('OWNER')
  const [specialty, setSpecialty] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName || '')
      setPhoneNumber(user.phoneNumber || '')
      setRole(user.role || 'OWNER')
      setSpecialty(user.specialty || '')
      setAvatarFile(null)
      setAvatarPreview(user.avatarUrl || '')
      setErrorMessage('')
      setSuccessMessage('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh khác!')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  const removeSelectedFile = () => {
    setAvatarFile(null)
    setAvatarPreview(user.avatarUrl || '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên!')
      return
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại!')
      return
    }

    setErrorMessage('')
    const payload: UpdateUserDto = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
      specialty: role === 'STAFF' ? specialty.trim() || null : null,
      avatar: avatarFile || undefined,
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        payload,
      })

      setSuccessMessage('Cập nhật thông tin thành công!')
      onSuccess({ ...user, ...payload })
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err: any) {
      console.error('Lỗi khi cập nhật:', err)
      setErrorMessage(
        err?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng!'
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
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Chỉnh sửa người dùng</h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: #{user.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email (Readonly) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email đăng nhập</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium text-xs"
            />
          </div>

          {/* FullName */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-medium"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Vai trò (Role) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['OWNER', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === r
                      ? r === 'ADMIN'
                        ? 'bg-purple-50 border-purple-400 text-purple-700 ring-2 ring-purple-300'
                        : r === 'STAFF'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-300'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-300'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <span>{r === 'ADMIN' ? '⚙️' : r === 'STAFF' ? '✂️' : '🐶'}</span>
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specialty (Staff only) */}
          {role === 'STAFF' && (
            <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
              <label className="block font-bold text-indigo-900">
                Chuyên môn nhân viên kỹ thuật
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn chuyên môn gợi ý --</option>
                {specialtyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Hoặc tự nhập chuyên môn tùy chỉnh..."
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Avatar Upload (File binary) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Ảnh đại diện (Avatar)</label>
            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center shadow-xs">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base text-slate-400">👤</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📁</span>
                    <span>{avatarFile ? 'Đổi ảnh khác' : 'Chọn tệp ảnh'}</span>
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="px-2 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                    >
                      ✕ Hủy
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">
                  {avatarFile ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Đã chọn: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Hỗ trợ JPG, PNG, WEBP tối đa 5MB (Multipart binary)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <div>
              {user.role !== 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(user)
                    onClose()
                  }}
                  className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Xóa mềm / vô hiệu hóa người dùng theo ID (DELETE /api/users/{id})"
                >
                  <span>🔒</span>
                  <span>Vô hiệu hóa tài khoản</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {updateUserMutation.isPending && <span className="animate-spin">⏳</span>}
                <span>{updateUserMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
