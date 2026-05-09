import { defineStore } from 'pinia'

const normalizeCartItemPrice = (item) => {
  const regularPrice = Number(item?.price || 0)
  const discountPrice = Number(item?.discount_price || item?.sale_price || 0)

  if (discountPrice > 0 && discountPrice < regularPrice) {
    return discountPrice
  }

  return regularPrice
}

const normalizeCartItem = (item = {}) => {
  const normalizedPrice = normalizeCartItemPrice(item)

  return {
    ...item,
    original_price: Number(item?.original_price ?? item?.price ?? normalizedPrice),
    price: normalizedPrice,
    quantity: Number(item?.quantity || 1),
  }
}

const readStoredCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('cart')) || []
    return Array.isArray(stored) ? stored.map(normalizeCartItem) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: readStoredCart(),
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  },
  actions: {
    addItem(product, quantity = 1) {
      const nextItem = normalizeCartItem({ ...product, quantity })
      const existing = this.items.find((i) => i.id === nextItem.id)

      if (existing) existing.quantity += quantity
      else this.items.push(nextItem)

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
      this.items = readStoredCart()
    },
  },
})
