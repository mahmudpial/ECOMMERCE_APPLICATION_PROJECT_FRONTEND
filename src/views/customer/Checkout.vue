<template>
    <div class="checkout-page">

        <!-- Hero section -->
        <div class="page-header">
            <div class="brand-mark">Commercia</div>
            <h1 class="page-title">Secure checkout</h1>
            <p class="page-sub">Complete your order with just a few details.</p>
            <div class="trust-badges">
                <span>🔒 Encrypted</span>
                <span>🚚 Fast delivery</span>
                <span>📦 Live summary</span>
            </div>
        </div>

        <!-- Empty cart state -->
        <div v-if="!cartItems.length" class="empty-state">
            <div class="empty-icon">—</div>
            <h2>Your cart is empty</h2>
            <p>Add some pieces before placing an order.</p>
            <router-link to="/products" class="btn-primary">Browse collection</router-link>
        </div>

        <!-- Checkout layout -->
        <div v-else class="checkout-layout">
            <form class="checkout-form" @submit.prevent="placeOrder">

                <!-- Dynamic form sections -->
                <template v-for="(section, idx) in formSections" :key="idx">
                    <div class="form-section">
                        <div class="section-header">
                            <div class="section-number">{{ idx + 1 }}</div>
                            <div>
                                <h2 class="section-title">{{ section.title }}</h2>
                                <p class="section-subtitle">{{ section.sub }}</p>
                            </div>
                        </div>
                        <div class="field-grid" :class="section.gridClass">
                            <label v-for="field in section.fields" :key="field.key"
                                :class="['field', field.wide ? 'field-wide' : '']">
                                <span class="field-label">{{ field.label }}</span>
                                <select v-if="field.type === 'select'" v-model="form[field.key]" class="field-input">
                                    <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                                </select>
                                <textarea v-else-if="field.type === 'textarea'" v-model="form[field.key]"
                                    class="field-input" :placeholder="field.placeholder" rows="4"></textarea>
                                <input v-else v-model="form[field.key]" class="field-input" :type="field.type || 'text'"
                                    :placeholder="field.placeholder" :required="field.required"
                                    :inputmode="field.inputmode" />
                            </label>
                        </div>
                    </div>
                </template>

                <!-- Delivery method -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="section-number">3</div>
                        <div>
                            <h2 class="section-title">Delivery method</h2>
                            <p class="section-subtitle">Choose your preferred shipping speed.</p>
                        </div>
                    </div>
                    <div class="option-group">
                        <button v-for="opt in deliveryOptions" :key="opt.value" type="button" class="option-card"
                            :class="{ active: form.deliveryMethod === opt.value }"
                            @click="form.deliveryMethod = opt.value">
                            <div class="option-icon">📦</div>
                            <div class="option-info">
                                <strong>{{ opt.label }}</strong>
                                <p>{{ opt.description }}</p>
                            </div>
                            <span class="option-price">{{ opt.fee ? `৳${formatMoney(opt.fee)}` : 'Free' }}</span>
                        </button>
                    </div>
                    <div class="shipping-note" :class="{ 'free-unlocked': freeShippingLeft <= 0 }">
                        <template v-if="freeShippingLeft > 0">Add ৳{{ formatMoney(freeShippingLeft) }} more for free
                            standard shipping.</template>
                        <template v-else>✨ Free standard shipping unlocked for this order.</template>
                    </div>
                </div>

                <!-- Payment method -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="section-number">4</div>
                        <div>
                            <h2 class="section-title">Payment method</h2>
                            <p class="section-subtitle">Your preferred way to pay.</p>
                        </div>
                    </div>
                    <div class="payment-grid">
                        <button v-for="opt in paymentOptions" :key="opt.value" type="button" class="payment-card"
                            :class="{ active: form.paymentMethod === opt.value }"
                            @click="form.paymentMethod = opt.value">
                            <div class="payment-icon">💳</div>
                            <div>
                                <strong>{{ opt.label }}</strong>
                                <p>{{ opt.description }}</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Promo code -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="section-number">5</div>
                        <div>
                            <h2 class="section-title">Promo code</h2>
                            <p class="section-subtitle">Apply a discount code.</p>
                        </div>
                    </div>
                    <div class="promo-row">
                        <div class="promo-input-wrapper">
                            <span class="promo-icon">🏷️</span>
                            <input v-model="promoCodeInput" class="field-input" type="text" placeholder="SAVE10"
                                autocomplete="off" style="text-transform: uppercase;" />
                        </div>
                        <button type="button" class="btn-outline" @click="applyPromoCode">Apply</button>
                    </div>
                    <p v-if="promoMessage" class="promo-message success"><span class="check">✓</span> {{ promoMessage }}
                    </p>
                    <p v-if="promoError" class="promo-message error"><span class="exclaim">⚠️</span> {{ promoError }}
                    </p>
                    <div v-if="promoCodes.length" class="promo-chips">
                        <button v-for="p in promoCodes" :key="p.code" type="button" class="promo-chip"
                            @click="usePromoSuggestion(p.code)">
                            <strong>{{ p.code }}</strong>
                            <span>{{ p.label }}</span>
                        </button>
                    </div>
                </div>

                <!-- Delivery note -->
                <div class="form-section">
                    <div class="section-header">
                        <div class="section-number">6</div>
                        <div>
                            <h2 class="section-title">Delivery note</h2>
                            <p class="section-subtitle">Optional instructions for the courier.</p>
                        </div>
                    </div>
                    <label class="field field-wide">
                        <span class="field-label">Note</span>
                        <textarea v-model="form.note" class="field-input"
                            placeholder="Leave at gate, call before delivery…" rows="3"></textarea>
                    </label>
                </div>

                <!-- Terms -->
                <label class="terms-checkbox">
                    <input v-model="form.termsAccepted" type="checkbox" />
                    <span>I confirm my details are correct and agree to the terms of service.</span>
                </label>

                <!-- Messages -->
                <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
                <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

                <!-- Submit -->
                <button type="submit" class="btn-primary submit-btn" :disabled="submitting">
                    <span v-if="submitting">Processing…</span>
                    <span v-else>Place order · ৳{{ formatMoney(total) }}</span>
                </button>
            </form>

            <!-- Order Summary Sidebar -->
            <aside class="order-summary">
                <div class="summary-sticky">
                    <div class="summary-header">
                        <div>
                            <div class="summary-label">Order summary</div>
                            <h3 class="summary-title">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}</h3>
                        </div>
                        <span class="delivery-badge">{{ selectedDelivery.label }}</span>
                    </div>

                    <div class="summary-items">
                        <div v-for="item in cartItems" :key="item.id" class="summary-item">
                            <img :src="getProductImage(item)" :alt="item.name" />
                            <div class="item-details">
                                <strong>{{ item.name }}</strong>
                                <span>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</span>
                            </div>
                            <span class="item-total">৳{{ formatMoney(item.price * item.quantity) }}</span>
                        </div>
                    </div>

                    <div class="summary-lines">
                        <div class="summary-line"><span>Subtotal</span><span>৳{{ formatMoney(subtotal) }}</span></div>
                        <div class="summary-line"><span>Shipping</span><span>{{ shippingFee === 0 ? 'Free' :
                            `৳${formatMoney(shippingFee)}` }}</span></div>
                        <div class="summary-line"><span>Discount</span><span>{{ promoDiscount > 0 ?
                            `−৳${formatMoney(promoDiscount)}` : '—' }}</span></div>
                        <div class="summary-divider"></div>
                        <div class="summary-line total"><span>Total</span><span>৳{{ formatMoney(total) }}</span></div>
                    </div>

                    <div class="summary-details">
                        <div class="detail-row">
                            <div class="detail-icon">🚚</div>
                            <div><strong>{{ selectedDelivery.label }}</strong>
                                <p>{{ selectedDelivery.eta }}</p>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-icon">💳</div>
                            <div><strong>{{ selectedPayment.label }}</strong>
                                <p>{{ selectedPayment.description }}</p>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-icon">🔒</div>
                            <div><strong>Secure & encrypted</strong>
                                <p>Your data is protected.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCartStore } from '@/stores/cart'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { calculatePromoDiscount, deliveryOptions, formatMoney, getDeliveryOption, getPromoCode, getPaymentOption, getProductImage, getShippingFee, normalizePhone, paymentOptions, readCheckoutDraft, saveCheckoutDraft, promoCodes } from '@/utils/customerCommerce'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useCustomerAuthStore()

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.totalPrice)
const totalItems = computed(() => cartStore.totalItems)
const shippingFee = computed(() => getShippingFee(form.deliveryMethod, subtotal.value))
const promoDiscount = computed(() => calculatePromoDiscount(subtotal.value, appliedPromo.value))
const total = computed(() => Math.max(0, subtotal.value + shippingFee.value - promoDiscount.value))
const selectedDelivery = computed(() => getDeliveryOption(form.deliveryMethod))
const selectedPayment = computed(() => getPaymentOption(form.paymentMethod))
const freeShippingLeft = computed(() => {
    if (subtotal.value >= 3000 || form.deliveryMethod !== 'standard') return 0
    return 3000 - subtotal.value
})

const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const promoCodeInput = ref('')
const promoMessage = ref('')
const promoError = ref('')
const appliedPromo = ref(null)

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
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
    promoCode: '',
    note: '',
    termsAccepted: false
})

const formSections = [
    {
        title: 'Contact details', sub: "We'll send order updates to these details.", gridClass: 'grid-2',
        fields: [
            { key: 'fullName', label: 'Full name', placeholder: 'Jane Doe', required: true },
            { key: 'mobile', label: 'Mobile number', placeholder: '01712345678', required: true, inputmode: 'numeric', type: 'tel' },
            { key: 'email', label: 'Email address', placeholder: 'you@example.com', type: 'email', wide: true }
        ]
    },
    {
        title: 'Shipping address', sub: 'Where should we deliver your order?', gridClass: 'grid-2',
        fields: [
            { key: 'addressLine1', label: 'Address line 1', placeholder: 'House, road, apartment', required: true, wide: true },
            { key: 'addressLine2', label: 'Address line 2', placeholder: 'Area, landmark, floor', wide: true },
            { key: 'city', label: 'City', placeholder: 'Dhaka', required: true },
            { key: 'state', label: 'State / Division', placeholder: 'Dhaka Division' },
            { key: 'postcode', label: 'Postcode', placeholder: '1205', required: true },
            { key: 'country', label: 'Country', type: 'select', options: ['Bangladesh', 'India', 'United States', 'United Kingdom'] }
        ]
    }
]

const applyPromoCode = () => {
    const code = promoCodeInput.value.trim().toUpperCase()
    promoMessage.value = ''
    promoError.value = ''
    if (!code) { promoError.value = 'Please enter a promo code.'; return }
    const promo = getPromoCode(code)
    if (!promo) { appliedPromo.value = null; promoError.value = 'Invalid promo code.'; return }
    if (promo.minSubtotal && subtotal.value < promo.minSubtotal) {
        appliedPromo.value = null
        promoError.value = `Minimum order ৳${formatMoney(promo.minSubtotal)} required.`
        return
    }
    appliedPromo.value = promo
    promoMessage.value = `Code ${promo.code} applied.`
}
const usePromoSuggestion = (code) => {
    promoCodeInput.value = code
    applyPromoCode()
}

const buildShippingAddress = () => {
    return [form.addressLine1, form.addressLine2, form.city, form.state, form.postcode, form.country]
        .map(p => String(p || '').trim()).filter(Boolean).join(', ')
}

const placeOrder = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    if (!form.termsAccepted) {
        errorMessage.value = 'Please accept the terms of service.'
        return
    }
    const missing = [
        ['full name', form.fullName],
        ['mobile', form.mobile],
        ['address', form.addressLine1],
        ['city', form.city],
        ['postcode', form.postcode]
    ].find(([, v]) => !String(v || '').trim())
    if (missing) {
        errorMessage.value = `Please enter your ${missing[0]}.`
        return
    }
    submitting.value = true
    try {
        const res = await api.post('checkout', {
            user_id: authStore.user?.id,
            customer_name: form.fullName.trim(),
            customer_email: form.email.trim(),
            customer_phone: normalizePhone(form.mobile),
            shipping_address: buildShippingAddress(),
            delivery_method: form.deliveryMethod,
            payment_method: form.paymentMethod,
            promo_code: appliedPromo.value?.code || null,
            notes: String(form.note || '').trim(),
            items: cartItems.value.map(i => ({
                product_id: i.id,
                quantity: Number(i.quantity || 1),
                name: i.name,
                price: Number(i.price || 0)
            }))
        })
        const payload = res.data.order || res.data.data || res.data
        const reference = payload?.order_number || payload?.id
        if (!reference) throw new Error('No order reference received.')
        saveCheckoutDraft(null)
        cartStore.clearCart()
        router.push({ path: '/order/success', query: { order: reference } })
    } catch (e) {
        errorMessage.value = e.response?.data?.message || 'Something went wrong. Please try again.'
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    authStore.loadUser?.()
    const user = authStore.user || {}
    const draft = readCheckoutDraft() || {}
    Object.assign(form, {
        fullName: user.name || '',
        mobile: normalizePhone(user.mobile || user.phone || ''),
        email: user.email || '',
        addressLine1: user.address_line1 || user.address || '',
        city: user.city || '',
        country: user.country || 'Bangladesh',
        ...draft
    })
    promoCodeInput.value = draft.promoCode || ''
    appliedPromo.value = getPromoCode(draft.promoCode || '')
    if (appliedPromo.value) promoMessage.value = `Code ${appliedPromo.value.code} is applied.`
    cartStore.loadCart?.()
})
watch(form, () => {
    saveCheckoutDraft({ ...form, promoCode: appliedPromo.value?.code || '' })
}, { deep: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* Light mode (default) */
.checkout-page {
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
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.02);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.04);
}

/* Dark mode – triggered by parent .dark class */
.checkout-page.dark {
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

.checkout-page {
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
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.trust-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.trust-badges span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.35rem;
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
    padding: 0.75rem 1.8rem;
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 0.03em;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
}

.btn-primary:hover {
    background: #0052CC;
    transform: translateY(-1px);
}

.btn-primary:active {
    transform: translateY(0);
}

/* Layout */
.checkout-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
}

/* Form */
.checkout-form {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.form-section {
    padding: 1.8rem 0;
    border-bottom: 1px solid var(--border-light);
}

.form-section:last-of-type {
    border-bottom: none;
}

.section-header {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1.5rem;
}

.section-number {
    width: 2.2rem;
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-input);
    border-radius: 8px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    color: var(--accent);
    background: var(--bg-card);
}

.section-title {
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.3rem;
    color: var(--text-primary);
}

.section-subtitle {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
}

.field-grid {
    display: grid;
    gap: 1.25rem;
}

.field-grid.grid-2 {
    grid-template-columns: 1fr 1fr;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-wide {
    grid-column: 1 / -1;
}

.field-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.field-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-input);
    border-radius: 12px;
    background: var(--bg-card);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

textarea.field-input {
    resize: vertical;
}

/* Option cards (delivery) */
.option-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.option-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1.2rem;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
}

.option-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
}

.option-card.active {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.option-icon {
    font-size: 1.3rem;
}

.option-info {
    flex: 1;
}

.option-info strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
}

.option-info p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.option-price {
    font-weight: 700;
    color: var(--accent);
    font-size: 0.9rem;
    white-space: nowrap;
}

.shipping-note {
    font-size: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    background: var(--bg-card-soft);
    border-left: 3px solid var(--border-input);
}

.shipping-note.free-unlocked {
    border-left-color: var(--accent);
    background: var(--accent-soft);
}

/* Payment grid */
.payment-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.payment-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
}

.payment-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
}

.payment-card.active {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.payment-icon {
    font-size: 1.3rem;
}

.payment-card strong {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.1rem;
    color: var(--text-primary);
}

.payment-card p {
    margin: 0;
    font-size: 0.7rem;
    color: var(--text-secondary);
}

/* Promo */
.promo-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
}

.promo-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--border-input);
    border-radius: 12px;
    padding: 0 0.75rem;
    background: var(--bg-card);
    transition: border-color 0.2s;
}

.promo-input-wrapper:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.promo-icon {
    font-size: 1rem;
}

.promo-input-wrapper .field-input {
    border: none;
    padding: 0.75rem 0;
    flex: 1;
    background: transparent;
    box-shadow: none;
}

.btn-outline {
    background: none;
    border: 1px solid var(--border-input);
    border-radius: 40px;
    padding: 0.7rem 1.2rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-primary);
}

.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
}

.promo-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    margin-top: 0.75rem;
    padding: 0.6rem 0.9rem;
    border-radius: 12px;
}

.promo-message.success {
    background: var(--accent-soft);
    border-left: 3px solid var(--accent);
    color: var(--text-primary);
}

.promo-message.error {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid var(--danger);
    color: var(--danger);
}

.promo-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.promo-chip {
    background: var(--bg-card-soft);
    border: 1px solid var(--border-light);
    border-radius: 30px;
    padding: 0.4rem 0.9rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
}

.promo-chip:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.promo-chip strong {
    display: block;
    font-size: 0.75rem;
    color: var(--accent);
}

.promo-chip span {
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* Terms */
.terms-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 1.2rem 0 1.8rem;
    cursor: pointer;
}

.terms-checkbox input {
    margin-top: 0.15rem;
    accent-color: var(--accent);
    width: 1.1rem;
    height: 1.1rem;
}

.terms-checkbox span {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* Alert messages */
.alert {
    padding: 0.85rem 1rem;
    font-size: 0.85rem;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.alert.error {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid var(--danger);
    color: var(--danger);
}

.alert.success {
    background: var(--accent-soft);
    border-left: 3px solid var(--accent);
    color: var(--accent);
}

.submit-btn {
    width: 100%;
    padding: 1rem;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: 40px;
}

/* Order summary sidebar */
.order-summary {
    position: sticky;
    top: 2rem;
    align-self: start;
}

.summary-sticky {
    background: var(--bg-card-soft);
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid var(--border-light);
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.summary-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.summary-title {
    font-family: 'Sora', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.25rem 0 0;
    color: var(--text-primary);
}

.delivery-badge {
    font-size: 0.65rem;
    padding: 0.3rem 0.8rem;
    border: 1px solid var(--border-input);
    border-radius: 30px;
    background: var(--bg-card);
    color: var(--text-primary);
}

.summary-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    max-height: 300px;
    overflow-y: auto;
}

.summary-item {
    display: grid;
    grid-template-columns: 50px 1fr auto;
    gap: 0.75rem;
    align-items: center;
}

.summary-item img {
    width: 50px;
    height: 64px;
    object-fit: cover;
    border-radius: 10px;
    background: var(--bg-card-soft);
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.item-details strong {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-primary);
}

.item-details span {
    font-size: 0.7rem;
    color: var(--text-muted);
}

.item-total {
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
    color: var(--text-primary);
}

.summary-lines {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    border-top: 1px solid var(--border-light);
    padding-top: 1rem;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.summary-line.total {
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-primary);
}

.summary-divider {
    height: 1px;
    background: var(--border-light);
}

.summary-details {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1.5rem;
    border-top: 1px solid var(--border-light);
    padding-top: 1rem;
}

.detail-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}

.detail-icon {
    font-size: 1rem;
}

.detail-row strong {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 0.1rem;
    color: var(--text-primary);
}

.detail-row p {
    margin: 0;
    font-size: 0.7rem;
    color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1000px) {
    .checkout-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .order-summary {
        position: static;
    }
}

@media (max-width: 700px) {
    .checkout-page {
        padding: 0 1rem 3rem;
    }

    .field-grid.grid-2 {
        grid-template-columns: 1fr;
    }

    .payment-grid {
        grid-template-columns: 1fr;
    }

    .option-card {
        flex-wrap: wrap;
    }
}

@media (max-width: 480px) {
    .promo-row {
        flex-direction: column;
    }

    .btn-outline {
        width: 100%;
    }

    .summary-item {
        grid-template-columns: 40px 1fr auto;
    }

    .summary-item img {
        width: 40px;
        height: 52px;
    }
}
</style>