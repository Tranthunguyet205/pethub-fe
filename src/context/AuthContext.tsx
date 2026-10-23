'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LoginResponse, User, UserRole } from '@/types'
import { cookieStorage } from '@/utils/cookies'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginResponse) => void
  logout: () => void
  updateUser: (updated: Partial<User>) => void
  personaLogin: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockDemoUsers: Record<UserRole, User> = {
  ADMIN: {
    id: 1,
    fullName: 'System Administrator',
    email: 'admin@pethub.com',
    phoneNumber: '0988888888',
    role: 'ADMIN',
    avatarUrl: 'https://legislatorial-federico-craggily.ngrok-free.dev/public-images/files/avatars/avatar-1790533243215-219225371.jpg',
    status: 'ACTIVE',
    createdAt: '2026-09-27T17:56:22.543Z',
  },
  STAFF: {
    id: 2,
    fullName: 'Nguyễn Văn An (Staff)',
    email: 'staff.an@pethub.vn',
    phoneNumber: '0912345678',
    role: 'STAFF',
    specialty: 'Chuyên viên Grooming & Spa',
    status: 'ACTIVE',
    createdAt: '2025-11-01T10:00:00.000Z',
  },
  OWNER: {
    id: 3,
    fullName: 'Trần Minh Tuấn (Owner)',
    email: 'owner@pethub.vn',
    phoneNumber: '0901234567',
    role: 'OWNER',
    petCount: 2,
    status: 'ACTIVE',
    createdAt: '2026-01-10T12:00:00.000Z',
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedUser = cookieStorage.getUser()
    const savedToken = cookieStorage.getAccessToken()
    if (savedUser && savedToken) {
      setUser(savedUser)
      setAccessToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (data: LoginResponse) => {
    setUser(data.user)
    setAccessToken(data.accessToken)
    cookieStorage.setUser(data.user)
    cookieStorage.setAccessToken(data.accessToken)
    if (data.refreshToken) {
      cookieStorage.setRefreshToken(data.refreshToken)
    }

    // Chuyển hướng theo vai trò
    if (data.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (data.user.role === 'STAFF') {
      router.push('/staff/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    cookieStorage.clearAuth()
    router.push('/login')
  }

  const updateUser = (updated: Partial<User>) => {
    if (!user) return
    const newUser = { ...user, ...updated }
    setUser(newUser)
    cookieStorage.setUser(newUser)
  }

  const personaLogin = (role: UserRole) => {
    const target = mockDemoUsers[role]
    login({
      user: target,
      accessToken: `mock_jwt_token_pethub_${role.toLowerCase()}`,
      refreshToken: `mock_refresh_token_pethub_${role.toLowerCase()}`,
    })
  }

  const role = user?.role || null
  const isAuthenticated = !!user && !!accessToken

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        personaLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
