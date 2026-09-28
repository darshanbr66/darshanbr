import { request } from '../../services/api'

const STORAGE_KEY = 'dbr_admin_session'

let session = readSession()
let onUnauthorized = () => {}

function readSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (stored?.token && new Date(stored.expiresAt) > new Date()) return stored
  } catch {
    // ignore malformed storage
  }
  return null
}

export function getSession() {
  return session
}

export function setSession(next) {
  session = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable (private mode) — session stays in memory only
  }
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function authed(path, options = {}) {
  try {
    return await request(path, { ...options, token: session?.token })
  } catch (err) {
    if (err.status === 401) onUnauthorized()
    throw err
  }
}

function upload(path, files, field = 'files') {
  const form = new FormData()
  for (const file of [].concat(files)) form.append(field, file)
  return authed(path, { method: 'POST', body: form })
}

function crud(resource) {
  return {
    list: () => authed(`/${resource}/admin`),
    create: (data) => authed(`/${resource}`, { method: 'POST', body: data }),
    update: (id, data) => authed(`/${resource}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => authed(`/${resource}/${id}`, { method: 'DELETE' }),
    reorder: (ids) => authed(`/${resource}/reorder`, { method: 'PUT', body: { ids } }),
  }
}

export const adminApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => authed('/auth/me'),
  stats: () => authed('/admin/stats'),

  getProfile: () => authed('/profile/admin'),
  updateProfile: (data) => authed('/profile', { method: 'PUT', body: data }),
  getContent: () => request('/content'),
  updateContent: (data) => authed('/content', { method: 'PUT', body: data }),

  skills: crud('skills'),
  experience: crud('experience'),
  projects: {
    ...crud('projects'),
    get: (id) => authed(`/projects/admin/${id}`),
    duplicate: (id) => authed(`/projects/${id}/duplicate`, { method: 'POST' }),
  },

  messages: {
    list: () => authed('/contact/admin'),
    setStatus: (id, status) => authed(`/contact/${id}`, { method: 'PATCH', body: { status } }),
    remove: (id) => authed(`/contact/${id}`, { method: 'DELETE' }),
  },

  media: {
    list: () => authed('/media'),
    upload: (files) => upload('/media', files),
    remove: (id) => authed(`/media/${id}`, { method: 'DELETE' }),
  },

  resume: {
    list: () => authed('/resume/admin'),
    upload: (file) => upload('/resume', file, 'file'),
    activate: (id) => authed(`/resume/${id}/activate`, { method: 'PUT' }),
    remove: (id) => authed(`/resume/${id}`, { method: 'DELETE' }),
  },
}
