<template>
    <div class="login-page" :class="{ dark: isDark }">
        <div class="login-card">
            <div class="brand-mark">Commercia</div>
            <div class="badge-label">Secure access</div>
            <h1 class="card-title">Welcome back</h1>
            <p class="card-subtitle">Login with your mobile number</p>

            <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

            <!-- Step 1: Request OTP -->
            <form v-if="!otpRequested" @submit.prevent="requestOtp">
                <div class="field-group">
                    <label>Mobile number</label>
                    <div class="phone-row">
                        <div class="country-select">
                            <select v-model="countryCode" :disabled="loading" class="country-code">
                                <option value="+880">🇧🇩 +880</option>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                            </select>
                        </div>
                        <div class="mobile-input">
                            <div class="input-wrapper">
                                <span class="input-icon">📱</span>
                                <input type="tel" v-model="mobileNumber" placeholder="1712345678" required
                                    :disabled="loading" autocomplete="off" />
                            </div>
                        </div>
                    </div>
                    <small class="field-hint">Enter the same mobile number format saved in your account. Do not include
                        the country code.</small>
                </div>

                <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">Sending...</span>
                    <span v-else>Send verification code</span>
                </button>
                <p class="form-footer">Don't have an account? <router-link to="/register">Register</router-link></p>
            </form>

            <!-- Step 2: OTP Verification -->
            <form v-else @submit.prevent="verifyOtp">
                <div class="field-group">
                    <label>Verification code</label>
                    <div class="otp-group">
                        <input v-for="(digit, idx) in otpDigits" :key="idx" type="text" maxlength="1"
                            inputmode="numeric" v-model="otpDigits[idx]" @input="handleOtpInput(idx, $event)"
                            @keydown.backspace="handleOtpBackspace(idx)" ref="otpInputs" class="otp-input"
                            :disabled="loading" />
                    </div>
                    <p class="resend-text">
                        Didn't receive the code?
                        <button type="button" @click="resendOtp" :disabled="resendCooldown > 0" class="resend-btn">
                            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
                        </button>
                    </p>
                </div>
                <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">Verifying...</span>
                    <span v-else>Verify & login</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import api from '@/utils/axios'

const router = useRouter()
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

const countryCode = ref('+880')
const mobileNumber = ref('')  // ✅ Starts empty, no stray text
const otpRequested = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const resendCooldown = ref(0)
let cooldownTimer = null
const otpInputs = ref([])

const startCooldown = (seconds = 60) => {
    if (cooldownTimer) clearInterval(cooldownTimer)
    resendCooldown.value = seconds
    cooldownTimer = setInterval(() => {
        if (resendCooldown.value <= 1) {
            clearInterval(cooldownTimer)
            cooldownTimer = null
            resendCooldown.value = 0
        } else {
            resendCooldown.value -= 1
        }
    }, 1000)
}

const buildIdentifier = () => mobileNumber.value.replace(/\D/g, '')

const handleOtpInput = (idx, event) => {
    const val = event.target.value.replace(/\D/g, '')
    if (val.length) {
        otpDigits.value[idx] = val.slice(0, 1)
        if (idx < 5) nextTick(() => otpInputs.value[idx + 1]?.focus())
    } else {
        otpDigits.value[idx] = ''
    }
}

const handleOtpBackspace = (idx) => {
    if (idx > 0 && !otpDigits.value[idx]) {
        nextTick(() => otpInputs.value[idx - 1]?.focus())
    }
}

const requestOtp = async () => {
    if (!mobileNumber.value.trim()) {
        errorMessage.value = 'Mobile number is required'
        return
    }
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const identifier = buildIdentifier()
        await api.post('auth/login/request-otp', {
            mobile: identifier,
            identifier,
        })
        otpRequested.value = true
        successMessage.value = 'Verification code sent to your mobile number'
        startCooldown()
        await nextTick()
        if (otpInputs.value[0]) otpInputs.value[0].focus()
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to send OTP. Please try again.'
    } finally {
        loading.value = false
    }
}

const verifyOtp = async () => {
    const otp = otpDigits.value.join('')
    if (otp.length !== 6) {
        errorMessage.value = 'Please enter the 6‑digit verification code'
        return
    }
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const identifier = buildIdentifier()
        const response = await api.post('auth/login/verify-otp', {
            mobile: identifier,
            identifier,
            otp,
        })
        await authStore.login(response.data)
        const redirect = route.query.redirect || '/'
        router.push(redirect)
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Invalid verification code'
    } finally {
        loading.value = false
    }
}

const resendOtp = async () => {
    if (resendCooldown.value > 0) return
    await requestOtp()
}

onUnmounted(() => {
    if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* CSS Variables for light/dark mode */
.login-page {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.login-page.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
}

.login-card {
    max-width: 480px;
    width: 100%;
    background: var(--bg-card);
    border-radius: 28px;
    padding: 2rem;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--border-light);
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
    margin-bottom: 0.75rem;
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

.card-title {
    font-family: 'Sora', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    color: var(--text-primary);
}

.card-subtitle {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

/* Form fields */
.field-group {
    margin-bottom: 1.25rem;
}

.field-group label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.3rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 1rem;
    font-size: 1rem;
    color: var(--text-muted);
    pointer-events: none;
}

.input-wrapper input,
.country-code {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    background: var(--bg-page);
    border: 1px solid var(--border-input);
    border-radius: 14px;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: all 0.2s;
}

.input-wrapper input:focus,
.country-code:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

/* Phone row */
.phone-row {
    display: flex;
    gap: 0.75rem;
}

.country-select {
    flex: 0 0 110px;
}

.mobile-input {
    flex: 1;
}

.country-code {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B7A8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2rem;
}

.field-hint {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.7rem;
    color: var(--text-muted);
    line-height: 1.4;
}

/* OTP inputs */
.otp-group {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin: 0.5rem 0 1rem;
}

.otp-input {
    width: 3rem;
    height: 3.5rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 600;
    background: var(--bg-page);
    border: 1px solid var(--border-input);
    border-radius: 14px;
    color: var(--text-primary);
}

.otp-input:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.1);
}

.resend-text {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.resend-btn {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8rem;
}

.resend-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Buttons */
.btn-primary {
    width: 100%;
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.85rem;
    border-radius: 40px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #0052CC;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-footer {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.form-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
}

.form-footer a:hover {
    text-decoration: underline;
}

/* Alert messages */
.alert {
    padding: 0.75rem 1rem;
    border-radius: 14px;
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

/* Responsive */
@media (max-width: 520px) {
    .login-card {
        padding: 1.5rem;
    }

    .card-title {
        font-size: 1.6rem;
    }

    .phone-row {
        flex-direction: column;
        gap: 0.5rem;
    }

    .country-select {
        flex: auto;
    }

    .otp-group {
        gap: 0.4rem;
    }

    .otp-input {
        width: 2.5rem;
        height: 3rem;
        font-size: 1.1rem;
    }
}
</style>