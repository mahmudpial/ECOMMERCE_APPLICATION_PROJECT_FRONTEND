<template>
    <div class="profile-page">
        <section class="profile-hero">
            <div class="hero-card">
                <div class="avatar">{{ avatarInitial }}</div>
                <div class="hero-copy">
                    <span class="eyebrow">My profile</span>
                    <h1>{{ form.fullName || userName }}</h1>
                    <p>
                        Keep your personal and delivery details updated so checkout stays fast and accurate.
                    </p>

                    <div class="hero-tags">
                        <span><i class="fas fa-user"></i> {{ memberSince }}</span>
                        <span><i class="fas fa-lock"></i> Secure account</span>
                        <span><i class="fas fa-truck-fast"></i> Faster checkout</span>
                    </div>
                </div>
            </div>

            <div class="hero-stats">
                <article class="stat-card">
                    <span>Orders</span>
                    <strong>{{ stats.totalOrders }}</strong>
                </article>
                <article class="stat-card">
                    <span>Spent</span>
                    <strong>৳{{ formatMoney(stats.totalSpent) }}</strong>
                </article>
                <article class="stat-card">
                    <span>Completion</span>
                    <strong>{{ stats.completion }}%</strong>
                </article>
                <article class="stat-card accent">
                    <span>Last order</span>
                    <strong>{{ stats.lastOrderLabel }}</strong>
                </article>
            </div>
        </section>

        <section class="profile-grid">
            <form class="profile-card" @submit.prevent="saveProfile">
                <div class="section-head">
                    <div>
                        <span class="panel-kicker">Account settings</span>
                        <h2>Edit your profile</h2>
                    </div>
                    <span class="summary-chip">Backend synced</span>
                </div>

                <div class="field-grid two-up">
                    <label class="field field-wide">
                        <span>Full name</span>
                        <input v-model="form.fullName" type="text" placeholder="John Doe" required />
                    </label>
                    <label class="field">
                        <span>Mobile number</span>
                        <input v-model="form.mobile" type="tel" inputmode="numeric" placeholder="01712345678" required />
                    </label>
                    <label class="field">
                        <span>Email address</span>
                        <input v-model="form.email" type="email" placeholder="you@example.com" />
                    </label>
                    <label class="field field-wide">
                        <span>Address line 1</span>
                        <input v-model="form.addressLine1" type="text" placeholder="House, road, apartment" />
                    </label>
                    <label class="field field-wide">
                        <span>Address line 2</span>
                        <input v-model="form.addressLine2" type="text" placeholder="Area or landmark" />
                    </label>
                    <label class="field">
                        <span>City</span>
                        <input v-model="form.city" type="text" placeholder="Dhaka" />
                    </label>
                    <label class="field">
                        <span>State / Division</span>
                        <input v-model="form.state" type="text" placeholder="Dhaka Division" />
                    </label>
                    <label class="field">
                        <span>Post code</span>
                        <input v-model="form.postcode" type="text" placeholder="1205" />
                    </label>
                    <label class="field">
                        <span>Country</span>
                        <select v-model="form.country">
                            <option>Bangladesh</option>
                            <option>India</option>
                            <option>United States</option>
                            <option>United Kingdom</option>
                        </select>
                    </label>
                </div>

                <div class="preferences">
                    <label class="toggle-row">
                        <input v-model="form.newsletter" type="checkbox" />
                        <span>
                            <strong>Newsletter updates</strong>
                            <small>Receive offers, new arrivals, and sale alerts.</small>
                        </span>
                    </label>
                    <label class="toggle-row">
                        <input v-model="form.smsUpdates" type="checkbox" />
                        <span>
                            <strong>SMS order updates</strong>
                            <small>Get shipping and delivery updates on your phone.</small>
                        </span>
                    </label>
                </div>

                <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
                <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

                <div class="form-actions">
                    <button type="submit" class="primary-btn" :disabled="saving">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        <span v-else>Save changes</span>
                    </button>
                    <button type="button" class="secondary-btn" @click="resetForm">Reset</button>
                    <button type="button" class="danger-btn" @click="logout">Log out</button>
                </div>
            </form>

            <aside class="sidebar-stack">
                <div class="info-card">
                    <div class="section-head">
                        <div>
                            <span class="panel-kicker">Profile health</span>
                            <h2>Account snapshot</h2>
                        </div>
                    </div>

                    <div class="metric-grid">
                        <article class="metric-card">
                            <span>Completion</span>
                            <strong>{{ stats.completion }}%</strong>
                            <p>Fill in your contact and delivery details.</p>
                        </article>
                        <article class="metric-card">
                            <span>Saved orders</span>
                            <strong>{{ stats.totalOrders }}</strong>
                            <p>Recent order history in this browser.</p>
                        </article>
                    </div>

                    <div class="address-preview">
                        <strong>Default delivery address</strong>
                        <p>{{ addressPreview }}</p>
                    </div>
                </div>

                <div class="info-card">
                    <div class="section-head">
                        <div>
                            <span class="panel-kicker">Quick actions</span>
                            <h2>Shortcuts</h2>
                        </div>
                    </div>

                    <div class="quick-actions">
                        <router-link to="/orders" class="shortcut">
                            <i class="fas fa-box"></i>
                            <span>View orders</span>
                        </router-link>
                        <router-link to="/products" class="shortcut">
                            <i class="fas fa-store"></i>
                            <span>Continue shopping</span>
                        </router-link>
                        <router-link to="/cart" class="shortcut">
                            <i class="fas fa-cart-shopping"></i>
                            <span>Open cart</span>
                        </router-link>
                    </div>
                </div>
            </aside>
        </section>

        <section class="orders-preview">
            <div class="section-head">
                <div>
                    <span class="panel-kicker">Recent activity</span>
                    <h2>Latest orders</h2>
                </div>
                <router-link to="/orders" class="view-link">View all</router-link>
            </div>

            <div v-if="recentOrders.length" class="recent-list">
                <article v-for="order in recentOrders" :key="order.id" class="recent-card">
                    <div class="recent-top">
                        <div>
                            <strong>#{{ order.order_number || order.id }}</strong>
                            <p>{{ formatDate(order.created_at) }} · {{ order.item_count || order.items?.length || 0 }} item(s)</p>
                        </div>
                        <span class="badge" :class="`tone-${getStatusMeta(order.status).tone}`">
                            {{ getStatusMeta(order.status).label }}
                        </span>
                    </div>
                    <div class="recent-bottom">
                        <span>{{ order.delivery_label }}</span>
                        <strong>৳{{ formatMoney(order.total) }}</strong>
                    </div>
                </article>
            </div>

            <div v-else class="recent-empty">
                <i class="fas fa-box-open"></i>
                <p>No recent orders yet. Your completed purchases will appear here.</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import {
    formatDate,
    formatMoney,
    getStatusMeta,
    normalizeOrdersList,
    normalizePhone,
    readCustomerProfile,
    saveCustomerProfile,
} from '@/utils/customerCommerce'

const router = useRouter()
const authStore = useCustomerAuthStore()

const saving = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Bangladesh',
    newsletter: true,
    smsUpdates: true,
})

const user = computed(() => authStore.user || {})

const orders = ref([])
const recentOrders = computed(() => orders.value.slice(0, 3))

const userName = computed(() => user.value?.name || 'Customer account')
const avatarInitial = computed(() => (form.fullName || userName.value || 'C').charAt(0).toUpperCase())
const memberSince = computed(() => {
    const value = user.value?.created_at || readCustomerProfile()?.created_at || new Date().toISOString()
    return `Member since ${formatDate(value)}`
})

const addressPreview = computed(() => {
    const parts = [
        form.addressLine1,
        form.addressLine2,
        form.city,
        form.state,
        form.postcode,
        form.country,
    ].filter(Boolean)

    return parts.length ? parts.join(', ') : 'No default address saved yet.'
})

const stats = computed(() => {
    const totalOrders = orders.value.length
    const totalSpent = orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const completion = Math.round(
        ([
            form.fullName,
            form.mobile,
            form.email,
            form.addressLine1,
            form.city,
            form.postcode,
        ].filter(Boolean).length /
            6) *
            100,
    )
    const lastOrderLabel = recentOrders.value[0] ? formatDate(recentOrders.value[0].created_at) : 'No orders'

    return {
        totalOrders,
        totalSpent,
        completion,
        lastOrderLabel,
    }
})

const hydrateProfile = async () => {
    authStore.loadUser?.()
    const stored = readCustomerProfile() || {}
    const source = authStore.user || {}

    loading.value = true
    errorMessage.value = ''

    try {
        const [profileResult, ordersResult] = await Promise.allSettled([
            api.get('profile'),
            api.get('orders'),
        ])

        if (ordersResult.status === 'fulfilled') {
            orders.value = normalizeOrdersList(ordersResult.value.data)
        } else {
            console.error('Orders load error:', ordersResult.reason)
            orders.value = []
        }

        if (profileResult.status !== 'fulfilled') {
            throw profileResult.reason
        }

        const profile = profileResult.value.data.user || profileResult.value.data.data || profileResult.value.data

        Object.assign(form, {
            fullName: stored.fullName || profile.name || source.name || '',
            mobile: stored.mobile || normalizePhone(profile.mobile || source.mobile || source.phone || ''),
            email: stored.email || profile.email || source.email || '',
            addressLine1: stored.addressLine1 || profile.address || source.address || '',
            addressLine2: stored.addressLine2 || source.address_line2 || '',
            city: stored.city || source.city || '',
            state: stored.state || source.state || '',
            postcode: stored.postcode || source.postcode || '',
            country: stored.country || source.country || 'Bangladesh',
            newsletter: typeof stored.newsletter === 'boolean' ? stored.newsletter : true,
            smsUpdates: typeof stored.smsUpdates === 'boolean' ? stored.smsUpdates : true,
        })

        authStore.user = profile
        localStorage.setItem('customer_user', JSON.stringify(profile))
    } catch (error) {
        console.error('Profile load error:', error)
        errorMessage.value = error.response?.data?.message || 'Unable to load your profile right now.'

        Object.assign(form, {
            fullName: stored.fullName || source.name || '',
            mobile: stored.mobile || normalizePhone(source.mobile || source.phone || ''),
            email: stored.email || source.email || '',
            addressLine1: stored.addressLine1 || source.address || '',
            addressLine2: stored.addressLine2 || '',
            city: stored.city || '',
            state: stored.state || '',
            postcode: stored.postcode || '',
            country: stored.country || 'Bangladesh',
            newsletter: typeof stored.newsletter === 'boolean' ? stored.newsletter : true,
            smsUpdates: typeof stored.smsUpdates === 'boolean' ? stored.smsUpdates : true,
        })
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    hydrateProfile()
}

const saveProfile = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    saving.value = true

    try {
        const address = [
            form.addressLine1,
            form.addressLine2,
            form.city,
            form.state,
            form.postcode,
            form.country,
        ]
            .map((part) => String(part || '').trim())
            .filter(Boolean)
            .join(', ')

        const response = await api.put('profile', {
            name: form.fullName.trim(),
            mobile: normalizePhone(form.mobile),
            email: form.email.trim(),
            address,
        })

        const updatedUser = response.data.user || response.data.data || response.data
        authStore.user = updatedUser
        localStorage.setItem('customer_user', JSON.stringify(updatedUser))

        saveCustomerProfile({
            ...form,
            address,
            created_at: readCustomerProfile()?.created_at || updatedUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        successMessage.value = 'Profile saved successfully.'
    } catch (error) {
        console.error('Profile save error:', error)
        errorMessage.value = error.response?.data?.message || 'Unable to save your profile right now.'
    } finally {
        saving.value = false
    }
}

const logout = async () => {
    await authStore.logout()
    router.push('/login')
}

onMounted(() => {
    hydrateProfile()
})
</script>

<style scoped>
.profile-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}

.profile-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.85fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.hero-card,
.profile-card,
.info-card,
.recent-card,
.recent-empty {
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.hero-card {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1.4rem;
    border-radius: 1.75rem;
    background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 28%),
        radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.12), transparent 30%),
        var(--card);
}

.avatar {
    width: 88px;
    height: 88px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 1.4rem;
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: white;
    font-size: 2rem;
    font-weight: 800;
    box-shadow: 0 16px 34px rgba(59, 130, 246, 0.28);
}

.hero-copy h1 {
    margin: 0.85rem 0 0.5rem;
    font-size: clamp(2rem, 3.4vw, 3.4rem);
    letter-spacing: -0.04em;
    line-height: 1.02;
}

.hero-copy p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.7;
    max-width: 58ch;
}

.eyebrow,
.panel-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 1rem;
}

.hero-tags span {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.6rem 0.85rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid var(--border);
    color: var(--text);
    box-shadow: var(--shadow);
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
    font-size: 1.4rem;
    color: var(--text);
}

.stat-card.accent {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.12));
}

.profile-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.8fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.profile-card,
.info-card,
.recent-card,
.recent-empty {
    border-radius: 1.5rem;
}

.profile-card {
    padding: 1.25rem;
}

.section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.section-head h2 {
    margin: 0.1rem 0 0;
    font-size: 1.2rem;
}

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

.field-grid {
    display: grid;
    gap: 0.9rem;
}

.field-grid.two-up {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
    display: grid;
    gap: 0.45rem;
}

.field span {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text);
}

.field input,
.field select {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.75);
    padding: 0.95rem 1rem;
    color: var(--text);
}

.field input:focus,
.field select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.field-wide {
    grid-column: 1 / -1;
}

.preferences {
    display: grid;
    gap: 0.85rem;
    margin: 1.2rem 0;
}

.toggle-row {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.95rem 1rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid var(--border);
}

.toggle-row input {
    margin-top: 0.2rem;
}

.toggle-row strong {
    display: block;
    margin-bottom: 0.2rem;
}

.toggle-row small {
    color: var(--text-muted);
    line-height: 1.45;
}

.alert {
    padding: 0.85rem 1rem;
    border-radius: 1rem;
    margin-bottom: 0.8rem;
}

.alert.error {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.alert.success {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.shortcut {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 999px;
    padding: 0.9rem 1.2rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: #fff;
    box-shadow: 0 16px 34px rgba(59, 130, 246, 0.22);
}

.secondary-btn,
.danger-btn {
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
}

.danger-btn {
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.22);
    background: rgba(239, 68, 68, 0.06);
}

.primary-btn:hover,
.secondary-btn:hover,
.danger-btn:hover,
.shortcut:hover,
.view-link:hover {
    transform: translateY(-1px);
}

.sidebar-stack {
    display: grid;
    gap: 1rem;
}

.info-card {
    padding: 1.25rem;
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
}

.metric-card {
    padding: 1rem;
    border-radius: 1.15rem;
    background: rgba(59, 130, 246, 0.05);
}

.metric-card span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--text-muted);
    font-size: 0.84rem;
}

.metric-card strong {
    display: block;
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
}

.metric-card p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.45;
}

.address-preview {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 1.15rem;
    background: rgba(16, 185, 129, 0.08);
}

.address-preview strong {
    display: block;
    margin-bottom: 0.25rem;
}

.address-preview p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.55;
}

.quick-actions {
    display: grid;
    gap: 0.75rem;
}

.shortcut {
    justify-content: flex-start;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.72);
    color: var(--text);
}

.shortcut i {
    width: 2.2rem;
    height: 2.2rem;
    display: grid;
    place-items: center;
    border-radius: 0.85rem;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
}

.shortcut span {
    flex: 1;
    text-align: left;
}

.orders-preview {
    padding: 1.25rem;
    border-radius: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.view-link {
    color: var(--primary);
    font-weight: 700;
    text-decoration: none;
}

.recent-list {
    display: grid;
    gap: 0.85rem;
}

.recent-card {
    padding: 1rem;
    border-radius: 1.15rem;
    background: rgba(59, 130, 246, 0.05);
}

.recent-top,
.recent-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.recent-top strong {
    display: block;
    margin-bottom: 0.2rem;
}

.recent-top p,
.recent-bottom span {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 800;
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

.recent-empty {
    display: grid;
    place-items: center;
    gap: 0.65rem;
    min-height: 220px;
    text-align: center;
}

.recent-empty i {
    color: var(--primary);
    font-size: 1.8rem;
}

.recent-empty p {
    max-width: 38ch;
    margin: 0;
    color: var(--text-muted);
    line-height: 1.55;
}

@media (max-width: 1100px) {
    .profile-hero,
    .profile-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    .profile-page {
        padding: 0 0.75rem 1.5rem;
    }

    .hero-card,
    .profile-card,
    .info-card,
    .orders-preview,
    .recent-card,
    .recent-empty {
        border-radius: 1.25rem;
    }

    .hero-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .hero-stats,
    .field-grid.two-up,
    .metric-grid {
        grid-template-columns: 1fr;
    }

    .section-head {
        flex-direction: column;
        align-items: flex-start;
    }

    .recent-top,
    .recent-bottom,
    .form-actions {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
