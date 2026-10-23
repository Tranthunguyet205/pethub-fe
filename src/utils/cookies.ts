import Cookies from 'js-cookie'
import type { User } from '@/types'

const TOKEN_KEY = 'pethub_accessToken'
const REFRESH_KEY = 'pethub_refreshToken'
const USER_KEY = 'pethub_user_data'

export const cookieStorage = {
  getAccessToken: (): string | null => {
    return Cookies.get(TOKEN_KEY) || null
  },
  setAccessToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' })
  },
  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_KEY) || null
  },
  setRefreshToken: (token: string) => {
    Cookies.set(REFRESH_KEY, token, { expires: 30, sameSite: 'lax' })
  },
  getUser: (): User | null => {
    const raw = Cookies.get(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
  setUser: (user: User) => {
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, sameSite: 'lax' })
  },
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_KEY)
    Cookies.remove(USER_KEY)
  },
}
