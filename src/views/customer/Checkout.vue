<template>
    <div class="checkout-page">
        <section class="checkout-hero">
            <div class="hero-copy">
                <span class="eyebrow">Secure checkout</span>
                <h1>Review your order and complete your purchase.</h1>
                <p>
                    We keep the flow simple: confirm your delivery details, choose how you want to pay,
                    and place your order in one smooth step.
                </p>

                <div class="hero-pills">
                    <span><i class="fas fa-shield-heart"></i> Encrypted checkout</span>
                    <span><i class="fas fa-truck-fast"></i> Fast delivery options</span>
                    <span><i class="fas fa-box-open"></i> Live order summary</span>
                </div>
            </div>

            <aside class="hero-summary">
                <div class="hero-summary-card">
                    <div class="summary-row">
                        <span>Items</span>
                        <strong>{{ totalItems }}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <strong>৳{{ formatMoney(subtotal) }}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <strong>{{ shippingFee === 0 ? 'Free' : `৳${formatMoney(shippingFee)}` }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <strong>৳{{ formatMoney(total) }}</strong>
                    </div>
                </div>
            </aside>
        </section>

        <div v-if="!cartItems.length" class="empty-state">
            <div class="empty-card">
                <div class="empty-icon">
                    <i class="fas fa-cart-shopping"></i>
                </div>
                <h2>Your cart is empty</h2>
                <p>Add a few products to unlock checkout and order placement.</p>
                <router-link to="/products" class="btn-primary">Browse products</router-link>
            </div>
        </div>

        <div v-else class="checkout-grid">
            <form class="checkout-form" @submit.prevent="placeOrder">
                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">1</span>
                        <div>
                            <h2>Contact details</h2>
                            <p>We will send your order updates to these details.</p>
                        </div>
                    </div>

                    <div class="field-grid two-up">
                        <label class="field">
                            <span>Full name</span>
                            <input v-model="form.fullName" type="text" placeholder="John Doe" required />
                        </label>
                        <label class="field">
                            <span>Mobile number</span>
                            <input v-model="form.mobile" type="tel" inputmode="numeric" placeholder="01712345678" required />
                        </label>
                        <label class="field field-wide">
                            <span>Email address</span>
                            <input v-model="form.email" type="email" placeholder="you@example.com" />
                        </label>
                    </div>
                </section>

                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">2</span>
                        <div>
                            <h2>Shipping address</h2>
                            <p>Enter the address where you want the parcel delivered.</p>
                        </div>
                    </div>

                    <div class="field-grid">
                        <label class="field field-wide">
                            <span>Address line 1</span>
                            <input v-model="form.addressLine1" type="text" placeholder="House, road, apartment" required />
                        </label>
                        <label class="field field-wide">
                            <span>Address line 2</span>
                            <input v-model="form.addressLine2" type="text" placeholder="Area, landmark, floor" />
                        </label>
                        <label class="field">
                            <span>City</span>
                            <input v-model="form.city" type="text" placeholder="Dhaka" required />
                        </label>
                        <label class="field">
                            <span>State / Division</span>
                            <input v-model="form.state" type="text" placeholder="Dhaka Division" />
                        </label>
                        <label class="field">
                            <span>Post code</span>
                            <input v-model="form.postcode" type="text" placeholder="1205" required />
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
                </section>

                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">3</span>
                        <div>
                            <h2>Delivery method</h2>
                            <p>Choose a delivery speed that works for you.</p>
                        </div>
                    </div>

                    <div class="choice-grid">
                        <button
                            v-for="option in deliveryOptions"
                            :key="option.value"
                            type="button"
                            class="choice-card"
                            :class="{ active: form.deliveryMethod === option.value }"
                            @click="form.deliveryMethod = option.value"
                        >
                            <i :class="option.icon"></i>
                            <div class="choice-copy">
                                <strong>{{ option.label }}</strong>
                                <p>{{ option.description }}</p>
                            </div>
                            <span class="choice-price">{{ option.fee ? `৳${formatMoney(option.fee)}` : 'Free' }}</span>
                        </button>
                    </div>

                    <div v-if="freeShippingLeft > 0" class="shipping-note">
                        Add ৳{{ formatMoney(freeShippingLeft) }} more for free standard delivery.
                    </div>
                    <div v-else class="shipping-note success">
                        Free standard shipping is unlocked for this order.
                    </div>
                </section>

                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">4</span>
                        <div>
                            <h2>Payment method</h2>
                            <p>Pick your preferred way to pay.</p>
                        </div>
                    </div>

                    <div class="choice-grid payment-grid">
                        <button
                            v-for="option in paymentOptions"
                            :key="option.value"
                            type="button"
                            class="choice-card payment-card"
                            :class="{ active: form.paymentMethod === option.value }"
                            @click="form.paymentMethod = option.value"
                        >
                            <i :class="option.icon"></i>
                            <div class="choice-copy">
                                <strong>{{ option.label }}</strong>
                                <p>{{ option.description }}</p>
                            </div>
                        </button>
                    </div>
                </section>

                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">5</span>
                        <div>
                            <h2>Promo code</h2>
                            <p>Apply a discount code to lower the order total.</p>
                        </div>
                    </div>

                    <div class="promo-row">
                        <label class="field promo-field">
                            <span>Promo code</span>
                            <input
                                v-model="promoCodeInput"
                                type="text"
                                placeholder="SAVE10"
                                autocomplete="off"
                            />
                        </label>
                        <button type="button" class="promo-btn" @click="applyPromoCode">Apply</button>
                    </div>

                    <p v-if="promoMessage" class="promo-success">
                        <i class="fas fa-circle-check"></i>
                        {{ promoMessage }}
                    </p>
                    <p v-if="promoError" class="promo-error">
                        <i class="fas fa-triangle-exclamation"></i>
                        {{ promoError }}
                    </p>

                    <div class="promo-suggestions">
                        <button
                            v-for="promo in promoCodes"
                            :key="promo.code"
                            type="button"
                            class="promo-chip"
                            @click="usePromoSuggestion(promo.code)"
                        >
                            <strong>{{ promo.code }}</strong>
                            <span>{{ promo.label }}</span>
                        </button>
                    </div>

                    <div v-if="appliedPromo" class="promo-applied">
                        <div>
                            <strong>{{ appliedPromo.code }}</strong>
                            <p>{{ appliedPromo.description }}</p>
                        </div>
                        <button type="button" class="promo-remove-btn" @click="removePromoCode">Remove</button>
                    </div>
                </section>

                <section class="form-card">
                    <div class="section-header">
                        <span class="section-kicker">6</span>
                        <div>
                            <h2>Order note</h2>
                            <p>Add delivery instructions or a short note for the courier.</p>
                        </div>
                    </div>

                    <label class="field field-wide">
                        <span>Note for delivery team</span>
                        <textarea
                            v-model="form.note"
                            rows="4"
                            placeholder="Leave at the gate, call before delivery, etc."
                        ></textarea>
                    </label>
                </section>

                <label class="terms-row">
                    <input v-model="form.termsAccepted" type="checkbox" />
                    <span>I agree to the terms of service and confirm the shipping details are correct.</span>
                </label>

                <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
                <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

                <button type="submit" class="place-order-btn" :disabled="submitting">
                    <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                    <span v-else>Place order · ৳{{ formatMoney(total) }}</span>
                </button>
            </form>

            <aside class="summary-panel">
                <div class="summary-card sticky">
                    <div class="summary-head">
                        <div>
                            <span class="summary-kicker">Order summary</span>
                            <h3>{{ totalItems }} item{{ totalItems === 1 ? '' : 's' }}</h3>
                        </div>
                        <span class="summary-chip">{{ selectedDelivery.label }}</span>
                    </div>

                    <div class="summary-items">
                        <article v-for="item in cartItems" :key="item.id" class="summary-item">
                            <img :src="getProductImage(item)" :alt="item.name" />
                            <div class="summary-item-copy">
                                <strong>{{ item.name }}</strong>
                                <span>Qty {{ item.quantity }} · ৳{{ formatMoney(item.price) }}</span>
                            </div>
                            <div class="summary-item-total">৳{{ formatMoney(item.price * item.quantity) }}</div>
                        </article>
                    </div>

                    <div class="summary-lines">
                        <div class="line">
                            <span>Subtotal</span>
                            <strong>৳{{ formatMoney(subtotal) }}</strong>
                        </div>
                        <div class="line">
                            <span>Shipping</span>
                            <strong>{{ shippingFee === 0 ? 'Free' : `৳${formatMoney(shippingFee)}` }}</strong>
                        </div>
                        <div class="line">
                            <span>Discount</span>
                            <strong>{{ promoDiscount > 0 ? `- ৳${formatMoney(promoDiscount)}` : '৳0.00' }}</strong>
                        </div>
                        <div class="line total">
                            <span>Total</span>
                            <strong>৳{{ formatMoney(total) }}</strong>
                        </div>
                    </div>

                    <div class="summary-info">
                        <div class="info-row">
                            <i class="fas fa-truck"></i>
                            <div>
                                <strong>{{ selectedDelivery.label }}</strong>
                                <p>{{ selectedDelivery.eta }}</p>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-credit-card"></i>
                            <div>
                                <strong>{{ selectedPayment.label }}</strong>
                                <p>{{ selectedPayment.description }}</p>
                            </div>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-shield-heart"></i>
                            <div>
                                <strong>Secure payment</strong>
                                <p>Your data is kept private and encrypted.</p>
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
import {
    calculatePromoDiscount,
    deliveryOptions,
    formatMoney,
    getDeliveryOption,
    getPromoCode,
    getPaymentOption,
    getProductImage,
    getShippingFee,
    normalizePhone,
    paymentOptions,
    readCheckoutDraft,
    saveCheckoutDraft,
    promoCodes,
} from '@/utils/customerCommerce'

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
    termsAccepted: false,
})

const buildShippingAddress = () =>
    [
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

const hydrateForm = () => {
    authStore.loadUser?.()
    const user = authStore.user || {}
    const draft = readCheckoutDraft() || {}
    const saved = {
        fullName: user.name || '',
        mobile: normalizePhone(user.mobile || user.phone || ''),
        email: user.email || '',
        addressLine1: user.address_line1 || user.address || '',
        addressLine2: user.address_line2 || '',
        city: user.city || '',
        state: user.state || '',
        postcode: user.postcode || '',
        country: user.country || 'Bangladesh',
        deliveryMethod: 'standard',
        paymentMethod: 'cod',
        promoCode: '',
        note: '',
        termsAccepted: false,
    }

    Object.assign(form, saved, draft)
    promoCodeInput.value = draft.promoCode || draft.promo_code || ''
    appliedPromo.value = getPromoCode(draft.promoCode || draft.promo_code || '')
    if (appliedPromo.value) {
        promoMessage.value = `Promo code ${appliedPromo.value.code} is applied.`
    }
}

const syncPromoDraft = () => {
    saveCheckoutDraft({
        ...form,
        promoCode: appliedPromo.value?.code || '',
        promoDiscount: promoDiscount.value,
        promoLabel: appliedPromo.value?.label || '',
        promoDescription: appliedPromo.value?.description || '',
    })
}

const applyPromoCode = () => {
    const code = promoCodeInput.value.trim().toUpperCase()

    promoMessage.value = ''
    promoError.value = ''

    if (!code) {
        promoError.value = 'Please enter a promo code.'
        return
    }

    const promo = getPromoCode(code)
    if (!promo) {
        appliedPromo.value = null
        promoError.value = 'Invalid promo code.'
        syncPromoDraft()
        return
    }

    if (promo.minSubtotal && subtotal.value < promo.minSubtotal) {
        appliedPromo.value = null
        promoError.value = `This code needs a minimum order of ৳${formatMoney(promo.minSubtotal)}.`
        syncPromoDraft()
        return
    }

    appliedPromo.value = promo
    promoMessage.value = `Promo code ${promo.code} applied successfully.`
    promoError.value = ''
    syncPromoDraft()
}

const usePromoSuggestion = (code) => {
    promoCodeInput.value = code
    applyPromoCode()
}

const removePromoCode = () => {
    promoCodeInput.value = ''
    appliedPromo.value = null
    promoMessage.value = ''
    promoError.value = ''
    syncPromoDraft()
}

const placeOrder = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    if (!cartItems.value.length) {
        errorMessage.value = 'Your cart is empty. Add items before placing an order.'
        return
    }

    if (!form.termsAccepted) {
        errorMessage.value = 'Please accept the terms of service to continue.'
        return
    }

    const requiredFields = [
        ['full name', form.fullName],
        ['mobile number', form.mobile],
        ['address line 1', form.addressLine1],
        ['city', form.city],
        ['post code', form.postcode],
    ]

    const missing = requiredFields.find(([, value]) => !String(value || '').trim())
    if (missing) {
        errorMessage.value = `Please enter your ${missing[0]}.`
        return
    }

    submitting.value = true

    try {
        const response = await api.post('checkout', {
            user_id: authStore.user?.id,
            customer_name: form.fullName.trim(),
            customer_email: form.email.trim(),
            customer_phone: normalizePhone(form.mobile),
            shipping_address: buildShippingAddress(),
            delivery_method: form.deliveryMethod,
            payment_method: form.paymentMethod,
            promo_code: appliedPromo.value?.code || null,
            notes: String(form.note || '').trim(),
            items: cartItems.value.map((item) => ({
                product_id: item.id,
                quantity: Number(item.quantity || 1),
                name: item.name,
                price: Number(item.price || 0),
            })),
        })

        const orderPayload = response.data.order || response.data.data || response.data
        const orderRef = orderPayload?.order_number || orderPayload?.id
        const paymentUrl = response.data.payment_url || orderPayload?.payment_url || null

        if (!orderRef) {
            throw new Error('The backend did not return an order reference.')
        }

        saveCheckoutDraft(null)
        cartStore.clearCart()

        router.push({
            path: '/order/success',
            query: {
                order: orderRef,
                ...(paymentUrl ? { payment_url: paymentUrl } : {}),
            },
        })
    } catch (error) {
        console.error('Checkout error:', error)
        errorMessage.value = error.response?.data?.message || 'Something went wrong while placing the order. Please try again.'
    } finally {
        submitting.value = false
    }
}

watch(
    form,
    () => {
        syncPromoDraft()
    },
    { deep: true },
)

watch(
    () => subtotal.value,
    () => {
        if (appliedPromo.value) {
            const promo = getPromoCode(appliedPromo.value.code)
            if (!promo || (promo.minSubtotal && subtotal.value < promo.minSubtotal)) {
                appliedPromo.value = null
                promoMessage.value = ''
                promoError.value = 'Promo code no longer meets the minimum order amount.'
            }
        }
        syncPromoDraft()
    },
)

watch(promoCodeInput, (value) => {
    const normalized = String(value || '').trim().toUpperCase()

    if (appliedPromo.value && normalized !== appliedPromo.value.code) {
        appliedPromo.value = null
        promoMessage.value = ''
    }

    if (!normalized) {
        promoError.value = ''
    }

    syncPromoDraft()
})

onMounted(() => {
    hydrateForm()
    cartStore.loadCart?.()
})
</script>

<style scoped>
.checkout-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}

.checkout-hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);
    gap: 1.25rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    border-radius: 1.75rem;
    overflow: hidden;
    background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 30%),
        linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(59, 130, 246, 0.06));
}

.checkout-hero::before,
.checkout-hero::after {
    content: '';
    position: absolute;
    inset: auto;
    border-radius: 999px;
    filter: blur(18px);
    pointer-events: none;
}

.checkout-hero::before {
    width: 160px;
    height: 160px;
    top: -40px;
    right: 8%;
    background: rgba(59, 130, 246, 0.18);
}

.checkout-hero::after {
    width: 220px;
    height: 220px;
    bottom: -120px;
    left: 20%;
    background: rgba(20, 184, 166, 0.16);
}

.hero-copy,
.hero-summary {
    position: relative;
    z-index: 1;
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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
    margin: 1rem 0 0.75rem;
    font-size: clamp(2rem, 3.8vw, 3.75rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
    color: var(--text);
    max-width: 12ch;
}

.hero-copy p {
    max-width: 60ch;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.7;
}

.hero-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.hero-pills span {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.7rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.65);
    color: var(--text);
    box-shadow: var(--shadow);
}

.hero-summary-card,
.form-card,
.summary-card,
.empty-card {
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.hero-summary-card {
    border-radius: 1.4rem;
    padding: 1rem;
}

.summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0;
    color: var(--text);
}

.summary-row.total {
    font-size: 1.05rem;
}

.summary-divider {
    height: 1px;
    margin: 0.4rem 0;
    background: var(--border);
}

.empty-state {
    display: grid;
    place-items: center;
    padding: 2rem 0;
}

.empty-card {
    width: min(100%, 540px);
    border-radius: 1.5rem;
    padding: 2rem;
    text-align: center;
}

.empty-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    display: grid;
    place-items: center;
    border-radius: 1.25rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(20, 184, 166, 0.16));
    color: var(--primary);
    font-size: 1.7rem;
}

.empty-card h2 {
    font-size: 1.6rem;
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
    padding: 0.9rem 1.4rem;
    background: var(--primary);
    color: #fff;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.28);
}

.btn-primary:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
}

.checkout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
    gap: 1.5rem;
    align-items: start;
}

.checkout-form {
    display: grid;
    gap: 1rem;
}

.form-card {
    border-radius: 1.5rem;
    padding: 1.25rem;
}

.section-header {
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
    margin-bottom: 1rem;
}

.section-kicker {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    font-weight: 800;
    flex: 0 0 auto;
}

.section-header h2 {
    margin: 0 0 0.2rem;
    font-size: 1.15rem;
}

.section-header p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.5;
}

.field-grid {
    display: grid;
    gap: 1rem;
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
.field select,
.field textarea {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.72);
    padding: 0.95rem 1rem;
    color: var(--text);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.field textarea {
    resize: vertical;
    min-height: 120px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.field-wide {
    grid-column: 1 / -1;
}

.choice-grid {
    display: grid;
    gap: 0.75rem;
}

.payment-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.choice-card {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 1.1rem;
    background: rgba(255, 255, 255, 0.7);
    padding: 1rem;
    text-align: left;
    color: var(--text);
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.choice-card:hover {
    transform: translateY(-1px);
    border-color: rgba(59, 130, 246, 0.3);
}

.choice-card.active {
    border-color: var(--primary);
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.14);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(20, 184, 166, 0.08));
}

.choice-card i {
    width: 2.8rem;
    height: 2.8rem;
    display: grid;
    place-items: center;
    border-radius: 0.9rem;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    font-size: 1.05rem;
    flex: 0 0 auto;
}

.choice-copy {
    flex: 1;
    min-width: 0;
}

.choice-copy strong {
    display: block;
    font-size: 0.98rem;
    margin-bottom: 0.2rem;
}

.choice-copy p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.86rem;
    line-height: 1.45;
}

.choice-price {
    font-weight: 800;
    color: var(--text);
    white-space: nowrap;
}

.shipping-note {
    margin-top: 0.85rem;
    padding: 0.9rem 1rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.08);
    color: var(--text);
    font-size: 0.92rem;
}

.shipping-note.success {
    background: rgba(16, 185, 129, 0.11);
    color: #047857;
}

.promo-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: end;
}

.promo-field {
    margin: 0;
}

.promo-field input {
    text-transform: uppercase;
}

.promo-btn,
.promo-remove-btn {
    border: none;
    border-radius: 999px;
    padding: 0.9rem 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.promo-btn {
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: white;
    box-shadow: 0 14px 28px rgba(59, 130, 246, 0.2);
}

.promo-remove-btn {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
}

.promo-btn:hover,
.promo-remove-btn:hover {
    transform: translateY(-1px);
}

.promo-success,
.promo-error {
    margin: 0.85rem 0 0;
    padding: 0.85rem 1rem;
    border-radius: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.92rem;
    line-height: 1.5;
}

.promo-success {
    background: rgba(16, 185, 129, 0.11);
    color: #047857;
}

.promo-error {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.promo-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 0.85rem;
}

.promo-chip {
    display: inline-grid;
    gap: 0.15rem;
    min-width: 135px;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 0.95rem;
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.promo-chip:hover {
    transform: translateY(-1px);
    border-color: rgba(59, 130, 246, 0.35);
    box-shadow: var(--shadow);
}

.promo-chip strong {
    color: var(--primary);
    font-size: 0.92rem;
}

.promo-chip span {
    color: var(--text-muted);
    font-size: 0.82rem;
    line-height: 1.35;
}

.promo-applied {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    margin-top: 0.9rem;
    padding: 0.95rem 1rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.16);
}

.promo-applied strong {
    display: block;
    color: var(--text);
    margin-bottom: 0.1rem;
}

.promo-applied p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.45;
}

.terms-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.25rem 0.1rem;
    color: var(--text);
}

.terms-row input {
    margin-top: 0.25rem;
}

.alert {
    padding: 0.85rem 1rem;
    border-radius: 1rem;
    font-size: 0.92rem;
}

.alert.error {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.alert.success {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.place-order-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    border: none;
    border-radius: 1.15rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: white;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(59, 130, 246, 0.26);
    transition: transform 0.2s, filter 0.2s, opacity 0.2s;
}

.place-order-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.02);
}

.place-order-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

.summary-panel {
    position: relative;
}

.summary-card {
    border-radius: 1.5rem;
    padding: 1.25rem;
}

.summary-card.sticky {
    position: sticky;
    top: 6rem;
}

.summary-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.summary-kicker {
    display: inline-flex;
    margin-bottom: 0.35rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.summary-head h3 {
    margin: 0;
    font-size: 1.35rem;
}

.summary-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
}

.summary-items {
    display: grid;
    gap: 0.85rem;
    margin-bottom: 1rem;
}

.summary-item {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;
}

.summary-item img {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 0.9rem;
    border: 1px solid var(--border);
}

.summary-item-copy {
    min-width: 0;
}

.summary-item-copy strong {
    display: block;
    font-size: 0.92rem;
    margin-bottom: 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.summary-item-copy span {
    font-size: 0.84rem;
    color: var(--text-muted);
}

.summary-item-total {
    font-weight: 800;
    white-space: nowrap;
}

.summary-lines {
    display: grid;
    gap: 0.65rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}

.line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.line span {
    color: var(--text-muted);
}

.line.total {
    padding-top: 0.2rem;
    font-size: 1.06rem;
}

.summary-info {
    display: grid;
    gap: 0.85rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.info-row {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
}

.info-row i {
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    border-radius: 0.8rem;
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
    flex: 0 0 auto;
}

.info-row strong {
    display: block;
    margin-bottom: 0.1rem;
}

.info-row p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.88rem;
    line-height: 1.45;
}

@media (max-width: 1100px) {
    .checkout-hero,
    .checkout-grid {
        grid-template-columns: 1fr;
    }

    .summary-card.sticky {
        position: static;
    }
}

@media (max-width: 820px) {
    .hero-copy h1 {
        max-width: none;
    }

    .field-grid.two-up,
    .payment-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .checkout-page {
        padding: 0 0.75rem 1.5rem;
    }

    .checkout-hero,
    .form-card,
    .summary-card,
    .empty-card {
        border-radius: 1.25rem;
    }

    .hero-copy h1 {
        font-size: 2rem;
    }

    .hero-pills {
        flex-direction: column;
    }

    .choice-card {
        align-items: flex-start;
        flex-direction: column;
    }

    .choice-price {
        align-self: flex-end;
    }

    .summary-item {
        grid-template-columns: 48px minmax(0, 1fr);
    }

    .summary-item-total {
        grid-column: 2 / -1;
        margin-left: auto;
    }

    .promo-row,
    .promo-applied {
        grid-template-columns: 1fr;
        display: grid;
    }

    .promo-btn,
    .promo-remove-btn {
        width: 100%;
    }
}
</style>
