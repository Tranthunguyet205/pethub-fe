'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth.service'
import { UserRoleMapping, type UserRole } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { login, personaLogin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePersonaClick = (role: UserRole) => {
    personaLogin(role)
    const targetRoute = UserRoleMapping[role] || '/dashboard'
    router.push(targetRoute)
  }

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.login({
        email: email.trim(),
        password: password.trim(),
      })

      if (response?.data) {
        login(response.data)
      } else {
        setErrorMessage('Đăng nhập thất bại: dữ liệu phản hồi không hợp lệ')
      }
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err)
      setErrorMessage(
        err?.data?.message ||
          err?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg">
            🐾
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
            Đăng nhập vào PetHub
          </h2>
          <p className="text-xs text-slate-500">
            Hệ thống quản lý dịch vụ & chăm sóc thú cưng chuyên nghiệp
          </p>
        </div>

        {/* Quick Persona Login Cards for Demo */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            ⚡ Đăng nhập nhanh 1 chạm (Demo Personas):
          </span>

          <button
            type="button"
            onClick={() => handlePersonaClick('ADMIN')}
            className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚙️</span>
              <div className="text-left">
                <div className="font-bold">Quản trị viên (Admin)</div>
                <div className="text-[10px] text-purple-600 font-normal">admin@pethub.com</div>
              </div>
            </div>
            <span className="text-purple-700 font-semibold">Vào Admin Control →</span>
          </button>

          <button
            type="button"
            onClick={() => handlePersonaClick('STAFF')}
            className="w-full p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">✂️</span>
              <div className="text-left">
                <div className="font-bold">Kỹ thuật viên (Staff)</div>
                <div className="text-[10px] text-indigo-600 font-normal">staff.an@pethub.vn</div>
              </div>
            </div>
            <span className="text-indigo-700 font-semibold">Vào Staff Hub →</span>
          </button>

          <button
            type="button"
            onClick={() => handlePersonaClick('OWNER')}
            className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🐶</span>
              <div className="text-left">
                <div className="font-bold">Chủ nuôi (Owner)</div>
                <div className="text-[10px] text-emerald-600 font-normal">owner@pethub.vn</div>
              </div>
            </div>
            <span className="text-emerald-700 font-semibold">Vào Owner Portal →</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-semibold">
            Hoặc tài khoản thông thường
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
              <span className="text-sm mt-0.5">⚠️</span>
              <div className="flex-1 font-medium text-xs leading-relaxed">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-rose-700 text-xs font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email đăng nhập</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pethub.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin text-sm">⏳</span>
                <span>Đang đăng nhập...</span>
              </span>
            ) : (
              <span>Đăng nhập hệ thống</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
