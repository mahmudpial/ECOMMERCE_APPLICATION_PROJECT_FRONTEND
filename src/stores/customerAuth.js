import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useCustomerAuthStore = defineStore('customerAuth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('customer_token'),
    isAuthenticated: !!localStorage.getItem('customer_token'),
  }),
  actions: {
    // Direct login after verifying OTP (used by Login.vue)
    login(authData) {
      if (authData.token) {
        this.token = authData.token
        this.user = authData.user
        this.isAuthenticated = true
        localStorage.setItem('customer_token', authData.token)
        localStorage.setItem('customer_user', JSON.stringify(authData.user))
        return true
      }
      return false
    },
    // Alternative: full login flow (if you want to avoid separate API call in component)
    async loginWithOtp(credentials) {
      try {
        const res = await api.post('auth/login/verify-otp', credentials)
        return this.login(res.data)
      } catch (error) {
        console.error(error)
        return false
      }
    },
    async logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('customer_token')
      localStorage.removeItem('customer_user')
    },
    loadUser() {
      const stored = localStorage.getItem('customer_user')
      if (stored) this.user = JSON.parse(stored)
    },
  },
  getters: {
    displayName: (state) => state.user?.name || 'Guest',
  },
})
