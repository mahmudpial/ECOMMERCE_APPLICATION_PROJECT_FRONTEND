<template>
    <div class="order-success-page" :class="{ dark: isDark }">
        <div class="page-container">

            <!-- Hero section -->
            <div class="success-hero">
                <div class="success-content">
                    <div class="success-badge">
                        <span class="badge-icon">✓</span> Order confirmed
                    </div>
                    <h1>Thank you for your order.</h1>
                    <p v-if="order">
                        We have received order <strong>#{{ order.order_number || order.id }}</strong> and are
                        preparing it for shipment.
                    </p>
                    <p v-else>
                        Your purchase was completed, but we could not load the latest order details from the backend
                        yet.
                    </p>
                    <div class="hero-actions">
                        <router-link to="/products" class="btn-primary">Continue shopping</router-link>
                        <router-link to="/orders" class="btn-secondary">View all orders</router-link>
                        <a v-if="paymentUrl" :href="paymentUrl" target="_blank" rel="noopener"
                            class="btn-secondary">Complete payment</a>
                    </div>
                </div>

                <aside v-if="order" class="receipt-card">
                    <div class="receipt-header">
                        <span class="receipt-label">Receipt</span>
                        <span class="status-chip">{{ statusMeta.label }}</span>
                    </div>
                    <div class="receipt-grid">
                        <div class="receipt-item">
                            <span>Order number</span>
                            <strong>#{{ order.order_number || order.id }}</strong>
                        </div>
                        <div class="receipt-item">
                            <span>Total items</span>
                            <strong>{{ totalItems }}</strong>
                        </div>
                        <div class="receipt-item">
                            <span>Total</span>
                            <strong>৳{{ formatMoney(order.total) }}</strong>
                        </div>
                        <div class="receipt-item">
                            <span>Delivery</span>
                            <strong>{{ order.delivery_label }}</strong>
                        </div>
                    </div>
                </aside>
            </div>

            <!-- Order details (if loaded) -->
            <div v-if="order" class="order-details-grid">
                <div class="details-column">
                    <!-- Timeline / progress -->
                    <div class="info-card">
                        <div class="card-header">
                            <div>
                                <span class="card-kicker">What happens next</span>
                                <h2>Order progress</h2>
                            </div>
                            <span class="payment-chip">{{ paymentMeta.label }}</span>
                        </div>
                        <div class="timeline">
                            <div v-for="(step, idx) in timeline" :key="step.key" class="timeline-step"
                                :class="{ active: idx <= progressIndex }">
                                <div class="step-icon">
                                    <span>{{ getStepIcon(step.icon) }}</span>
                                </div>
                                <div class="step-info">
                                    <strong>{{ step.label }}</strong>
                                    <p>{{ step.description }}</p>
                                </div>
                                <div class="step-time">{{ step.timestamp ? formatDateTime(step.timestamp) : 'Pending' }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Shipping address -->
                    <div class="info-card">
                        <div class="card-header">
                            <div>
                                <span class="card-kicker">Delivery details</span>
                                <h2>Shipping address</h2>
                            </div>
                        </div>
                        <div class="address-block">
                            <strong>{{ order.customer_name }}</strong>
                            <p>{{ order.address_label }}</p>
                            <div class="meta-row">
                                <span>📞 {{ order.customer_mobile || '-' }}</span>
                                <span>✉️ {{ order.customer_email || '-' }}</span>
                            </div>
                            <div class="meta-row">
                                <span>🚚 {{ order.estimated_delivery }}</span>
                                <span>💳 {{ order.payment_label }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order summary sidebar -->
                <aside class="summary-column">
                    <div class="summary-card sticky">
                        <div class="card-header">
                            <div>
                                <span class="card-kicker">Order summary</span>
                                <h2>Items and totals</h2>
                            </div>
                        </div>

                        <div class="items-list">
                            <div v-for="item in order.items" :key="item.id" class="order-item">
                                <img :src="getProductImage(item)" :alt="item.name" />
                                <div class="item-details">
                                    <strong>{{ item.name }}</strong>
                                    <span>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</span>
                                </div>
                                <div class="item-total">৳{{ formatMoney(item.price * item.quantity) }}</div>
                            </div>
                        </div>

                        <div class="totals">
                            <div class="total-row"><span>Subtotal</span><strong>৳{{ formatMoney(order.subtotal)
                                    }}</strong></div>
                            <div class="total-row"><span>Shipping</span><strong>{{ order.shipping_fee === 0 ? 'Free' :
                                `৳${formatMoney(order.shipping_fee)}` }}</strong></div>
                            <div class="total-row"><span>Discount</span><strong>- ৳{{ formatMoney(order.discount)
                                    }}</strong></div>
                            <div class="total-divider"></div>
                            <div class="total-row grand"><span>Total paid</span><strong>৳{{ formatMoney(order.total)
                                    }}</strong></div>
                        </div>
                    </div>
                </aside>
            </div>

            <!-- Fallback (order not loaded) -->
            <div v-else class="fallback-card">
                <div class="fallback-icon">—</div>
                <h2>Order complete</h2>
                <p>Open your order history to review recent purchases or continue shopping for more items.</p>
                <p v-if="loadError" class="error-message">{{ loadError }}</p>
                <div class="fallback-actions">
                    <router-link to="/orders" class="btn-primary">View orders</router-link>
                    <router-link to="/products" class="btn-secondary">Browse products</router-link>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/axios'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import {
    formatDateTime,
    formatMoney,
    getPaymentMeta,
    getProductImage,
    getStatusMeta,
    normalizeOrdersList,
    normalizeOrderRecord,
} from '@/utils/customerCommerce'

const route = useRoute()
const authStore = useCustomerAuthStore()

// Dark mode detection
const isDark = ref(false)
const checkDarkMode = () => {
    isDark.value = document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
}
const updateDarkMode = () => { checkDarkMode() }
const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')
darkModeMedia.addEventListener('change', updateDarkMode)
onMounted(() => {
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    onUnmounted(() => observer.disconnect())
})
onUnmounted(() => {
    darkModeMedia.removeEventListener('change', updateDarkMode)
})

const order = ref(null)
const loadError = ref('')

const paymentUrl = computed(() => String(route.query.payment_url || route.query.paymentUrl || '').trim())

const loadOrder = async () => {
    authStore.loadUser?.()
    const queryOrder = String(route.query.order || route.query.id || '').trim()
    loadError.value = ''
    try {
        if (queryOrder) {
            const response = await api.get(`orders/${encodeURIComponent(queryOrder)}`)
            const payload = response.data.order || response.data.data || response.data
            order.value = normalizeOrderRecord(payload)
            return
        }
        const response = await api.get('orders')
        const orders = normalizeOrdersList(response.data)
        order.value = orders[0] || null
    } catch (error) {
        console.error('Failed to load order details:', error)
        loadError.value = error.response?.data?.message || 'We could not load the order details right now.'
        order.value = null
    }
}

const statusMeta = computed(() => getStatusMeta(order.value?.status || 'processing'))
const paymentMeta = computed(() => getPaymentMeta(order.value?.payment_status || 'pending'))
const totalItems = computed(() => order.value?.item_count || order.value?.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0)

const progressIndex = computed(() => {
    const sequence = ['pending', 'processing', 'packed', 'shipped', 'delivered']
    const index = sequence.indexOf(String(order.value?.status || 'processing').toLowerCase())
    return index === -1 ? 1 : index
})

const timeline = computed(() => {
    const base = order.value?.timeline?.length
        ? order.value.timeline
        : [
            { key: 'placed', label: 'Order placed', description: 'We have received your order and started preparing it.', timestamp: order.value?.created_at || null, icon: 'check' },
            { key: 'packed', label: 'Packed', description: 'Your items will be packed and handed to the courier.', timestamp: null, icon: 'box' },
            { key: 'shipped', label: 'Shipped', description: 'The parcel is moving through the delivery network.', timestamp: null, icon: 'truck' },
            { key: 'delivered', label: 'Delivered', description: 'Your order reaches the shipping address.', timestamp: null, icon: 'check' }
        ]
    return base.map(step => ({
        ...step,
        icon: step.key === 'placed' ? 'check' : step.key === 'packed' ? 'box' : step.key === 'shipped' ? 'truck' : 'check'
    }))
})

const getStepIcon = (icon) => {
    if (icon === 'check') return '✓'
    if (icon === 'box') return '📦'
    if (icon === 'truck') return '🚚'
    return '✓'
}

watch(() => [route.query.order, route.query.id], () => loadOrder())
onMounted(() => { loadOrder() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* Light mode (default) */
.order-success-page {
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
    --danger: #EF4444;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.04);
}

/* Dark mode – triggered by parent .dark class */
.order-success-page.dark {
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
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.order-success-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text-primary);
}

.page-container {
    width: 100%;
}

/* Hero section */
.success-hero {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 2rem;
    background: var(--bg-card);
    border-radius: 20px;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow);
}

.success-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.success-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 0.4rem 1rem;
    border-radius: 30px;
    width: fit-content;
}

.badge-icon {
    font-size: 0.9rem;
}

.success-content h1 {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--text-primary);
}

.success-content p {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
    display: inline-block;
    padding: 0.7rem 1.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 40px;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-primary {
    background: var(--accent);
    color: #FFFFFF;
    border: none;
}

.btn-primary:hover {
    background: #0052CC;
    transform: translateY(-1px);
}

.btn-secondary {
    background: transparent;
    border: 1px solid var(--border-input);
    color: var(--text-primary);
}

.btn-secondary:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
}

/* Receipt card */
.receipt-card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 1.2rem;
    box-shadow: var(--shadow);
}

.receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.receipt-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
}

.status-chip {
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--accent-soft);
    color: var(--accent);
    padding: 0.25rem 0.75rem;
    border-radius: 30px;
}

.receipt-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
}

.receipt-item {
    background: var(--bg-card-soft);
    padding: 0.8rem;
    border-radius: 12px;
}

.receipt-item span {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 0.2rem;
}

.receipt-item strong {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
}

/* Order details grid */
.order-details-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2rem;
}

.details-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-card {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.2rem;
}

.card-kicker {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
}

.card-header h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.2rem 0 0;
    color: var(--text-primary);
}

.payment-chip {
    font-size: 0.65rem;
    background: var(--accent-soft);
    color: var(--accent);
    padding: 0.25rem 0.7rem;
    border-radius: 30px;
    white-space: nowrap;
}

/* Timeline */
.timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.timeline-step {
    display: grid;
    grid-template-columns: 32px 1fr auto;
    gap: 0.8rem;
    align-items: flex-start;
    opacity: 0.5;
}

.timeline-step.active {
    opacity: 1;
}

.step-icon {
    width: 32px;
    height: 32px;
    background: var(--accent-soft);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--accent);
}

.step-info strong {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
}

.step-info p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.step-time {
    font-size: 0.7rem;
    color: var(--text-muted);
    white-space: nowrap;
}

/* Address block */
.address-block {
    background: var(--bg-card-soft);
    border-radius: 16px;
    padding: 1rem;
}

.address-block strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    color: var(--text-primary);
}

.address-block p {
    margin: 0 0 0.8rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.meta-row span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}

/* Summary column */
.summary-column {
    position: relative;
}

.summary-card {
    background: var(--bg-card-soft);
    border-radius: 20px;
    padding: 1.5rem;
}

.summary-card.sticky {
    position: sticky;
    top: 2rem;
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin: 1rem 0;
}

.order-item {
    display: grid;
    grid-template-columns: 48px 1fr auto;
    gap: 0.75rem;
    align-items: center;
    background: var(--bg-card);
    padding: 0.7rem;
    border-radius: 12px;
}

.order-item img {
    width: 48px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
    background: var(--bg-card-soft);
}

.item-details strong {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
}

.item-details span {
    font-size: 0.7rem;
    color: var(--text-muted);
}

.item-total {
    font-weight: 700;
    font-size: 0.8rem;
    white-space: nowrap;
    color: var(--text-primary);
}

.totals {
    border-top: 1px solid var(--border-light);
    padding-top: 1rem;
    margin-top: 0.5rem;
}

.total-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 0.6rem;
    color: var(--text-secondary);
}

.total-row span {
    color: var(--text-muted);
}

.total-divider {
    height: 1px;
    background: var(--border-light);
    margin: 0.5rem 0;
}

.total-row.grand {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-primary);
}

/* Fallback card */
.fallback-card {
    max-width: 500px;
    margin: 3rem auto;
    text-align: center;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 24px;
    padding: 2rem;
}

.fallback-icon {
    font-family: 'Sora', sans-serif;
    font-size: 3rem;
    color: var(--accent);
    opacity: 0.5;
    margin-bottom: 1rem;
}

.fallback-card h2 {
    font-weight: 600;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.fallback-card p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.error-message {
    color: var(--danger);
    font-size: 0.8rem;
}

.fallback-actions {
    display: flex;
    gap: 0.8rem;
    justify-content: center;
    margin-top: 1rem;
}

/* Responsive */
@media (max-width: 1000px) {

    .success-hero,
    .order-details-grid {
        grid-template-columns: 1fr;
    }

    .summary-card.sticky {
        position: static;
    }

    .order-success-page {
        padding: 0 1rem 3rem;
    }
}

@media (max-width: 700px) {
    .success-hero {
        padding: 1.2rem;
    }

    .receipt-grid {
        grid-template-columns: 1fr;
    }

    .timeline-step {
        grid-template-columns: 28px 1fr;
        gap: 0.5rem;
    }

    .step-time {
        grid-column: span 2;
        white-space: normal;
        margin-left: 36px;
    }

    .order-item {
        grid-template-columns: 40px 1fr auto;
    }

    .order-item img {
        width: 40px;
        height: 48px;
    }

    .hero-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .btn-primary,
    .btn-secondary {
        text-align: center;
    }
}
</style>