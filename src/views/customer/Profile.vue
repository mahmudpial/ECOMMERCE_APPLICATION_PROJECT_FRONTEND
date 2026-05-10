<template>
    <div class="profile-page" :class="{ dark: isDark }">
        <div class="page-container">

            <!-- Hero section -->
            <div class="profile-hero">
                <div class="hero-card">
                    <div class="avatar">{{ avatarInitial }}</div>
                    <div class="hero-content">
                        <span class="badge-label">My profile</span>
                        <h1>{{ form.fullName || userName }}</h1>
                        <p>Keep your personal and delivery details updated for a faster checkout.</p>
                        <div class="hero-tags">
                            <span>🕒 {{ memberSince }}</span>
                            <span>🔒 Secure account</span>
                            <span>🚚 Faster checkout</span>
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card"><span>Orders</span><strong>{{ stats.totalOrders }}</strong></div>
                    <div class="stat-card"><span>Spent</span><strong>৳{{ formatMoney(stats.totalSpent) }}</strong></div>
                    <div class="stat-card"><span>Completion</span><strong>{{ stats.completion }}%</strong></div>
                    <div class="stat-card accent"><span>Last order</span><strong>{{ stats.lastOrderLabel }}</strong>
                    </div>
                </div>
            </div>

            <!-- Main content grid -->
            <div class="profile-grid">
                <form class="profile-card" @submit.prevent="saveProfile">
                    <div class="card-header">
                        <div>
                            <span class="header-label">Account settings</span>
                            <h2>Edit your profile</h2>
                        </div>
                        <span class="sync-badge">Backend synced</span>
                    </div>

                    <div class="field-grid two-up">
                        <label class="field full-width">
                            <span>Full name</span>
                            <input v-model="form.fullName" type="text" placeholder="John Doe" required />
                        </label>
                        <label class="field">
                            <span>Mobile number</span>
                            <input v-model="form.mobile" type="tel" inputmode="numeric" placeholder="01712345678"
                                required />
                        </label>
                        <label class="field">
                            <span>Email address</span>
                            <input v-model="form.email" type="email" placeholder="you@example.com" />
                        </label>
                        <label class="field full-width">
                            <span>Address line 1</span>
                            <input v-model="form.addressLine1" type="text" placeholder="House, road, apartment" />
                        </label>
                        <label class="field full-width">
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
                        <label class="toggle-item">
                            <input v-model="form.newsletter" type="checkbox" />
                            <div>
                                <strong>Newsletter updates</strong>
                                <small>Receive offers, new arrivals, and sale alerts.</small>
                            </div>
                        </label>
                        <label class="toggle-item">
                            <input v-model="form.smsUpdates" type="checkbox" />
                            <div>
                                <strong>SMS order updates</strong>
                                <small>Get shipping and delivery updates on your phone.</small>
                            </div>
                        </label>
                    </div>

                    <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
                    <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary" :disabled="saving">
                            <span v-if="saving">Saving...</span>
                            <span v-else>Save changes</span>
                        </button>
                        <button type="button" class="btn-outline" @click="resetForm">Reset</button>
                        <button type="button" class="btn-danger" @click="logout">Log out</button>
                    </div>
                </form>

                <aside class="sidebar">
                    <div class="info-card">
                        <div class="card-header">
                            <div>
                                <span class="header-label">Profile health</span>
                                <h2>Account snapshot</h2>
                            </div>
                        </div>
                        <div class="metrics">
                            <div class="metric">
                                <span>Completion</span>
                                <strong>{{ stats.completion }}%</strong>
                                <p>Fill in your contact and delivery details.</p>
                            </div>
                            <div class="metric">
                                <span>Saved orders</span>
                                <strong>{{ stats.totalOrders }}</strong>
                                <p>Recent order history in this browser.</p>
                            </div>
                        </div>
                        <div class="address-preview">
                            <strong>Default delivery address</strong>
                            <p>{{ addressPreview }}</p>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="card-header">
                            <div>
                                <span class="header-label">Quick actions</span>
                                <h2>Shortcuts</h2>
                            </div>
                        </div>
                        <div class="shortcuts">
                            <router-link to="/orders" class="shortcut">📦 View orders</router-link>
                            <router-link to="/products" class="shortcut">🛍️ Continue shopping</router-link>
                            <router-link to="/cart" class="shortcut">🛒 Open cart</router-link>
                        </div>
                    </div>
                </aside>
            </div>

            <!-- Recent orders preview -->
            <section class="recent-section">
                <div class="section-header">
                    <div>
                        <span class="header-label">Recent activity</span>
                        <h2>Latest orders</h2>
                    </div>
                    <router-link to="/orders" class="view-all">View all →</router-link>
                </div>

                <div v-if="recentOrders.length" class="recent-list">
                    <div v-for="order in recentOrders" :key="order.id" class="recent-card">
                        <div class="recent-header">
                            <div>
                                <strong>#{{ order.order_number || order.id }}</strong>
                                <p>{{ formatDate(order.created_at) }} · {{ order.item_count || order.items?.length || 0
                                }} item(s)</p>
                            </div>
                            <span class="status-badge" :class="`status-${getStatusMeta(order.status).tone}`">
                                {{ getStatusMeta(order.status).label }}
                            </span>
                        </div>
                        <div class="recent-footer">
                            <span>{{ order.delivery_label }}</span>
                            <strong>৳{{ formatMoney(order.total) }}</strong>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-recent">
                    <span>📦</span>
                    <p>No recent orders yet. Your completed purchases will appear here.</p>
                </div>
            </section>

        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, onUnmounted } from 'vue'
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
    const created = user.value?.created_at || readCustomerProfile()?.created_at || new Date().toISOString()
    return `Member since ${formatDate(created)}`
})

const addressPreview = computed(() => {
    const parts = [form.addressLine1, form.addressLine2, form.city, form.state, form.postcode, form.country].filter(Boolean)
    return parts.length ? parts.join(', ') : 'No default address saved yet.'
})

const stats = computed(() => {
    const totalOrders = orders.value.length
    const totalSpent = orders.value.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const completion = Math.round(
        ([form.fullName, form.mobile, form.email, form.addressLine1, form.city, form.postcode].filter(Boolean).length / 6) * 100
    )
    const lastOrderLabel = recentOrders.value[0] ? formatDate(recentOrders.value[0].created_at) : 'No orders'
    return { totalOrders, totalSpent, completion, lastOrderLabel }
})

const hydrateProfile = async () => {
    authStore.loadUser?.()
    const stored = readCustomerProfile() || {}
    const source = authStore.user || {}
    loading.value = true
    errorMessage.value = ''
    try {
        const [profileResult, ordersResult] = await Promise.allSettled([api.get('profile'), api.get('orders')])
        if (ordersResult.status === 'fulfilled') orders.value = normalizeOrdersList(ordersResult.value.data)
        else orders.value = []
        if (profileResult.status !== 'fulfilled') throw profileResult.reason
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

const resetForm = () => { hydrateProfile() }

const saveProfile = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    saving.value = true
    try {
        const address = [form.addressLine1, form.addressLine2, form.city, form.state, form.postcode, form.country]
            .map(p => String(p || '').trim()).filter(Boolean).join(', ')
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* CSS Variables for light/dark mode */
.profile-page {
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
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.profile-page.dark {
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
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.profile-page {
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

/* Hero */
.profile-hero {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.hero-card {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    border: 1px solid var(--border-light);
}

.avatar {
    width: 88px;
    height: 88px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
}

.hero-content {
    flex: 1;
}

.badge-label {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: var(--accent-soft);
    color: var(--accent);
    padding: 0.25rem 0.8rem;
    border-radius: 30px;
    margin-bottom: 0.5rem;
}

.hero-content h1 {
    font-family: 'Sora', sans-serif;
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
}

.hero-content p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
}

.hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1rem;
}

.hero-tags span {
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-page);
    padding: 0.3rem 0.8rem;
    border-radius: 30px;
    border: 1px solid var(--border-light);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
}

.stat-card {
    background: var(--stat-bg);
    border-radius: 16px;
    padding: 1rem;
    border: 1px solid var(--border-light);
}

.stat-card span {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
    margin-bottom: 0.3rem;
}

.stat-card strong {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-card.accent {
    background: var(--accent-soft);
}

.stat-card.accent strong {
    color: var(--accent);
}

/* Profile grid */
.profile-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.profile-card {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 1.5rem;
    border: 1px solid var(--border-light);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.header-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 0.25rem 0.8rem;
    border-radius: 30px;
}

.card-header h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.25rem 0 0;
}

.sync-badge {
    font-size: 0.7rem;
    background: var(--bg-page);
    padding: 0.25rem 0.7rem;
    border-radius: 30px;
    color: var(--text-secondary);
}

.field-grid {
    display: grid;
    gap: 1rem;
}

.field-grid.two-up {
    grid-template-columns: repeat(2, 1fr);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.field.full-width {
    grid-column: span 2;
}

.field span {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.field input,
.field select {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-input);
    border-radius: 12px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 0.85rem;
    transition: all 0.2s;
}

.field input:focus,
.field select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.preferences {
    margin: 1.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.toggle-item {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 0.8rem;
    border-radius: 16px;
    background: var(--bg-page);
    border: 1px solid var(--border-light);
    cursor: pointer;
}

.toggle-item input {
    margin-top: 0.2rem;
    accent-color: var(--accent);
}

.toggle-item strong {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
}

.toggle-item small {
    font-size: 0.7rem;
    color: var(--text-muted);
}

.alert {
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.8rem;
    margin-bottom: 1rem;
}

.alert.error {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border-left: 3px solid #EF4444;
}

.alert.success {
    background: rgba(16, 185, 129, 0.1);
    color: #10B981;
    border-left: 3px solid #10B981;
}

.form-actions {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.btn-primary,
.btn-outline,
.btn-danger {
    padding: 0.7rem 1.3rem;
    border-radius: 40px;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: var(--accent);
    color: white;
}

.btn-primary:hover {
    background: #0052CC;
    transform: translateY(-1px);
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--border-input);
    color: var(--text-primary);
}

.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid #EF4444;
}

.btn-danger:hover {
    background: rgba(239, 68, 68, 0.2);
}

/* Sidebar */
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.info-card {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 1.2rem;
    border: 1px solid var(--border-light);
}

.metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    margin: 1rem 0;
}

.metric {
    background: var(--bg-page);
    border-radius: 16px;
    padding: 0.8rem;
}

.metric span {
    font-size: 0.7rem;
    color: var(--text-muted);
    display: block;
    margin-bottom: 0.2rem;
}

.metric strong {
    font-size: 1.3rem;
    font-weight: 700;
    display: block;
    margin-bottom: 0.2rem;
}

.metric p {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin: 0;
}

.address-preview {
    background: var(--accent-soft);
    border-radius: 16px;
    padding: 0.8rem;
    margin-top: 0.5rem;
}

.address-preview strong {
    font-size: 0.8rem;
    display: block;
    margin-bottom: 0.2rem;
}

.address-preview p {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
}

.shortcuts {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.shortcut {
    display: block;
    padding: 0.7rem 1rem;
    background: var(--bg-page);
    border-radius: 12px;
    text-decoration: none;
    color: var(--text-primary);
    font-size: 0.85rem;
    transition: all 0.2s;
}

.shortcut:hover {
    background: var(--accent-soft);
    color: var(--accent);
}

/* Recent orders */
.recent-section {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 1.5rem;
    border: 1px solid var(--border-light);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
}

.view-all {
    color: var(--accent);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
}

.recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.recent-card {
    background: var(--bg-page);
    border-radius: 16px;
    padding: 1rem;
    border: 1px solid var(--border-light);
}

.recent-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.recent-header strong {
    font-size: 0.9rem;
}

.recent-header p {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin: 0.2rem 0 0;
}

.status-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 30px;
}

.status-badge.status-success {
    background: #E8F5E9;
    color: #2E7D32;
}

.status-badge.status-info {
    background: #E3F2FD;
    color: #1565C0;
}

.status-badge.status-warning {
    background: #FFF3E0;
    color: #E65100;
}

.status-badge.status-danger {
    background: #FFEBEE;
    color: #C62828;
}

.recent-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
}

.empty-recent {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 1000px) {

    .profile-hero,
    .profile-grid {
        grid-template-columns: 1fr;
    }

    .page-container {
        padding: 0 1rem 3rem;
    }
}

@media (max-width: 600px) {
    .field-grid.two-up {
        grid-template-columns: 1fr;
    }

    .field.full-width {
        grid-column: span 1;
    }

    .hero-card {
        flex-direction: column;
        text-align: center;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>