<template>
    <div class="cart-page">
        <div class="page-header">
            <h1>Shopping Cart</h1>
            <p>Review and manage your items</p>
        </div>

        <div v-if="cartItems.length === 0" class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <p>Your cart is empty</p>
            <router-link to="/products" class="btn-primary">Continue Shopping</router-link>
        </div>

        <div v-else class="cart-content">
            <!-- Desktop table view -->
            <div class="cart-table-wrapper">
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
                        <tr v-for="item in cartItems" :key="item.id">
                            <td class="product-cell">
                                <img :src="getProductImage(item)" :alt="item.name" class="product-image" />
                                <div class="product-info">
                                    <router-link :to="`/product/${item.id}`" class="product-name">{{ item.name
                                    }}</router-link>
                                </div>
                            </td>
                            <td class="price">৳{{ formatPrice(item.price) }}</td>
                            <td class="quantity-cell">
                                <div class="quantity-control">
                                    <button @click="updateQuantity(item, item.quantity - 1)"
                                        :disabled="item.quantity <= 1">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span>{{ item.quantity }}</span>
                                    <button @click="updateQuantity(item, item.quantity + 1)">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </td>
                            <td class="total">৳{{ formatPrice(item.price * item.quantity) }}</td>
                            <td class="action-cell">
                                <button @click="removeItem(item.id)" class="remove-btn">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile card view -->
            <div class="cart-cards">
                <div v-for="item in cartItems" :key="item.id" class="cart-item-card">
                    <div class="card-header">
                        <img :src="getProductImage(item)" :alt="item.name" class="card-image" />
                        <div class="card-info">
                            <router-link :to="`/product/${item.id}`" class="product-name">{{ item.name }}</router-link>
                            <div class="price">৳{{ formatPrice(item.price) }}</div>
                        </div>
                        <button @click="removeItem(item.id)" class="remove-btn-mobile">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="card-footer">
                        <div class="quantity-control">
                            <button @click="updateQuantity(item, item.quantity - 1)" :disabled="item.quantity <= 1">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>{{ item.quantity }}</span>
                            <button @click="updateQuantity(item, item.quantity + 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-total">Total: ৳{{ formatPrice(item.price * item.quantity) }}</div>
                    </div>
                </div>
            </div>

            <!-- Cart Summary -->
            <div class="cart-summary">
                <div class="summary-card">
                    <h3>Order Summary</h3>
                    <div class="delivery-selector">
                        <div class="delivery-selector-head">
                            <span>Delivery method</span>
                            <strong>{{ selectedDelivery.label }}</strong>
                        </div>
                        <button
                            v-for="option in deliveryOptions"
                            :key="option.value"
                            type="button"
                            class="delivery-option"
                            :class="{ active: selectedDeliveryMethod === option.value }"
                            @click="selectedDeliveryMethod = option.value"
                        >
                            <div class="delivery-option-copy">
                                <strong>{{ option.label }}</strong>
                                <span>{{ option.description }}</span>
                            </div>
                            <div class="delivery-option-meta">
                                <strong>{{ option.fee ? `৳${formatPrice(getShippingFee(option.value, subtotal))}` : 'Free' }}</strong>
                                <span>{{ option.eta }}</span>
                            </div>
                        </button>
                    </div>
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>৳{{ formatPrice(subtotal) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>{{ estimatedShipping === 0 ? 'Free' : `৳${formatPrice(estimatedShipping)}` }}</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>৳{{ formatPrice(grandTotal) }}</span>
                    </div>
                    <p class="summary-note">Estimated with {{ selectedDelivery.label.toLowerCase() }}. Final shipping is confirmed at checkout.</p>
                    <router-link to="/checkout" class="checkout-btn">Proceed to Checkout</router-link>
                    <router-link to="/products" class="continue-shopping">Continue Shopping</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import {
    deliveryOptions,
    getDeliveryOption,
    getShippingFee,
    readCheckoutDraft,
    saveCheckoutDraft,
} from '@/utils/customerCommerce'

const cartStore = useCartStore()
const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.totalPrice)
const selectedDeliveryMethod = ref('standard')
const selectedDelivery = computed(() => getDeliveryOption(selectedDeliveryMethod.value))
const estimatedShipping = computed(() => getShippingFee(selectedDeliveryMethod.value, subtotal.value))
const grandTotal = computed(() => subtotal.value + estimatedShipping.value)

const hydrateDeliveryMethod = () => {
    const draft = readCheckoutDraft() || {}
    selectedDeliveryMethod.value = draft.deliveryMethod || 'standard'
}

const getProductImage = (product) => {
    let images = product.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try {
            images = JSON.parse(images)
        } catch (e) { }
    }
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string' && images.trim()) return images
    return 'https://via.placeholder.com/100?text=No+Image'
}

const formatPrice = (price) => {
    return Number(price).toFixed(2)
}

const updateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return
    cartStore.updateQuantity(item.id, newQuantity)
}

const removeItem = (productId) => {
    cartStore.removeItem(productId)
}

watch(selectedDeliveryMethod, (value) => {
    const draft = readCheckoutDraft() || {}
    saveCheckoutDraft({
        ...draft,
        deliveryMethod: value,
    })
})

onMounted(() => {
    hydrateDeliveryMethod()
})
</script>

<style scoped>
.cart-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.page-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
}

.page-header p {
    color: var(--text-muted);
}

.empty-cart {
    text-align: center;
    padding: 3rem;
    background: var(--card);
    border-radius: 1rem;
    box-shadow: var(--shadow);
}

.empty-cart i {
    font-size: 4rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
}

.empty-cart p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    color: var(--text-muted);
}

.btn-primary {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

/* Desktop table */
.cart-table-wrapper {
    overflow-x: auto;
    margin-bottom: 2rem;
}

.cart-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: var(--shadow);
}

.cart-table th {
    text-align: left;
    padding: 1rem;
    background: var(--bg);
    color: var(--text-muted);
    font-weight: 600;
    border-bottom: 1px solid var(--border);
}

.cart-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
}

.product-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.product-image {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 0.5rem;
}

.product-name {
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
}

.product-name:hover {
    color: var(--primary);
}

.price,
.total {
    font-weight: 500;
}

.quantity-control {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg);
    padding: 0.25rem 0.5rem;
    border-radius: 2rem;
}

.quantity-control button {
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text);
    transition: background 0.2s;
}

.quantity-control button:hover:not(:disabled) {
    background: var(--border);
}

.quantity-control button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.quantity-control span {
    min-width: 30px;
    text-align: center;
    font-weight: 500;
}

.remove-btn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1.1rem;
    transition: transform 0.2s;
}

.remove-btn:hover {
    transform: scale(1.1);
}

/* Mobile cards (hidden on desktop) */
.cart-cards {
    display: none;
}

/* Summary */
.cart-summary {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.summary-card {
    background: var(--card);
    border-radius: 1rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 380px;
    box-shadow: var(--shadow);
}

.summary-card h3 {
    margin-bottom: 1rem;
    color: var(--text);
}

.delivery-selector {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.delivery-selector-head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: baseline;
}

.delivery-selector-head span {
    color: var(--text-muted);
    font-size: 0.9rem;
}

.delivery-selector-head strong {
    color: var(--text);
    font-size: 0.95rem;
}

.delivery-option {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--bg);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.delivery-option:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow);
}

.delivery-option.active {
    border-color: var(--primary);
    background: rgba(59, 130, 246, 0.08);
}

.delivery-option-copy {
    display: grid;
    gap: 0.2rem;
}

.delivery-option-copy strong {
    color: var(--text);
    font-size: 0.95rem;
}

.delivery-option-copy span,
.delivery-option-meta span {
    color: var(--text-muted);
    font-size: 0.82rem;
    line-height: 1.3;
}

.delivery-option-meta {
    display: grid;
    justify-items: end;
    gap: 0.2rem;
    text-align: right;
}

.delivery-option-meta strong {
    color: var(--primary);
    font-size: 0.95rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    color: var(--text);
}

.summary-divider {
    height: 1px;
    background: var(--border);
    margin: 1rem 0;
}

.summary-row.total {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary);
}

.checkout-btn {
    display: block;
    background: var(--primary);
    color: white;
    text-align: center;
    padding: 0.75rem;
    border-radius: 2rem;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: background 0.2s;
}

.checkout-btn:hover {
    background: var(--primary-hover);
}

.continue-shopping {
    display: block;
    text-align: center;
    margin-top: 0.75rem;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.9rem;
}

.continue-shopping:hover {
    color: var(--primary);
}

.summary-note {
    margin: 0.85rem 0 0;
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
    .cart-table-wrapper {
        display: none;
    }

    .cart-cards {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .cart-item-card {
        background: var(--card);
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: var(--shadow);
    }

    .card-header {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .card-image {
        width: 70px;
        height: 70px;
        object-fit: cover;
        border-radius: 0.5rem;
    }

    .card-info {
        flex: 1;
    }

    .remove-btn-mobile {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border);
    }

    .item-total {
        font-weight: 600;
        color: var(--primary);
    }

    .summary-card {
        max-width: 100%;
    }

    .delivery-option {
        padding: 0.75rem 0.85rem;
    }
}
</style>
