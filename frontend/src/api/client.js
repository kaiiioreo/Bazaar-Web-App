import axios from 'axios'

// One Axios instance for the whole app. Every file in src/api/ uses this.
export const TOKEN_KEY = 'bazaar.token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked: the user stays logged in until the page reloads.
  }
}

// Attach the login token to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turn server errors into a readable message: err.message = "This email is already registered."
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const message =
      err.response?.data?.error ||
      (err.code === 'ERR_NETWORK' ? 'Cannot reach the Bazaar server. Is the backend running?' : err.message)
    // Expired or invalid session: log out everywhere.
    if (status === 401 && getToken()) {
      setToken(null)
      window.dispatchEvent(new Event('bazaar:logout'))
    }
    const error = new Error(message)
    error.status = status
    return Promise.reject(error)
  },
)

export default api
