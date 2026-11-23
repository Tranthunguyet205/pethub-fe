import { cookieStorage } from './cookies'

// export const BASE_API_URL = 'https://legislatorial-federico-craggily.ngrok-free.dev/api'
export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api'

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any
  query?: Record<string, any>
}

/**
 * Dùng chung một promise refresh: nhiều request cùng dính 401 một lúc thì chỉ
 * gọi /auth/refresh đúng một lần, các request còn lại chờ kết quả đó.
 */
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = cookieStorage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const res = await fetch(`${BASE_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null

    const json = await res.json()
    // Backend trả thẳng { accessToken, refreshToken }; vẫn chấp nhận dạng bọc { data }
    const payload = json?.data ?? json
    if (!payload?.accessToken) return null

    cookieStorage.setAccessToken(payload.accessToken)
    if (payload.refreshToken) cookieStorage.setRefreshToken(payload.refreshToken)
    return payload.accessToken as string
  } catch {
    return null
  }
}

/** Hết cách cứu phiên đăng nhập → xóa cookie và đưa về trang đăng nhập */
function forceLogout() {
  cookieStorage.clearAuth()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // Cố ý reload toàn trang: pethubFetch nằm ngoài cây React nên không dùng được router,
    // và reload giúp AuthContext + cache React Query đọc lại từ cookie đã bị xóa.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login'
  }
}

export async function pethubFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {},
  isRetry = false
): Promise<T> {
  const { query, headers, body, method = 'GET', ...rest } = options

  // 1. Build Query String
  let url = endpoint.startsWith('http') ? endpoint : `${BASE_API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v))
      }
    })
    const qs = searchParams.toString()
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs
    }
  }

  // 2. Prepare Headers
  const requestHeaders = new Headers(headers)
  requestHeaders.set('ngrok-skip-browser-warning', 'true')

  const token = typeof window !== 'undefined' ? cookieStorage.getAccessToken() : null
  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  // 3. Prepare Body & Content-Type
  let requestBody: any = body
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json')
    }
    requestBody = JSON.stringify(body)
  }

  // 4. Execute Fetch
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
    ...rest,
  })

  // 5. Access token hết hạn → refresh một lần rồi gọi lại request gốc
  const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh')
  if (response.status === 401 && !isAuthEndpoint && !isRetry && typeof window !== 'undefined') {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }
    const newToken = await refreshPromise

    if (newToken) {
      const retryHeaders = new Headers(headers)
      retryHeaders.set('Authorization', `Bearer ${newToken}`)
      return pethubFetch<T>(endpoint, { ...options, headers: retryHeaders }, true)
    }

    forceLogout()
  }

  // 6. Handle Error Responses
  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText || 'Có lỗi xảy ra khi gọi API' }
    }
    const error: any = new Error(errorData.message || 'Lỗi HTTP ' + response.status)
    error.status = response.status
    error.data = errorData
    throw error
  }

  // 7. Parse JSON or empty
  if (response.status === 204) {
    return null as any
  }

  return response.json()
}
