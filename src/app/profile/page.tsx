'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useChangePassword, useMe, useUpdateMe } from '@/hooks/useUserQueries'

export default function ProfilePage() {
  const { user: authUser, updateUser: updateAuthUser } = useAuth()
  const { data: meResponse, isLoading: isLoadingMe } = useMe()
  const updateMeMutation = useUpdateMe()
  const changePasswordMutation = useChangePassword()

  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => setToastMessage(''), 4000)
  }

  const currentUser = meResponse?.data || authUser

  // Tab 1 state
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '')
      setPhoneNumber(currentUser.phoneNumber || '')
      setAvatarPreview(currentUser.avatarUrl || '')
    }
  }, [currentUser])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh khác!')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setProfileError('')
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(currentUser?.avatarUrl || '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setProfileError('Vui lòng nhập họ và tên!')
      return
    }

    setProfileError('')
    try {
      const res = await updateMeMutation.mutateAsync({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        avatar: avatarFile || undefined,
      })

      if (res?.data) {
        updateAuthUser(res.data)
      }
      setAvatarFile(null)
      showToast('Cập nhật thông tin hồ sơ thành công!', 'success')
    } catch (err: any) {
      console.error('Lỗi cập nhật hồ sơ:', err)
      const msg = err?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ!'
      setProfileError(msg)
      showToast(msg, 'error')
    }
  }

  // Tab 2 state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại!')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự!')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp!')
      return
    }

    setPasswordError('')
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
      })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.', 'success')
    } catch (err: any) {
      console.error('Lỗi đổi mật khẩu:', err)
      const msg =
        err?.data?.message || err?.message || 'Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra!'
      setPasswordError(msg)
      showToast(msg, 'error')
    }
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d)
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold border animate-in fade-in slide-in-from-top-4 duration-200 ${
              toastType === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            <span className="text-base">{toastType === 'success' ? '🎉' : '⚠️'}</span>
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage('')} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Top navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={currentUser?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <span>← Quay lại</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">PetHub User Account</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Hồ sơ & Tài khoản
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý thông tin cá nhân, cập nhật ảnh đại diện và bảo mật tài khoản.
            </p>
          </div>

          {currentUser?.role && (
            <span
              className={`px-3 py-1.5 rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow-xs w-max ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : currentUser.role === 'STAFF'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>{currentUser.role === 'ADMIN' ? '⚙️' : currentUser.role === 'STAFF' ? '✂️' : '🐶'}</span>
              <span>Vai trò: {currentUser.role}</span>
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>👤</span>
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🔒</span>
            <span>Bảo mật & Mật khẩu</span>
          </button>
        </div>

        {/* Tab 1: Info Form */}
        {activeTab === 'info' && (
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6"
          >
            {profileError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{profileError}</span>
              </div>
            )}

            {/* Avatar section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-soft"
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-soft ${
                      currentUser?.role === 'ADMIN'
                        ? 'bg-purple-600'
                        : currentUser?.role === 'STAFF'
                        ? 'bg-indigo-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Ảnh đại diện (Avatar)</h3>
                <p className="text-[11px] text-slate-500">
                  Tải lên ảnh chân dung rõ nét định dạng JPG, PNG hoặc WEBP (tối đa 5MB).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>📷 Thay đổi ảnh</span>
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      ✕ Hủy chọn
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày tạo tài khoản</label>
                <input
                  type="text"
                  value={formatDateTime(currentUser?.createdAt)}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={updateMeMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
              >
                {updateMeMutation.isPending && <span className="animate-spin text-sm">⏳</span>}
                <span>{updateMeMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security Form */}
        {activeTab === 'security' && (
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 max-w-xl"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thay đổi mật khẩu</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Khuyên dùng mật khẩu mạnh bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOld ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2 cursor-pointer"
              >
                {changePasswordMutation.isPending && <span className="animate-spin text-sm">⏳</span>}
                <span>{changePasswordMutation.isPending ? 'Đang đổi...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
