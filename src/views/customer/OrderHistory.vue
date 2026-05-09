<template>
    <div class="order-history-page">
        <section class="orders-hero">
            <div class="hero-copy">
                <span class="eyebrow">My orders</span>
                <h1>Track every purchase in one place.</h1>
                <p>
                    View your recent orders, check delivery status, and quickly reorder items you love.
                </p>
            </div>

            <div class="hero-stats">
                <article class="stat-card">
                    <span>Total orders</span>
                    <strong>{{ stats.totalOrders }}</strong>
                </article>
                <article class="stat-card">
                    <span>Delivered</span>
                    <strong>{{ stats.delivered }}</strong>
                </article>
                <article class="stat-card">
                    <span>Processing</span>
                    <strong>{{ stats.processing }}</strong>
                </article>
                <article class="stat-card accent">
                    <span>Spent</span>
                    <strong>৳{{ formatMoney(stats.totalSpent) }}</strong>
                </article>
            </div>
        </section>

        <section class="filter-bar">
            <label class="search-field">
                <i class="fas fa-search"></i>
                <input v-model="searchQuery" type="text" placeholder="Search by order number or item name" />
            </label>

            <div class="status-chips">
                <button
                    v-for="item in statusFilters"
                    :key="item.value"
                    type="button"
                    class="status-chip"
                    :class="{ active: statusFilter === item.value }"
                    @click="statusFilter = item.value"
                >
                    {{ item.label }}
                </button>
            </div>

            <button class="clear-btn" type="button" @click="clearFilters">
                Clear filters
            </button>
        </section>

        <div v-if="loadError" class="empty-state">
            <div class="empty-card">
                <div class="empty-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>
                <h2>Unable to load orders</h2>
                <p>{{ loadError }}</p>
                <button type="button" class="btn-primary" @click="loadOrders">Try again</button>
            </div>
        </div>

        <div v-else-if="isLoading && !orders.length" class="empty-state">
            <div class="empty-card">
                <div class="empty-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h2>Loading orders</h2>
                <p>We are fetching your purchases from the backend.</p>
            </div>
        </div>

        <div v-else-if="!visibleOrders.length" class="empty-state">
            <div class="empty-card">
                <div class="empty-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h2>No orders yet</h2>
                <p>Your completed purchases will appear here once you place an order.</p>
                <router-link to="/products" class="btn-primary">Start shopping</router-link>
            </div>
        </div>

        <div v-else class="orders-list">
            <article v-for="order in visibleOrders" :key="order.id" class="order-card">
                <div class="order-head">
                    <div>
                        <div class="order-number">#{{ order.order_number || order.id }}</div>
                        <div class="order-meta">
                            <span>{{ formatDateTime(order.created_at) }}</span>
                            <span>•</span>
                            <span>{{ order.item_count || order.items?.length || 0 }} item(s)</span>
                        </div>
                    </div>

                    <div class="order-badges">
                        <span class="badge" :class="`tone-${getStatusMeta(order.status).tone}`">
                            <i :class="getStatusMeta(order.status).icon"></i>
                            {{ getStatusMeta(order.status).label }}
                        </span>
                        <span class="badge subtle" :class="`tone-${getPaymentMeta(order.payment_status).tone}`">
                            {{ getPaymentMeta(order.payment_status).label }}
                        </span>
                    </div>
                </div>

                <div class="order-body">
                    <div class="order-preview">
                        <div class="item-stack">
                            <img
                                v-for="item in order.items?.slice(0, 3)"
                                :key="item.id"
                                :src="getProductImage(item)"
                                :alt="item.name"
                            />
                            <div v-if="(order.items?.length || 0) > 3" class="more-items">
                                +{{ (order.items?.length || 0) - 3 }}
                            </div>
                        </div>
                        <div class="preview-copy">
                            <strong>{{ order.customer_name }}</strong>
                            <p>{{ order.address_label }}</p>
                        </div>
                    </div>

                    <div class="order-summary">
                        <div class="summary-line">
                            <span>Total</span>
                            <strong>৳{{ formatMoney(order.total) }}</strong>
                        </div>
                        <div class="summary-line">
                            <span>Delivery</span>
                            <strong>{{ order.delivery_label }}</strong>
                        </div>
                        <div class="summary-line">
                            <span>Payment</span>
                            <strong>{{ order.payment_label }}</strong>
                        </div>
                    </div>
                </div>

                <div class="order-actions">
                    <button class="secondary-btn" type="button" @click="toggleOrder(order.id)">
                        <i :class="expandedOrderId === order.id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                        {{ expandedOrderId === order.id ? 'Hide details' : 'View details' }}
                    </button>
                    <button class="primary-btn" type="button" @click="reorder(order)">
                        <i class="fas fa-cart-shopping"></i>
                        Reorder
                    </button>
                    <button class="ghost-btn" type="button" @click="openSuccess(order)">
                        View receipt
                    </button>
                </div>

                <transition name="fade-expand">
                    <div v-if="expandedOrderId === order.id" class="expanded-panel">
                        <div class="detail-grid">
                            <div class="detail-card">
                                <span class="detail-label">Shipping address</span>
                                <strong>{{ order.address_label }}</strong>
                                <p>{{ order.customer_mobile || '-' }}<br />{{ order.customer_email || '-' }}</p>
                            </div>
                            <div class="detail-card">
                                <span class="detail-label">Delivery estimate</span>
                                <strong>{{ order.estimated_delivery }}</strong>
                                <p>{{ order.delivery_label }}</p>
                            </div>
                            <div class="detail-card">
                                <span class="detail-label">Order note</span>
                                <strong>{{ order.notes ? 'Included' : 'None' }}</strong>
                                <p>{{ order.notes || 'No delivery note was added.' }}</p>
                            </div>
                        </div>

                        <div class="timeline">
                            <div
                                v-for="(step, index) in buildTimeline(order)"
                                :key="step.key"
                                class="timeline-step"
                                :class="{ active: index <= getProgressIndex(order.status) }"
                            >
                                <div class="step-dot">
                                    <i :class="step.icon"></i>
                                </div>
                                <div class="step-copy">
                                    <strong>{{ step.label }}</strong>
                                    <p>{{ step.description }}</p>
                                </div>
                                <span class="step-time">{{ step.timestamp ? formatDateTime(step.timestamp) : 'Pending' }}</span>
                            </div>
                        </div>

                        <div class="line-item-grid">
                            <article v-for="item in order.items" :key="item.id" class="line-item">
                                <img :src="getProductImage(item)" :alt="item.name" />
                                <div>
                                    <strong>{{ item.name }}</strong>
                                    <p>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</p>
                                </div>
                                <span>৳{{ formatMoney(item.price * item.quantity) }}</span>
                            </article>
                        </div>
                    </div>
                </transition>
            </article>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
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

    return orders.value.filter((order) => {
        const matchesStatus = statusFilter.value === 'all' || order.status === statusFilter.value
        const matchesQuery =
            !query ||
            String(order.order_number || order.id).toLowerCase().includes(query) ||
            String(order.customer_name || '').toLowerCase().includes(query) ||
            String(order.address_label || '').toLowerCase().includes(query) ||
            (order.items || []).some((item) => String(item.name || '').toLowerCase().includes(query))

        return matchesStatus && matchesQuery
    })
})

const stats = computed(() => {
    const totalOrders = orders.value.length
    const delivered = orders.value.filter((order) => order.status === 'delivered').length
    const processing = orders.value.filter((order) => order.status === 'processing').length
    const totalSpent = orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0)

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

    order.items.forEach((item) => {
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
    const base = order?.timeline?.length
        ? order.timeline
        : [
              {
                  key: 'placed',
                  label: 'Order placed',
                  description: 'We have received your order.',
                  timestamp: order?.created_at || null,
                  icon: 'fas fa-circle-check',
              },
              {
                  key: 'packed',
                  label: 'Packed',
                  description: 'Items are being prepared for dispatch.',
                  timestamp: null,
                  icon: 'fas fa-box',
              },
              {
                  key: 'shipped',
                  label: 'Shipped',
                  description: 'Your parcel is on the way.',
                  timestamp: null,
                  icon: 'fas fa-truck-fast',
              },
              {
                  key: 'delivered',
                  label: 'Delivered',
                  description: 'The parcel has arrived successfully.',
                  timestamp: null,
                  icon: 'fas fa-circle-check',
              },
          ]

    return base.map((step) => ({
        ...step,
        icon:
            step.key === 'placed'
                ? 'fas fa-circle-check'
                : step.key === 'packed'
                  ? 'fas fa-box'
                  : step.key === 'shipped'
                    ? 'fas fa-truck-fast'
                    : 'fas fa-circle-check',
    }))
}

const getProgressIndex = (status) => {
    const order = ['pending', 'processing', 'packed', 'shipped', 'delivered']
    const idx = order.indexOf(String(status || 'processing').toLowerCase())
    return idx === -1 ? 1 : idx
}

onMounted(() => {
    loadOrders()
})
</script>

<style scoped>
.order-history-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}

.orders-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1.5rem;
    border-radius: 1.75rem;
    background:
        radial-gradient(circle at top right, rgba(20, 184, 166, 0.16), transparent 28%),
        linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0.02));
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.hero-copy h1 {
    margin: 1rem 0 0.7rem;
    font-size: clamp(2rem, 3.5vw, 3.4rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
}

.hero-copy p {
    max-width: 58ch;
    color: var(--text-muted);
    line-height: 1.7;
}

.hero-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
}

.stat-card {
    padding: 1rem;
    border-radius: 1.25rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
}

.stat-card span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.stat-card strong {
    font-size: 1.45rem;
    color: var(--text);
}

.stat-card.accent {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(20, 184, 166, 0.12));
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 1.25rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
}

.search-field {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex: 1 1 320px;
    padding: 0.8rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--border);
}

.search-field i {
    color: var(--text-muted);
}

.search-field input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    color: var(--text);
}

.status-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.status-chip,
.clear-btn {
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.75);
    color: var(--text);
    border-radius: 999px;
    padding: 0.65rem 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s, background 0.2s;
}

.status-chip:hover,
.clear-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(59, 130, 246, 0.35);
}

.status-chip.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
}

.clear-btn {
    margin-left: auto;
}

.empty-state {
    display: grid;
    place-items: center;
    padding: 2rem 0;
}

.empty-card {
    width: min(100%, 500px);
    padding: 2rem;
    text-align: center;
    border-radius: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.empty-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    display: grid;
    place-items: center;
    border-radius: 1.2rem;
    color: var(--primary);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(20, 184, 166, 0.16));
    font-size: 1.6rem;
}

.empty-card h2 {
    margin-bottom: 0.5rem;
}

.empty-card p {
    color: var(--text-muted);
    margin-bottom: 1.25rem;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 999px;
    padding: 0.9rem 1.35rem;
    background: var(--primary);
    color: white;
    text-decoration: none;
    font-weight: 700;
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.25);
}

.orders-list {
    display: grid;
    gap: 1rem;
}

.order-card {
    padding: 1.25rem;
    border-radius: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.order-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.order-number {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text);
}

.order-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
    margin-top: 0.35rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.order-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
}

.badge.subtle {
    background: rgba(148, 163, 184, 0.12);
}

.tone-warning {
    background: rgba(245, 158, 11, 0.12);
    color: #92400e;
}

.tone-info {
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
}

.tone-primary {
    background: rgba(14, 165, 233, 0.12);
    color: #0369a1;
}

.tone-accent {
    background: rgba(20, 184, 166, 0.12);
    color: #0f766e;
}

.tone-success {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.tone-danger {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.order-body {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
    gap: 1rem;
    margin-top: 1rem;
}

.order-preview {
    display: flex;
    gap: 1rem;
    align-items: center;
    min-width: 0;
}

.item-stack {
    display: flex;
    align-items: center;
}

.item-stack img,
.more-items {
    width: 52px;
    height: 52px;
    border-radius: 0.9rem;
    border: 2px solid var(--card);
    box-shadow: var(--shadow);
}

.item-stack img {
    object-fit: cover;
    margin-left: -0.55rem;
    background: var(--bg);
}

.item-stack img:first-child {
    margin-left: 0;
}

.more-items {
    margin-left: -0.55rem;
    display: grid;
    place-items: center;
    background: rgba(59, 130, 246, 0.08);
    color: var(--primary);
    font-weight: 800;
}

.preview-copy {
    min-width: 0;
}

.preview-copy strong {
    display: block;
    margin-bottom: 0.2rem;
}

.preview-copy p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.55;
}

.order-summary {
    padding: 1rem;
    border-radius: 1.25rem;
    background: rgba(59, 130, 246, 0.05);
    display: grid;
    gap: 0.7rem;
}

.summary-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--text);
}

.summary-line span {
    color: var(--text-muted);
}

.order-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border-radius: 999px;
    padding: 0.8rem 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.primary-btn {
    border: none;
    background: var(--primary);
    color: #fff;
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.24);
}

.secondary-btn,
.ghost-btn {
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.72);
    color: var(--text);
}

.primary-btn:hover,
.secondary-btn:hover,
.ghost-btn:hover,
.clear-btn:hover,
.status-chip:hover {
    transform: translateY(-1px);
}

.expanded-panel {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
}

.detail-card {
    padding: 1rem;
    border-radius: 1.15rem;
    background: rgba(59, 130, 246, 0.05);
}

.detail-label {
    display: inline-block;
    margin-bottom: 0.35rem;
    color: var(--text-muted);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.detail-card strong {
    display: block;
    margin-bottom: 0.35rem;
}

.detail-card p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.55;
}

.timeline {
    display: grid;
    gap: 0.9rem;
    margin-top: 1rem;
}

.timeline-step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.85rem;
    align-items: flex-start;
    opacity: 0.58;
}

.timeline-step.active {
    opacity: 1;
}

.step-dot {
    width: 2.3rem;
    height: 2.3rem;
    display: grid;
    place-items: center;
    border-radius: 0.85rem;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
}

.step-copy strong {
    display: block;
    margin-bottom: 0.15rem;
}

.step-copy p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.45;
}

.step-time {
    color: var(--text-muted);
    font-size: 0.85rem;
    white-space: nowrap;
}

.line-item-grid {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
}

.line-item {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 0.8rem;
    align-items: center;
    padding: 0.8rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.62);
    border: 1px solid var(--border);
}

.line-item img {
    width: 52px;
    height: 52px;
    border-radius: 0.85rem;
    object-fit: cover;
}

.line-item strong {
    display: block;
    margin-bottom: 0.15rem;
}

.line-item p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.86rem;
}

.fade-expand-enter-active,
.fade-expand-leave-active {
    transition: all 0.25s ease;
}

.fade-expand-enter-from,
.fade-expand-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@media (max-width: 1100px) {
    .orders-hero,
    .order-body,
    .detail-grid {
        grid-template-columns: 1fr;
    }

    .clear-btn {
        margin-left: 0;
    }
}

@media (max-width: 700px) {
    .order-history-page {
        padding: 0 0.75rem 1.5rem;
    }

    .orders-hero,
    .order-card,
    .filter-bar,
    .empty-card {
        border-radius: 1.25rem;
    }

    .hero-stats {
        grid-template-columns: 1fr;
    }

    .filter-bar {
        padding: 0.85rem;
    }

    .status-chips {
        width: 100%;
    }

    .status-chip {
        flex: 1 1 auto;
    }

    .order-head,
    .order-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .order-badges {
        justify-content: flex-start;
    }

    .timeline-step,
    .line-item {
        grid-template-columns: 1fr;
    }

    .step-time {
        white-space: normal;
    }
}
</style>
