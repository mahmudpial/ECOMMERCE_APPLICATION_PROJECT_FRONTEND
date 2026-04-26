import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('admin_token') || null,
    isAuthenticated: !!localStorage.getItem('admin_token'),
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/verify-otp', credentials)

        if (response.data.token) {
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true

          localStorage.setItem('admin_token', response.data.token)
          localStorage.setItem('admin_user', JSON.stringify(response.data.user))

          return true
        }
        return false
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.error('Logout error:', error)
        return false
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    },

    loadUser() {
      const userData = localStorage.getItem('admin_user')
      if (userData) {
        this.user = JSON.parse(userData)
      }
    },
  },

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },
})
