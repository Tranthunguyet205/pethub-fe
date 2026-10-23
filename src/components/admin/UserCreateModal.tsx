'use client'

import React, { useRef, useState } from 'react'
import type { CreateUserDto, UserRole } from '@/types'
import { useCreateUser } from '@/hooks/useUserQueries'

interface UserCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newUser: CreateUserDto) => void
}

export function UserCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: UserCreateModalProps) {
  const createUserMutation = useCreateUser()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState<'OWNER' | 'STAFF'>('OWNER')
  const [password, setPassword] = useState('PetHub@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [specialty, setSpecialty] = useState('Chuyên viên Grooming & Spa')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPhoneNumber('')
    setRole('OWNER')
    setPassword('PetHub@2026')
    setSpecialty('Chuyên viên Grooming & Spa')
    setAvatarFile(null)
    setAvatarPreview('')
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let pwd = ''
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pwd)
  }

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

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!')
      return
    }

    setErrorMessage('')
    const newUser: CreateUserDto = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      role,
      password: password.trim(),
      ...(role === 'STAFF' && specialty ? { specialty } : {}),
      avatar: avatarFile || undefined,
    }

    try {
      await createUserMutation.mutateAsync(newUser)
      resetForm()
      onSuccess(newUser)
      onClose()
    } catch (err: any) {
      console.error('Lỗi khi tạo user:', err)
      setErrorMessage(
        err?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo người dùng!'
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-purple-50 via-indigo-50/50 to-white border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-sm">
              👤
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Cấp tài khoản người dùng
              </h3>
              <p className="text-xs text-slate-500">
                Admin tạo tài khoản cho Chủ nuôi hoặc Nhân viên để đăng nhập
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role selector cards */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">
              1. Chọn vai trò tài khoản <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRole('OWNER')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${
                  role === 'OWNER'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🐶</span>
                  {role === 'OWNER' && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Đang chọn
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">Chủ nuôi (OWNER)</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Khách hàng đặt lịch, theo dõi timeline chăm sóc thú cưng
                </div>
              </div>

              <div
                onClick={() => setRole('STAFF')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${
                  role === 'STAFF'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">✂️</span>
                  {role === 'STAFF' && (
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Đang chọn
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">Nhân viên (STAFF)</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Kỹ thuật viên thực hiện dịch vụ, check-in, cập nhật timeline
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Upload (File binary) */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Ảnh đại diện (Avatar)</label>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-lg">
                    📷
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>📁 Chọn ảnh</span>
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      ✕ Xóa ảnh
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Hỗ trợ JPG, PNG, WEBP tối đa 5MB (Binary Multipart).
                </span>
              </div>
            </div>
          </div>

          {/* Basic Fields */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Ví dụ: Trần Văn Nam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email đăng nhập <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nam.tran@pethub.vn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="0912 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ Tạo ngẫu nhiên</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập hoặc tạo mật khẩu ban đầu"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Specialty (Staff only) */}
          {role === 'STAFF' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <label className="font-bold text-indigo-900 block">Chuyên môn nhân viên</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-medium text-slate-700"
              >
                <option value="Chuyên viên Grooming & Spa">Chuyên viên Grooming & Spa</option>
                <option value="Bác sĩ thú y">Bác sĩ thú y (Khám & Tiêm phòng)</option>
                <option value="Chăm sóc nội trú & Boarding">Chăm sóc nội trú & Boarding</option>
                <option value="Lễ tân & Điều phối dịch vụ">Lễ tân & Điều phối dịch vụ</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
            >
              {createUserMutation.isPending && <span className="animate-spin text-sm">⏳</span>}
              <span>{createUserMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
