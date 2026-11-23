'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Trang đăng ký — giữ đồng bộ với pethub-app/app/pages/register.vue.
 * Backend chưa có endpoint POST /auth/register nên form chỉ điều hướng,
 * chưa tạo tài khoản thật.
 */
export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-soft">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto text-2xl shadow-soft">
            🐾
          </div>
          <h2 className="text-2xl font-extrabold font-display text-slate-900">Đăng ký tài khoản PetHub</h2>
          <p className="text-xs text-slate-500">Tạo tài khoản chủ nuôi để theo dõi quá trình chăm sóc thú cưng.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="0901 234 567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Mật khẩu *</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer"
          >
            Hoàn tất Đăng ký
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
