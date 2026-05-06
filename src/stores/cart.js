import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart')) || [],
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  actions: {
    addItem(product, quantity = 1) {
      const existing = this.items.find((i) => i.id === product.id)
      if (existing) existing.quantity += quantity
      else this.items.push({ ...product, quantity })
      this.saveCart()
    },
    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId)
      this.saveCart()
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find((i) => i.id === productId)
      if (item) item.quantity = quantity
      this.saveCart()
    },
    clearCart() {
      this.items = []
      this.saveCart()
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items))
    },
    loadCart() {
      const stored = localStorage.getItem('cart')
      if (stored) this.items = JSON.parse(stored)
    },
  },
})
