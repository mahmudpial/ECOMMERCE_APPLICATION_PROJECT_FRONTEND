<template>
    <div class="cart-page">

        <!-- Page header – minimal -->
        <div class="page-header">
            <div class="brand-mark">Commercia</div>
            <h1 class="page-title">Shopping Cart</h1>
            <p class="page-sub">Review your selection before checkout</p>
        </div>

        <!-- Empty state -->
        <div v-if="!cartItems.length" class="empty-state">
            <div class="empty-icon">—</div>
            <h2>Your cart is empty</h2>
            <p>Add some pieces to begin your collection.</p>
            <router-link to="/products" class="btn-primary">Explore products</router-link>
        </div>

        <!-- Cart content -->
        <div v-else class="cart-layout">

            <!-- Left column: items + shipping -->
            <div class="cart-items-section">

                <!-- Desktop table -->
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in cartItems" :key="item.id" class="cart-row">
                            <td class="product-cell">
                                <img :src="getProductImage(item)" :alt="item.name" class="product-thumb" />
                                <div class="product-details">
                                    <router-link :to="`/product/${item.id}`" class="product-name">{{ item.name
                                    }}</router-link>
                                    <span class="product-category">{{ item.category?.name || 'Collection' }}</span>
                                </div>
                            </td>
                            <td class="price-cell">৳{{ formatPrice(item.price) }}</td>
                            <td class="qty-cell">
                                <div class="quantity-control">
                                    <button @click="updateQuantity(item, item.quantity - 1)"
                                        :disabled="item.quantity <= 1">−</button>
                                    <span>{{ item.quantity }}</span>
                                    <button @click="updateQuantity(item, item.quantity + 1)">+</button>
                                </div>
                            </td>
                            <td class="total-cell">৳{{ formatPrice(item.price * item.quantity) }}</td>
                            <td class="remove-cell">
                                <button class="remove-btn" @click="removeItem(item.id)"
                                    aria-label="Remove item">✕</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Mobile cards -->
                <div class="mobile-cart-cards">
                    <div v-for="item in cartItems" :key="`m-${item.id}`" class="cart-card-mobile">
                        <div class="card-row">
                            <img :src="getProductImage(item)" :alt="item.name" class="card-img" />
                            <div class="card-info">
                                <router-link :to="`/product/${item.id}`" class="card-name">{{ item.name }}</router-link>
                                <div class="card-price">৳{{ formatPrice(item.price) }}</div>
                            </div>
                            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
                        </div>
                        <div class="card-footer">
                            <div class="quantity-control">
                                <button @click="updateQuantity(item, item.quantity - 1)"
                                    :disabled="item.quantity <= 1">−</button>
                                <span>{{ item.quantity }}</span>
                                <button @click="updateQuantity(item, item.quantity + 1)">+</button>
                            </div>
                            <div class="card-total">৳{{ formatPrice(item.price * item.quantity) }}</div>
                        </div>
                    </div>
                </div>

                <!-- Shipping estimate -->
                <div class="shipping-section">
                    <div class="shipping-header">
                        <span class="label">Shipping estimate</span>
                    </div>
                    <div class="shipping-options">
                        <button v-for="opt in deliveryOptions" :key="opt.value" class="shipping-option"
                            :class="{ active: selectedDeliveryMethod === opt.value }"
                            @click="selectedDeliveryMethod = opt.value">
                            <div class="shipping-left">
                                <div class="shipping-name">{{ opt.label }}</div>
                                <div class="shipping-desc">{{ opt.description }}</div>
                            </div>
                            <div class="shipping-right">
                                <div class="shipping-fee">{{ opt.fee ? `৳${formatPrice(getShippingFee(opt.value,
                                    subtotal))}` : 'Free' }}</div>
                                <div class="shipping-eta">{{ opt.eta }}</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right column: order summary -->
            <aside class="order-summary">
                <div class="summary-card">
                    <div class="summary-header">
                        <span class="label">Order summary</span>
                        <h3 class="summary-title">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}</h3>
                    </div>

                    <div class="summary-lines">
                        <div class="summary-line">
                            <span>Subtotal</span>
                            <span>৳{{ formatPrice(subtotal) }}</span>
                        </div>
                        <div class="summary-line">
                            <span>Shipping</span>
                            <span>{{ estimatedShipping === 0 ? 'Free' : `৳${formatPrice(estimatedShipping)}` }}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-line total">
                            <span>Estimated total</span>
                            <span>৳{{ formatPrice(grandTotal) }}</span>
                        </div>
                    </div>

                    <p class="summary-note">Final shipping calculated at checkout.</p>

                    <router-link to="/checkout" class="btn-primary checkout-btn">Proceed to checkout</router-link>
                    <router-link to="/products" class="continue-link">← Continue browsing</router-link>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { deliveryOptions, getDeliveryOption, getShippingFee, readCheckoutDraft, saveCheckoutDraft } from '@/utils/customerCommerce'

const cartStore = useCartStore()
const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.totalPrice)
const totalItems = computed(() => cartStore.totalItems)
const selectedDeliveryMethod = ref('standard')
const selectedDelivery = computed(() => getDeliveryOption(selectedDeliveryMethod.value))
const estimatedShipping = computed(() => getShippingFee(selectedDeliveryMethod.value, subtotal.value))
const grandTotal = computed(() => subtotal.value + estimatedShipping.value)

const getProductImage = (p) => {
    let images = p.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try { images = JSON.parse(images) } catch { /* fallback */ }
    }
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string' && images.trim()) return images
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
}
const formatPrice = (v) => Number(v).toFixed(2)
const updateQuantity = (item, qty) => { if (qty < 1) return; cartStore.updateQuantity(item.id, qty) }
const removeItem = (id) => cartStore.removeItem(id)

watch(selectedDeliveryMethod, (v) => {
    const draft = readCheckoutDraft() || {}
    saveCheckoutDraft({ ...draft, deliveryMethod: v })
})
onMounted(() => {
    const draft = readCheckoutDraft() || {}
    selectedDeliveryMethod.value = draft.deliveryMethod || 'standard'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap');

/* Light mode (default) */
.cart-page {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --bg-card-soft: #F8FAFC;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --success: #10B981;
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Dark mode – triggered by parent .dark class */
.cart-page.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --bg-card-soft: #2A2F3A;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
}

.cart-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text-primary);
}

/* Header */
.page-header {
    padding: 2rem 0 1.5rem;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 2rem;
}

.brand-mark {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
    margin-bottom: 1rem;
}

.page-title {
    font-family: 'Sora', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    letter-spacing: -0.01em;
    color: var(--text-primary);
}

.page-sub {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-card);
    border-radius: 20px;
    border: 1px solid var(--border-light);
}

.empty-icon {
    font-family: 'Sora', sans-serif;
    font-size: 3rem;
    color: var(--accent);
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h2 {
    font-weight: 600;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.btn-primary {
    display: inline-block;
    background: var(--accent);
    color: #FFFFFF;
    text-decoration: none;
    padding: 0.7rem 1.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    transition: background 0.2s;
    border: none;
    border-radius: 40px;
    cursor: pointer;
}

.btn-primary:hover {
    background: #0052CC;
}

/* Cart layout */
.cart-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2rem;
}

/* Left column */
.cart-items-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Desktop table */
.cart-table {
    width: 100%;
    border-collapse: collapse;
}

.cart-table th {
    text-align: left;
    padding: 0 0 1rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-light);
}

.cart-row td {
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
}

.product-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.product-thumb {
    width: 72px;
    height: 90px;
    object-fit: cover;
    background: var(--bg-card-soft);
    border-radius: 8px;
}

.product-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.product-name {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.2s;
}

.product-name:hover {
    color: var(--accent);
}

.product-category {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.price-cell,
.total-cell {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
}

.qty-cell {
    width: 120px;
}

.quantity-control {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--border-input);
    background: var(--bg-card);
    border-radius: 30px;
}

.quantity-control button {
    width: 2rem;
    height: 2rem;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.2s;
    border-radius: 30px;
}

.quantity-control button:hover:not(:disabled) {
    background: var(--bg-card-soft);
}

.quantity-control button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.quantity-control span {
    min-width: 2rem;
    text-align: center;
    font-size: 0.9rem;
}

.remove-cell {
    text-align: right;
}

.remove-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: color 0.2s;
}

.remove-btn:hover {
    color: var(--accent);
}

/* Mobile cards */
.mobile-cart-cards {
    display: none;
    flex-direction: column;
    gap: 1rem;
}

.cart-card-mobile {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 1rem;
}

.card-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.card-img {
    width: 64px;
    height: 80px;
    object-fit: cover;
    background: var(--bg-card-soft);
    border-radius: 8px;
}

.card-info {
    flex: 1;
}

.card-name {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary);
    text-decoration: none;
    display: block;
    margin-bottom: 0.25rem;
}

.card-price {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 500;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-light);
}

.card-total {
    font-weight: 600;
    color: var(--text-primary);
}

/* Shipping section */
.shipping-section {
    border-top: 1px solid var(--border-light);
    padding-top: 1.5rem;
}

.shipping-header {
    margin-bottom: 1rem;
}

.label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.shipping-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.shipping-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
}

.shipping-option.active {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.shipping-left {
    flex: 1;
}

.shipping-name {
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
}

.shipping-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.shipping-right {
    text-align: right;
}

.shipping-fee {
    font-weight: 600;
    color: var(--accent);
    font-size: 0.85rem;
}

.shipping-eta {
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* Order summary sidebar */
.order-summary {
    position: sticky;
    top: 2rem;
    align-self: start;
}

.summary-card {
    background: var(--bg-card-soft);
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid var(--border-light);
}

.summary-header {
    margin-bottom: 1.5rem;
}

.summary-title {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 1.25rem;
    margin: 0.3rem 0 0;
    color: var(--text-primary);
}

.summary-lines {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.summary-line.total {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
}

.summary-divider {
    height: 1px;
    background: var(--border-light);
    margin: 0.3rem 0;
}

.summary-note {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 1.5rem 0 1rem;
}

.checkout-btn {
    display: block;
    text-align: center;
    width: 100%;
    margin-bottom: 0.8rem;
    padding: 0.8rem;
    font-size: 0.8rem;
}

.continue-link {
    display: block;
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
}

.continue-link:hover {
    color: var(--accent);
}

/* Responsive */
@media (max-width: 900px) {
    .cart-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .order-summary {
        position: static;
    }
}

@media (max-width: 700px) {
    .cart-page {
        padding: 0 1rem 3rem;
    }

    .cart-table {
        display: none;
    }

    .mobile-cart-cards {
        display: flex;
    }
}

@media (max-width: 480px) {
    .btn-primary {
        padding: 0.6rem 1rem;
        font-size: 0.75rem;
    }

    .summary-card {
        padding: 1rem;
    }
}
</style>