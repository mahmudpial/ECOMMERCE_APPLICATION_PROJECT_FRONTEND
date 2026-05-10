<template>
    <div class="orders-page" :class="{ dark: isDark }">
        <div class="page-container">

            <!-- Header -->
            <div class="page-header">
                <div class="brand-mark">Commercia</div>
                <h1 class="page-title">Order history</h1>
                <p class="page-sub">Track every purchase in one place.</p>
            </div>

            <!-- Stats cards -->
            <div class="stats-grid">
                <div class="stat-card"><span>Total orders</span><strong>{{ stats.totalOrders }}</strong></div>
                <div class="stat-card"><span>Delivered</span><strong>{{ stats.delivered }}</strong></div>
                <div class="stat-card"><span>Processing</span><strong>{{ stats.processing }}</strong></div>
                <div class="stat-card accent"><span>Total spent</span><strong>৳{{ formatMoney(stats.totalSpent)
                        }}</strong></div>
            </div>

            <!-- Filter bar -->
            <div class="filter-bar">
                <div class="search-field">
                    <span class="search-icon">🔍</span>
                    <input v-model="searchQuery" type="text" placeholder="Search by order number or item name" />
                </div>
                <div class="status-filters">
                    <button v-for="item in statusFilters" :key="item.value" type="button" class="filter-chip"
                        :class="{ active: statusFilter === item.value }" @click="statusFilter = item.value">{{
                        item.label }}</button>
                </div>
                <button class="clear-btn" @click="clearFilters">Clear</button>
            </div>

            <!-- States -->
            <div v-if="loadError" class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h2>Unable to load orders</h2>
                <p>{{ loadError }}</p>
                <button class="btn-primary" @click="loadOrders">Try again</button>
            </div>

            <div v-else-if="isLoading && !orders.length" class="empty-state">
                <div class="empty-icon">⋯</div>
                <h2>Loading orders</h2>
                <p>Fetching your purchases from the backend.</p>
            </div>

            <div v-else-if="!visibleOrders.length" class="empty-state">
                <div class="empty-icon">📦</div>
                <h2>No orders yet</h2>
                <p>Your completed purchases will appear here once you place an order.</p>
                <router-link to="/products" class="btn-primary">Start shopping</router-link>
            </div>

            <!-- Orders list -->
            <div v-else class="orders-list">
                <article v-for="order in visibleOrders" :key="order.id" class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-number">#{{ order.order_number || order.id }}</div>
                            <div class="order-meta">
                                <span>{{ formatDateTime(order.created_at) }}</span>
                                <span>•</span>
                                <span>{{ order.item_count || order.items?.length || 0 }} item(s)</span>
                            </div>
                        </div>
                        <div class="order-badges">
                            <span class="badge" :class="`status-${getStatusMeta(order.status).tone}`">
                                {{ getStatusMeta(order.status).label }}
                            </span>
                            <span class="badge payment" :class="`payment-${getPaymentMeta(order.payment_status).tone}`">
                                {{ getPaymentMeta(order.payment_status).label }}
                            </span>
                        </div>
                    </div>

                    <div class="order-body">
                        <div class="preview-section">
                            <div class="item-preview">
                                <img v-for="item in order.items?.slice(0, 3)" :key="item.id"
                                    :src="getProductImage(item)" :alt="item.name" />
                                <div v-if="(order.items?.length || 0) > 3" class="more-indicator">
                                    +{{ (order.items?.length || 0) - 3 }}
                                </div>
                            </div>
                            <div class="shipping-preview">
                                <strong>{{ order.customer_name }}</strong>
                                <p>{{ order.address_label }}</p>
                            </div>
                        </div>

                        <div class="summary-section">
                            <div class="summary-row"><span>Total</span><strong>৳{{ formatMoney(order.total) }}</strong>
                            </div>
                            <div class="summary-row"><span>Delivery</span><strong>{{ order.delivery_label }}</strong>
                            </div>
                            <div class="summary-row"><span>Payment</span><strong>{{ order.payment_label }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="order-actions">
                        <button class="btn-outline" @click="toggleOrder(order.id)">
                            <span>{{ expandedOrderId === order.id ? '−' : '+' }}</span>
                            {{ expandedOrderId === order.id ? 'Hide details' : 'View details' }}
                        </button>
                        <button class="btn-primary small" @click="reorder(order)">Reorder</button>
                        <button class="btn-outline" @click="openSuccess(order)">Receipt</button>
                    </div>

                    <transition name="expand">
                        <div v-if="expandedOrderId === order.id" class="expanded-content">
                            <div class="details-grid">
                                <div class="detail-block">
                                    <div class="detail-label">Shipping address</div>
                                    <strong>{{ order.address_label }}</strong>
                                    <p>{{ order.customer_mobile || '-' }}<br />{{ order.customer_email || '-' }}</p>
                                </div>
                                <div class="detail-block">
                                    <div class="detail-label">Delivery estimate</div>
                                    <strong>{{ order.estimated_delivery }}</strong>
                                    <p>{{ order.delivery_label }}</p>
                                </div>
                                <div class="detail-block">
                                    <div class="detail-label">Order note</div>
                                    <strong>{{ order.notes ? 'Included' : 'None' }}</strong>
                                    <p>{{ order.notes || 'No delivery note was added.' }}</p>
                                </div>
                            </div>

                            <div class="timeline">
                                <div v-for="(step, idx) in buildTimeline(order)" :key="step.key" class="timeline-step"
                                    :class="{ active: idx <= getProgressIndex(order.status) }">
                                    <div class="step-icon">{{ getStepIcon(step.icon) }}</div>
                                    <div class="step-info">
                                        <strong>{{ step.label }}</strong>
                                        <p>{{ step.description }}</p>
                                    </div>
                                    <div class="step-time">{{ step.timestamp ? formatDateTime(step.timestamp) :
                                        'Pending' }}</div>
                                </div>
                            </div>

                            <div class="items-list">
                                <div v-for="item in order.items" :key="item.id" class="item-row">
                                    <img :src="getProductImage(item)" :alt="item.name" />
                                    <div class="item-details">
                                        <strong>{{ item.name }}</strong>
                                        <p>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</p>
                                    </div>
                                    <div class="item-total">৳{{ formatMoney(item.price * item.quantity) }}</div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </article>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCartStore } from '@/stores/cart'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import {
    formatDateTime,
    formatMoney,
    getPaymentMeta,
    getProductImage,
    getStatusMeta,
    normalizeOrdersList,
} from '@/utils/customerCommerce'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useCustomerAuthStore()

// Dark mode detection
const isDark = ref(false)
const checkDarkMode = () => {
    isDark.value = document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
}
const updateDarkMode = () => {
    checkDarkMode()
}
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

const searchQuery = ref('')
const statusFilter = ref('all')
const expandedOrderId = ref(null)
const orders = ref([])
const isLoading = ref(false)
const loadError = ref('')

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const loadOrders = async () => {
    authStore.loadUser?.()
    isLoading.value = true
    loadError.value = ''
    try {
        const response = await api.get('orders')
        const list = normalizeOrdersList(response.data)
        orders.value = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
        console.error('Failed to load customer orders:', error)
        orders.value = []
        loadError.value = error.response?.data?.message || 'We could not load your orders right now.'
    } finally {
        isLoading.value = false
    }
}

const visibleOrders = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return orders.value.filter(order => {
        const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value
        const matchesQuery = !query ||
            String(order.order_number || order.id).toLowerCase().includes(query) ||
            String(order.customer_name || '').toLowerCase().includes(query) ||
            String(order.address_label || '').toLowerCase().includes(query) ||
            (order.items || []).some(item => String(item.name || '').toLowerCase().includes(query))
        return matchesStatus && matchesQuery
    })
})

const stats = computed(() => {
    const totalOrders = orders.value.length
    const delivered = orders.value.filter(o => o.status === 'delivered').length
    const processing = orders.value.filter(o => o.status === 'processing').length
    const totalSpent = orders.value.reduce((sum, o) => sum + Number(o.total || 0), 0)
    return { totalOrders, delivered, processing, totalSpent }
})

const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
}

const toggleOrder = (orderId) => {
    expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}

const openSuccess = (order) => {
    router.push({ path: '/order/success', query: { order: order.order_number || order.id } })
}

const reorder = (order) => {
    if (!order?.items?.length) return
    order.items.forEach(item => {
        const product = item.product || {
            id: item.product_id || item.id,
            name: item.name,
            price: item.price,
            discount_price: item.product?.discount_price || null,
            images: item.images,
            slug: item.slug || null,
        }
        cartStore.addItem(product, item.quantity || 1)
    })
    router.push('/cart')
}

const buildTimeline = (order) => {
    const base = order?.timeline?.length ? order.timeline : [
        { key: 'placed', label: 'Order placed', description: 'We have received your order.', timestamp: order?.created_at || null, icon: 'check' },
        { key: 'packed', label: 'Packed', description: 'Items are being prepared for dispatch.', timestamp: null, icon: 'box' },
        { key: 'shipped', label: 'Shipped', description: 'Your parcel is on the way.', timestamp: null, icon: 'truck' },
        { key: 'delivered', label: 'Delivered', description: 'The parcel has arrived successfully.', timestamp: null, icon: 'check' }
    ]
    return base
}

const getStepIcon = (icon) => {
    if (icon === 'check' || icon === 'fas fa-circle-check') return '✓'
    if (icon === 'box' || icon === 'fas fa-box') return '📦'
    if (icon === 'truck' || icon === 'fas fa-truck-fast') return '🚚'
    return '✓'
}

const getProgressIndex = (status) => {
    const order = ['pending', 'processing', 'packed', 'shipped', 'delivered']
    const idx = order.indexOf(String(status || 'processing').toLowerCase())
    return idx === -1 ? 1 : idx
}

onMounted(() => { loadOrders() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* CSS Variables for light/dark mode */
.orders-page {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --stat-bg: #FFFFFF;
    --shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.orders-page.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --stat-bg: #2A2F3A;
    --shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.orders-page {
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text-primary);
    min-height: 100vh;
}

.page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
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
    font-size: 0.95rem;
    color: var(--text-secondary);
}

/* Stats cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--stat-bg);
    border-radius: 16px;
    padding: 1rem;
    border: 1px solid var(--border-light);
}

.stat-card span {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.3rem;
}

.stat-card strong {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-card.accent {
    background: var(--accent-soft);
    border-color: var(--accent);
}

.stat-card.accent strong {
    color: var(--accent);
}

/* Filter bar */
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-light);
}

.search-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-input);
    border-radius: 40px;
    padding: 0.5rem 1rem;
    flex: 1 1 280px;
}

.search-icon {
    font-size: 0.9rem;
    color: var(--text-muted);
}

.search-field input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.85rem;
    width: 100%;
    color: var(--text-primary);
}

.status-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-chip {
    background: none;
    border: 1px solid var(--border-input);
    border-radius: 30px;
    padding: 0.4rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-primary);
}

.filter-chip.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.clear-btn {
    background: none;
    border: none;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.4rem 1rem;
}

.clear-btn:hover {
    color: var(--accent);
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
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.6;
}

.empty-state h2 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.2rem;
}

.btn-primary {
    display: inline-block;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 40px;
    padding: 0.7rem 1.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: none;
}

.btn-primary.small {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
}

/* Orders list */
.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.order-card {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 1.2rem;
    border: 1px solid var(--border-light);
    transition: box-shadow 0.2s;
}

.order-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
}

.order-number {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
}

.order-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
}

.order-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.25rem 0.7rem;
    border-radius: 30px;
}

.badge.status-success {
    background: #E8F5E9;
    color: #2E7D32;
}

.badge.status-info {
    background: #E3F2FD;
    color: #1565C0;
}

.badge.status-warning {
    background: #FFF3E0;
    color: #E65100;
}

.badge.status-danger {
    background: #FFEBEE;
    color: #C62828;
}

.badge.payment {
    background: var(--border-light);
    color: var(--text-secondary);
}

/* Order body */
.order-body {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 1rem;
    margin-bottom: 1rem;
}

.preview-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.item-preview {
    display: flex;
    align-items: center;
}

.item-preview img {
    width: 48px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
    background: var(--border-light);
    margin-left: -6px;
    border: 1px solid var(--bg-card);
}

.item-preview img:first-child {
    margin-left: 0;
}

.more-indicator {
    width: 48px;
    height: 56px;
    background: var(--border-light);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-left: -6px;
}

.shipping-preview strong {
    display: block;
    font-size: 0.85rem;
}

.shipping-preview p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.summary-section {
    background: var(--bg-page);
    border-radius: 12px;
    padding: 0.8rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
    color: var(--text-secondary);
}

.summary-row strong {
    color: var(--text-primary);
}

/* Action buttons */
.order-actions {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--border-input);
    border-radius: 30px;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    color: var(--text-primary);
    transition: all 0.2s;
}

.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.btn-primary.small {
    background: var(--accent);
    color: white;
}

/* Expanded content */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.expanded-content {
    margin-top: 1.2rem;
    padding-top: 1.2rem;
    border-top: 1px solid var(--border-light);
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    margin-bottom: 1.2rem;
}

.detail-block {
    background: var(--bg-page);
    border-radius: 12px;
    padding: 0.8rem;
}

.detail-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.3rem;
}

.detail-block strong {
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
}

.detail-block p {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
}

/* Timeline */
.timeline {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
}

.timeline-step {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    gap: 0.8rem;
    align-items: flex-start;
    opacity: 0.5;
}

.timeline-step.active {
    opacity: 1;
}

.step-icon {
    width: 28px;
    height: 28px;
    background: var(--accent-soft);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: var(--accent);
}

.step-info strong {
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.1rem;
    color: var(--text-primary);
}

.step-info p {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin: 0;
}

.step-time {
    font-size: 0.7rem;
    color: var(--text-muted);
    white-space: nowrap;
}

/* Items list */
.items-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.item-row {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 0.8rem;
    align-items: center;
    padding: 0.5rem;
    background: var(--bg-page);
    border-radius: 12px;
}

.item-row img {
    width: 40px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
}

.item-details strong {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 0.1rem;
    color: var(--text-primary);
}

.item-details p {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin: 0;
}

.item-total {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--text-primary);
}

/* Responsive */
@media (max-width: 800px) {
    .page-container {
        padding: 0 1rem 3rem;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .order-body {
        grid-template-columns: 1fr;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .timeline-step {
        grid-template-columns: 28px 1fr;
    }

    .step-time {
        grid-column: span 2;
        margin-left: 36px;
        white-space: normal;
    }
}

@media (max-width: 500px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .filter-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-field {
        width: 100%;
    }

    .status-filters {
        justify-content: center;
    }
}

@media (prefers-color-scheme: dark) {
    .orders-page:not(.dark) {
        --bg-page: #0F1218;
        --bg-card: #1A1E26;
        --text-primary: #E8EDF2;
        --text-secondary: #9AA8B8;
        --text-muted: #6B7A8A;
        --border-light: #2A2F3A;
        --border-input: #3A4050;
        --accent: #3B82F6;
        --accent-soft: #1E2A3A;
        --stat-bg: #2A2F3A;
    }
}
</style>