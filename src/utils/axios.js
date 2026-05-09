import axios from 'axios'

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor to automatically add the Authorization token
api.interceptors.request.use(
  (config) => {
    const url = String(config.url || '')
    const isAdminRequest = url.startsWith('admin/') || url.startsWith('/admin/')
    const customerToken = localStorage.getItem('customer_token')
    const adminToken = localStorage.getItem('admin_token')

    if (isAdminRequest && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
      config.__authType = 'admin'
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`
      config.__authType = 'customer'
    } else if (adminToken && !customerToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
      config.__authType = 'admin'
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const authType = error.config?.__authType

      // Logout the matching session if the token is expired or unauthorized.
      if (authType === 'admin') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      } else {
        localStorage.removeItem('customer_token')
        localStorage.removeItem('customer_user')
        if (!window.location.pathname.startsWith('/login')) {
          const redirect = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.href = `/login?redirect=${redirect}`
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
