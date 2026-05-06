import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useCustomerAuthStore = defineStore('customerAuth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('customer_token'),
    isAuthenticated: !!localStorage.getItem('customer_token'),
  }),
  actions: {
    async login(credentials) {
      try {
        const res = await api.post('auth/login/verify-otp', credentials)
        if (res.data.token) {
          this.token = res.data.token
          this.user = res.data.user
          this.isAuthenticated = true
          localStorage.setItem('customer_token', res.data.token)
          localStorage.setItem('customer_user', JSON.stringify(res.data.user))
          return true
        }
        return false
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
