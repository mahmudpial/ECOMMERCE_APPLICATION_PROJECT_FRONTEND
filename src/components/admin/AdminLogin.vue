<template>
  <div class="admin-login">
    <div class="login-container">
      <!-- Brand -->
      <div class="brand-wrapper">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in with your mobile number</p>
      </div>

      <!-- Error / success messages -->
      <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
      <div v-if="otpSentMessage" class="message success">{{ otpSentMessage }}</div>

      <!-- Debug: shows exactly what identifier will be sent -->
      <div v-if="form.mobile" class="message debug">
        Will send as: <strong>{{ previewIdentifier }}</strong>
      </div>

      <form @submit.prevent="handleLogin">
        <!-- Mobile number with country code -->
        <div class="input-group">
          <label>Mobile number</label>
          <div class="mobile-row">
            <select v-model="countryCode" class="country-code" :disabled="otpSent">
              <option value="+880">🇧🇩 +880</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
            </select>
            <input v-model="form.mobile" type="tel" inputmode="numeric" placeholder="1712345678" :disabled="otpSent" />
          </div>
          <small class="hint">Enter number without country code. Leading 0 is removed automatically.</small>
        </div>

        <!-- OTP input — shown after code is sent -->
        <div v-if="otpSent" class="input-group">
          <label>Verification code</label>
          <div class="otp-boxes">
            <input v-for="(digit, idx) in otpDigits" :key="idx" v-model="otpDigits[idx]" type="text" maxlength="1"
              inputmode="numeric" class="otp-digit" @input="onOtpInput(idx, $event)"
              @keydown.backspace="onOtpBackspace(idx)" ref="otpInputs" />
          </div>
          <div class="resend-row">
            <button type="button" class="link-btn" @click="resetToMobile">← Change number</button>
            <button type="button" class="link-btn" @click="resendOtp" :disabled="otpCooldown > 0">
              {{ otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend code' }}
            </button>
          </div>
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Please wait...' : (otpSent ? 'Login to dashboard' : 'Send code') }}
        </button>
      </form>

      <p class="copyright">© {{ year }} Commercia. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

const router = useRouter()
const authStore = useAuthStore()
const year = new Date().getFullYear()

const countryCode = ref('+880')
const form = ref({ mobile: '' })
const otpDigits = ref(['', '', '', '', '', ''])
const otpSent = ref(false)
const errorMessage = ref('')
const otpSentMessage = ref('')
const isLoading = ref(false)
const otpCooldown = ref(0)
const otpInputs = ref([])
let cooldownTimer = null

/**
 * Build the identifier sent to the backend.
 *
 * The backend stores mobile numbers in various formats depending on how
 * the user registered. Common formats in Bangladeshi numbers:
 *   Stored as: 01712345678   → user typed 01712345678  (with leading 0)
 *   Stored as: 1712345678    → user typed 1712345678   (without leading 0)
 *   Stored as: +8801712345678 → full international format
 *
 * Strategy: try to match exactly what is in the DB.
 * We send the number exactly as typed (digits only, no country code prefix)
 * so it matches however it was stored during registration.
 *
 * If your DB stores numbers WITH country code (+880...), change this to:
 *   return countryCode.value + localDigits.replace(/^0/, '')
 *
 * If your DB stores numbers WITHOUT country code (01712... or 1712...),
 * send just the local number as-is:
 *   return localDigits
 */
const buildIdentifier = () => {
  const localDigits = form.value.mobile.replace(/\D/g, '')
  // Send exactly what the user typed — resolveUserByIdentifier does
  // an OR query on both email and mobile columns, so it will find
  // the record as long as the value matches what is stored.
  return localDigits
}

// Shows in the UI so the developer can see exactly what will be sent
const previewIdentifier = computed(() => buildIdentifier())

watch(otpDigits, () => { }, { deep: true })

const onOtpInput = (idx, event) => {
  const val = event.target.value.replace(/\D/g, '')
  if (val.length) {
    otpDigits.value[idx] = val.slice(0, 1)
    if (idx < 5) nextTick(() => otpInputs.value[idx + 1]?.focus())
  }
}

const onOtpBackspace = (idx) => {
  if (idx > 0 && !otpDigits.value[idx]) {
    nextTick(() => otpInputs.value[idx - 1]?.focus())
  }
}

const startCooldown = (sec = 60) => {
  if (cooldownTimer) clearInterval(cooldownTimer)
  otpCooldown.value = sec
  cooldownTimer = setInterval(() => {
    if (otpCooldown.value <= 1) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
      otpCooldown.value = 0
    } else {
      otpCooldown.value -= 1
    }
  }, 1000)
}

onBeforeUnmount(() => { if (cooldownTimer) clearInterval(cooldownTimer) })

const resetToMobile = () => {
  otpSent.value = false
  otpDigits.value = ['', '', '', '', '', '']
  errorMessage.value = ''
  otpSentMessage.value = ''
  if (cooldownTimer) clearInterval(cooldownTimer)
  otpCooldown.value = 0
}

const sendOtp = async () => {
  if (!form.value.mobile.trim()) {
    errorMessage.value = 'Mobile number is required'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  otpSentMessage.value = ''

  try {
    await api.post('admin/send-otp', { identifier: buildIdentifier() })
    otpSent.value = true
    otpSentMessage.value = `Code sent! (identifier used: ${buildIdentifier()})`
    startCooldown()
    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => otpInputs.value[0]?.focus())
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.message || ''

    if (status === 404 && message === 'Account not found') {
      // Controller returned 404 — mobile not in DB.
      // Show exactly what identifier was sent so it's easy to debug.
      errorMessage.value =
        `No account found for "${buildIdentifier()}". ` +
        `Check the mobile column in your users table and match the format.`
    } else {
      errorMessage.value = message || 'Failed to send code'
    }
  } finally {
    isLoading.value = false
  }
}

const resendOtp = () => {
  if (otpCooldown.value === 0) sendOtp()
}

const handleLogin = async () => {
  if (!otpSent.value) {
    await sendOtp()
    return
  }

  const fullOtp = otpDigits.value.join('')
  if (fullOtp.length !== 6) {
    errorMessage.value = 'Enter all 6 digits of your verification code'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const success = await authStore.login({
      mobile: buildIdentifier(),
      otp: fullOtp,
    })

    if (success) {
      router.push('/admin/dashboard')
    } else {
      errorMessage.value = 'Invalid or expired code. Please try again.'
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 1.5rem;
}

.login-container {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.brand-wrapper {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  background: linear-gradient(145deg, #4f46e5, #3b82f6);
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: white;
  margin-bottom: 0.5rem;
}

p {
  color: #94a3b8;
  font-size: 0.875rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.message.error {
  background: rgba(239, 68, 68, 0.15);
  border-left: 3px solid #ef4444;
  color: #fecaca;
}

.message.success {
  background: rgba(16, 185, 129, 0.15);
  border-left: 3px solid #10b981;
  color: #a7f3d0;
}

/* Temporary debug banner — remove after confirming login works */
.message.debug {
  background: rgba(234, 179, 8, 0.12);
  border-left: 3px solid #eab308;
  color: #fef08a;
  font-family: monospace;
  font-size: 0.78rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.hint {
  display: block;
  font-size: 0.7rem;
  color: #475569;
  margin-top: 0.4rem;
}

.mobile-row {
  display: flex;
  gap: 0.75rem;
}

.country-code {
  flex-shrink: 0;
  width: auto;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.country-code:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.otp-boxes {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.otp-digit {
  width: 52px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0;
  flex-shrink: 0;
}

.resend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.link-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #818cf8;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}

.link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-btn:not(:disabled):hover {
  opacity: 0.8;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -12px rgba(79, 70, 229, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.copyright {
  text-align: center;
  font-size: 0.7rem;
  color: #475569;
  margin-top: 2rem;
}
</style>