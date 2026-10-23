import { cookieStorage } from './cookies'

export const BASE_API_URL = 'https://legislatorial-federico-craggily.ngrok-free.dev/api'

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: any
  query?: Record<string, any>
}

export async function pethubFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
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

  // 5. Handle Error Responses
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

  // 6. Parse JSON or empty
  if (response.status === 204) {
    return null as any
  }

  return response.json()
}
