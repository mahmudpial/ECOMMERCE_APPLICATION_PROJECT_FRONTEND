import { defineStore } from 'pinia'
import api from '@/utils/axios'

const readStoredUser = () => {
  const rawUser = localStorage.getItem('admin_user')

  if (!rawUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(rawUser)
    return parsedUser
  } catch (_error) {
    return { name: rawUser }
  }
}

const getUserName = (user) => {
  if (!user) {
    return 'Admin'
  }

  if (typeof user === 'string') {
    return user
  }

  return user.name || user.full_name || user.username || 'Admin'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser(),
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
      this.user = readStoredUser()
    },

    getDisplayName() {
      return getUserName(this.user)
    },
  },

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    displayName: (state) => getUserName(state.user),
  },
})
