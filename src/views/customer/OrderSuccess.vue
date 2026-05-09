<template>
    <div class="success-page">
        <section class="success-hero">
            <div class="success-copy">
                <div class="success-badge">
                    <i class="fas fa-circle-check"></i>
                    Order confirmed
                </div>
                <h1>Thank you for your order.</h1>
                <p v-if="order">
                    We have received order <strong>#{{ order.order_number || order.id }}</strong> and are
                    preparing it for shipment.
                </p>
                <p v-else>
                    Your purchase was completed, but we could not load the latest order details from the backend yet.
                </p>

                <div class="hero-actions">
                    <router-link to="/products" class="primary-btn">Continue shopping</router-link>
                    <router-link to="/orders" class="secondary-btn">View all orders</router-link>
                    <a v-if="paymentUrl" :href="paymentUrl" target="_blank" rel="noopener" class="secondary-btn">Complete payment</a>
                </div>
            </div>

            <aside v-if="order" class="receipt-card">
                <div class="receipt-top">
                    <span class="receipt-label">Receipt</span>
                    <span class="receipt-chip">{{ statusMeta.label }}</span>
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
        </section>

        <div v-if="order" class="content-grid">
            <section class="detail-panel">
                <div class="panel-card">
                    <div class="panel-header">
                        <div>
                            <span class="panel-kicker">What happens next</span>
                            <h2>Order progress</h2>
                        </div>
                        <span class="summary-chip">{{ paymentMeta.label }}</span>
                    </div>

                    <div class="timeline">
                        <article
                            v-for="(step, index) in timeline"
                            :key="step.key"
                            class="timeline-step"
                            :class="{ active: index <= progressIndex }"
                        >
                            <div class="step-dot">
                                <i :class="step.icon"></i>
                            </div>
                            <div class="step-copy">
                                <strong>{{ step.label }}</strong>
                                <p>{{ step.description }}</p>
                            </div>
                            <span class="step-time">{{ step.timestamp ? formatDateTime(step.timestamp) : 'Pending' }}</span>
                        </article>
                    </div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <div>
                            <span class="panel-kicker">Delivery details</span>
                            <h2>Shipping address</h2>
                        </div>
                    </div>

                    <div class="address-card">
                        <strong>{{ order.customer_name }}</strong>
                        <p>{{ order.address_label }}</p>
                        <div class="meta-row">
                            <span><i class="fas fa-phone"></i> {{ order.customer_mobile || '-' }}</span>
                            <span><i class="fas fa-envelope"></i> {{ order.customer_email || '-' }}</span>
                        </div>
                        <div class="meta-row">
                            <span><i class="fas fa-truck-fast"></i> {{ order.estimated_delivery }}</span>
                            <span><i class="fas fa-credit-card"></i> {{ order.payment_label }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <aside class="summary-panel">
                <div class="panel-card sticky">
                    <div class="panel-header">
                        <div>
                            <span class="panel-kicker">Order summary</span>
                            <h2>Items and totals</h2>
                        </div>
                    </div>

                    <div class="items-list">
                        <article v-for="item in order.items" :key="item.id" class="order-item">
                            <img :src="getProductImage(item)" :alt="item.name" />
                            <div class="item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</span>
                            </div>
                            <div class="item-total">৳{{ formatMoney(item.price * item.quantity) }}</div>
                        </article>
                    </div>

                    <div class="totals">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <strong>৳{{ formatMoney(order.subtotal) }}</strong>
                        </div>
                        <div class="total-row">
                            <span>Shipping</span>
                            <strong>{{ order.shipping_fee === 0 ? 'Free' : `৳${formatMoney(order.shipping_fee)}` }}</strong>
                        </div>
                        <div class="total-row">
                            <span>Discount</span>
                            <strong>- ৳{{ formatMoney(order.discount) }}</strong>
                        </div>
                        <div class="total-row grand">
                            <span>Total paid</span>
                            <strong>৳{{ formatMoney(order.total) }}</strong>
                        </div>
                    </div>
                </div>
            </aside>
        </div>

        <div v-else class="fallback-card">
            <div class="fallback-icon">
                <i class="fas fa-gift"></i>
            </div>
            <h2>Order complete</h2>
            <p>Open your order history to review recent purchases or continue shopping for more items.</p>
            <p v-if="loadError" class="fallback-error">{{ loadError }}</p>
            <div class="hero-actions centered">
                <router-link to="/orders" class="primary-btn">View orders</router-link>
                <router-link to="/products" class="secondary-btn">Browse products</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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
              {
                  key: 'placed',
                  label: 'Order placed',
                  description: 'We have received your order and started preparing it.',
                  timestamp: order.value?.created_at || null,
                  icon: 'fas fa-circle-check',
              },
              {
                  key: 'packed',
                  label: 'Packed',
                  description: 'Your items will be packed and handed to the courier.',
                  timestamp: null,
                  icon: 'fas fa-box',
              },
              {
                  key: 'shipped',
                  label: 'Shipped',
                  description: 'The parcel is moving through the delivery network.',
                  timestamp: null,
                  icon: 'fas fa-truck-fast',
              },
              {
                  key: 'delivered',
                  label: 'Delivered',
                  description: 'Your order reaches the shipping address.',
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
})

watch(
    () => [route.query.order, route.query.id],
    () => loadOrder(),
)

onMounted(() => {
    loadOrder()
})
</script>

<style scoped>
.success-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}

.success-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1.5rem;
    border-radius: 1.75rem;
    background:
        radial-gradient(circle at top right, rgba(16, 185, 129, 0.18), transparent 30%),
        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.12), transparent 34%),
        linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(16, 185, 129, 0.05));
}

.success-copy h1 {
    margin: 0.9rem 0 0.7rem;
    font-size: clamp(2.2rem, 4vw, 3.8rem);
    letter-spacing: -0.04em;
    line-height: 1.02;
}

.success-copy p {
    max-width: 58ch;
    color: var(--text-muted);
    line-height: 1.7;
}

.success-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    font-weight: 800;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.hero-actions.centered {
    justify-content: center;
}

.primary-btn,
.secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 0.9rem 1.3rem;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: #fff;
    box-shadow: 0 16px 34px rgba(59, 130, 246, 0.24);
}

.secondary-btn {
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
}

.primary-btn:hover,
.secondary-btn:hover {
    transform: translateY(-1px);
}

.receipt-card,
.panel-card,
.fallback-card {
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.receipt-card {
    border-radius: 1.4rem;
    padding: 1.15rem;
}

.receipt-top,
.panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.receipt-label,
.panel-kicker {
    display: inline-flex;
    margin-bottom: 0.35rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.receipt-chip,
.summary-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    font-size: 0.82rem;
    font-weight: 800;
    white-space: nowrap;
}

.receipt-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
    margin-top: 1rem;
}

.receipt-item {
    padding: 0.9rem;
    border-radius: 1.1rem;
    background: rgba(59, 130, 246, 0.05);
}

.receipt-item span {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--text-muted);
    font-size: 0.85rem;
}

.receipt-item strong {
    display: block;
    font-size: 0.96rem;
    color: var(--text);
}

.content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 1rem;
}

.detail-panel {
    display: grid;
    gap: 1rem;
}

.panel-card {
    border-radius: 1.5rem;
    padding: 1.25rem;
}

.panel-card.sticky {
    position: sticky;
    top: 6rem;
}

.panel-header h2 {
    margin: 0;
    font-size: 1.2rem;
}

.timeline {
    display: grid;
    gap: 0.9rem;
}

.timeline-step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0.85rem;
    align-items: flex-start;
    opacity: 0.54;
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
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.step-copy strong {
    display: block;
    margin-bottom: 0.15rem;
}

.step-copy p,
.address-card p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.55;
}

.step-time {
    color: var(--text-muted);
    font-size: 0.85rem;
    white-space: nowrap;
}

.address-card {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 1.15rem;
    background: rgba(59, 130, 246, 0.05);
}

.address-card strong {
    font-size: 1rem;
}

.meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
    color: var(--text-muted);
}

.meta-row span {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
}

.items-list {
    display: grid;
    gap: 0.8rem;
    margin-top: 1rem;
}

.order-item {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid var(--border);
}

.order-item img {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 0.85rem;
}

.item-copy strong {
    display: block;
    margin-bottom: 0.15rem;
}

.item-copy span {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.item-total {
    font-weight: 800;
    white-space: nowrap;
}

.totals {
    display: grid;
    gap: 0.7rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.total-row span {
    color: var(--text-muted);
}

.total-row.grand {
    padding-top: 0.2rem;
    font-size: 1.05rem;
}

.fallback-card {
    width: min(100%, 560px);
    margin: 0 auto;
    padding: 2rem;
    border-radius: 1.5rem;
    text-align: center;
}

.fallback-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    display: grid;
    place-items: center;
    border-radius: 1.25rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(59, 130, 246, 0.16));
    color: #047857;
    font-size: 1.7rem;
}

.fallback-card h2 {
    margin-bottom: 0.45rem;
}

.fallback-card p {
    color: var(--text-muted);
    margin-bottom: 1.25rem;
}

@media (max-width: 1100px) {
    .success-hero,
    .content-grid {
        grid-template-columns: 1fr;
    }

    .panel-card.sticky {
        position: static;
    }
}

@media (max-width: 700px) {
    .success-page {
        padding: 0 0.75rem 1.5rem;
    }

    .success-hero,
    .receipt-card,
    .panel-card,
    .fallback-card {
        border-radius: 1.25rem;
    }

    .receipt-grid {
        grid-template-columns: 1fr;
    }

    .timeline-step,
    .order-item {
        grid-template-columns: 1fr;
    }

    .step-time {
        white-space: normal;
    }
}
</style>
