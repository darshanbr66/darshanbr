import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, getSession, setSession, setUnauthorizedHandler } from '../services/adminApi'
import { AuthContext } from './AdminContext'

export default function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getSession)
  const [checking, setChecking] = useState(Boolean(getSession()))
  const [expiredNotice, setExpiredNotice] = useState(false)

  const logout = useCallback((expired = false) => {
    setSession(null)
    setSessionState(null)
    setExpiredNotice(expired)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => logout(true))
  }, [logout])

  // Confirm a stored token is still accepted by the server.
  useEffect(() => {
    if (!getSession()) return
    adminApi
      .me()
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  // Auto-logout when the token's expiry passes while the tab is open.
  useEffect(() => {
    if (!session) return undefined
    const ms = new Date(session.expiresAt) - Date.now()
    const timer = setTimeout(() => logout(true), Math.max(ms, 0))
    return () => clearTimeout(timer)
  }, [session, logout])

  const login = useCallback(async (email, password) => {
    const result = await adminApi.login(email, password)
    setSession(result)
    setSessionState(result)
    setExpiredNotice(false)
    return result
  }, [])

  const value = useMemo(
    () => ({ session, checking, login, logout, expiredNotice }),
    [session, checking, login, logout, expiredNotice]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
