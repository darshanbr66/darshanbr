// VITE_API_URL is set per environment (.env locally, Vercel env vars in
// production); a trailing /api is optional. The localhost fallback exists only
// in the dev server and is never compiled into a production build.
function apiBase() {
  const configured = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
  if (configured) return /\/api$/.test(configured) ? configured : `${configured}/api`
  if (import.meta.env.DEV) return 'http://localhost:5000/api'
  console.error('VITE_API_URL is not set — the API cannot be reached. Showing bundled content.')
  return '/api'
}

export const API_BASE = apiBase()

// Origin that serves `/api/...` paths (media and resume URLs are stored relative).
const API_ORIGIN = API_BASE.replace(/\/api$/, '')

export function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^(https?:|data:|blob:)/.test(url)) return url
  if (url.startsWith('/api/')) return `${API_ORIGIN}${url}`
  return url
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = {}
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body && !isForm ? JSON.stringify(body) : body,
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status)
  }
  return data
}

export const api = {
  getSite: (signal) => request('/site', { signal }),
  getProject: (slug, signal) => request(`/projects/${encodeURIComponent(slug)}`, { signal }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: payload }),
}

export const resumeFileUrl = `${API_BASE}/resume/file`
