/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { getToken, setToken } from '../api/client'
import { markActive } from '../utils/idle'

const AuthContext = createContext(null)

// Where each role lands after logging in.
export function homeFor(user) {
  if (!user) return '/'
  if (user.role === 'admin') return '/admin'
  if (user.role === 'vendor') return '/vendor'
  return '/customer'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))
  // true after the user clicks Log out (vs. a session that expired)
  const [loggedOut, setLoggedOut] = useState(false)
  // true after an automatic logout for inactivity (SRS 3.5.1)
  const [idleOut, setIdleOut] = useState(false)

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!getToken()) return
    authApi
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  // The API client fires this when the token expires (SRS 3.5.1 auto logout).
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('bazaar:logout', onLogout)
    return () => window.removeEventListener('bazaar:logout', onLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    setToken(data.token)
    markActive() // start the inactivity timer fresh
    setLoggedOut(false)
    setIdleOut(false)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (body) => {
    const data = await authApi.register(body)
    setToken(data.token)
    markActive()
    setLoggedOut(false)
    setIdleOut(false)
    setUser(data.user)
    return data.user
  }, [])

  // logout() = the user clicked Log out (go home). logout({ reason: 'idle' }) = timed out (IdleLogout sends them to login).
  const logout = useCallback(({ reason } = {}) => {
    setToken(null)
    setLoggedOut(reason !== 'idle')
    setIdleOut(reason === 'idle')
    setUser(null)
  }, [])

  // Re-fetch the user (e.g. after a vendor application is approved).
  const refresh = useCallback(async () => {
    const data = await authApi.getMe()
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({ user, loading, loggedOut, idleOut, login, register, logout, refresh, setUser }),
    [user, loading, loggedOut, idleOut, login, register, logout, refresh],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
