import { defineStore } from 'pinia'
import api from '@/utils/axios'

const readStoredUser = () => {
  const rawUser = localStorage.getItem('admin_user')
  if (!rawUser) return null
  try {
    return JSON.parse(rawUser)
  } catch {
    return { name: rawUser }
  }
}

const getUserName = (user) => {
  if (!user) return 'Admin'
  if (typeof user === 'string') return user
  return user.name || user.full_name || user.username || 'Admin'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser(),
    token: localStorage.getItem('admin_token') || null,
    isAuthenticated: !!localStorage.getItem('admin_token'),
  }),

  actions: {
    /**
     * Called from AdminLogin.vue after the user enters their OTP.
     *
     * credentials shape: { mobile: string, otp: string }
     *
     * Backend route: POST /api/v1/admin/verify-otp
     *   → AuthController@verifyOtp → loginVerifyOtp(LoginOtpRequest)
     *   → expects request body: { identifier: string, otp: string }
     *   → returns: { message, user, token }
     *
     * The field is named 'identifier' on the backend (LoginOtpRequest),
     * NOT 'mobile'. We map it here so callers can just pass { mobile, otp }.
     */
    async login(credentials) {
      try {
        const response = await api.post('admin/verify-otp', {
          identifier: credentials.mobile,
          otp: credentials.otp,
        })

        const { token, user } = response.data

        if (!token) return false

        this.token = token
        this.user = user
        this.isAuthenticated = true

        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify(user))

        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },

    async logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      return true
    },

    loadUser() {
      this.user = readStoredUser()
    },
  },

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    displayName: (state) => getUserName(state.user),
  },
})
