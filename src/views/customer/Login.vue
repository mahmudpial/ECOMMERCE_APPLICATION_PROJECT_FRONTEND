<template>
    <div class="login-page">
        <div class="login-card">
            <div class="login-header">
                <h2>Welcome Back</h2>
                <p>Login with your mobile number</p>
            </div>

            <!-- Error / success messages -->
            <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

            <!-- Step 1: Mobile number request -->
            <form v-if="!otpRequested" @submit.prevent="requestOtp">
                <div class="input-group">
                    <label>Mobile Number</label>
                    <div class="phone-input">
                        <select v-model="countryCode" class="country-code">
                            <option value="+880">🇧🇩 +880</option>
                        </select>
                        <input type="tel" v-model="mobileNumber" placeholder="1712345678" required
                            :disabled="loading" />
                    </div>
                    <small class="phone-hint">
                        Enter the same mobile number format saved in your account. Do not include the country code.
                    </small>
                </div>
                <button type="submit" class="btn-primary" :disabled="loading">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <span v-else>Send OTP</span>
                </button>
                <p class="register-link">
                    Don't have an account? <router-link to="/register">Register</router-link>
                </p>
            </form>

            <!-- Step 2: OTP verification -->
            <form v-else @submit.prevent="verifyOtp">
                <div class="input-group">
                    <label>Verification Code</label>
                    <div class="otp-container">
                        <input v-for="(digit, idx) in otpDigits" :key="idx" type="text" maxlength="1"
                            inputmode="numeric" v-model="otpDigits[idx]" @input="handleOtpInput(idx, $event)"
                            @keydown.backspace="handleOtpBackspace(idx)" ref="otpInputs" class="otp-input"
                            :disabled="loading" />
                    </div>
                    <p class="resend-link">
                        Didn't receive code?
                        <button type="button" @click="resendOtp" :disabled="resendCooldown > 0" class="resend-btn">
                            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
                        </button>
                    </p>
                </div>
                <button type="submit" class="btn-primary" :disabled="loading">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <span v-else>Verify & Login</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import api from '@/utils/axios'

const router = useRouter()
const route = useRoute()
const authStore = useCustomerAuthStore()

const countryCode = ref('+880')
const mobileNumber = ref('')
const otpRequested = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const resendCooldown = ref(0)
let cooldownTimer = null
let fullOtp = ref('')
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

const buildIdentifier = () => {
    // The backend looks up the account by the saved mobile value in the users table.
    // Sending a country-code-prefixed number here can break the match if the DB stores
    // the raw local digits (for example: 01712345678 or 1712345678).
    return mobileNumber.value.replace(/\D/g, '')
}

const handleOtpInput = (idx, event) => {
    const val = event.target.value.replace(/\D/g, '')
    if (val.length) {
        otpDigits.value[idx] = val.slice(0, 1)
        if (idx < 5) nextTick(() => otpInputs.value[idx + 1]?.focus())
    }
    fullOtp.value = otpDigits.value.join('')
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
        successMessage.value = 'OTP sent to your mobile number'
        startCooldown()
        // Focus first OTP input
        await nextTick()
        if (otpInputs.value[0]) otpInputs.value[0].focus()
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to send OTP. Try again.'
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
            otp: otp,
        })
        // Login successful – store token and user
        await authStore.login(response.data) // expects { token, user }
        // Redirect to intended page or home
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
.login-page {
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}

.login-card {
    background: var(--card);
    border-radius: 1.5rem;
    padding: 2rem;
    width: 100%;
    max-width: 450px;
    box-shadow: var(--shadow-lg);
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
}

.login-header p {
    color: var(--text-muted);
}

.input-group {
    margin-bottom: 1.5rem;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text);
}

.phone-input {
    display: flex;
    gap: 0.5rem;
}

.country-code {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.75rem;
    color: var(--text);
}

.phone-input input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.75rem;
    color: var(--text);
}

.phone-hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.82rem;
    line-height: 1.4;
    color: var(--text-muted);
}

.phone-input input:focus,
.country-code:focus,
.otp-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.otp-container {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.otp-input {
    width: 3rem;
    height: 3.5rem;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 600;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    color: var(--text);
}

.resend-link {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
}

.resend-btn {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    font-weight: 500;
}

.resend-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    width: 100%;
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.8rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: var(--text-muted);
}

.register-link a {
    color: var(--primary);
    text-decoration: none;
}

.alert {
    padding: 0.75rem;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.alert.error {
    background: rgba(239, 68, 68, 0.15);
    border-left: 3px solid #ef4444;
    color: #ef4444;
}

.alert.success {
    background: rgba(16, 185, 129, 0.15);
    border-left: 3px solid #10b981;
    color: #10b981;
}

@media (max-width: 480px) {
    .login-card {
        padding: 1.5rem;
    }

    .otp-input {
        width: 2.5rem;
        height: 3rem;
        font-size: 1.2rem;
    }

    .phone-input {
        flex-direction: column;
    }

    .country-code {
        width: 100%;
    }
}
</style>
