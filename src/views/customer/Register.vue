<template>
    <div class="register-page">
        <div class="register-card">
            <div class="register-header">
                <h2>Create Account</h2>
                <p>Join us for a great shopping experience</p>
            </div>

            <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

            <form v-if="!otpSent" @submit.prevent="requestOtp">
                <div class="input-group">
                    <label>Full Name</label>
                    <div class="input-icon-wrapper">
                        <i class="fas fa-user"></i>
                        <input type="text" v-model="name" placeholder="John Doe" required :disabled="loading" />
                    </div>
                </div>

                <div class="input-group">
                    <label>Mobile Number</label>
                    <div class="phone-input-wrapper">
                        <div class="country-code-selector">
                            <select v-model="countryCode" :disabled="loading">
                                <option value="+880">🇧🇩 +880</option>
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                            </select>
                        </div>
                        <div class="mobile-number-input">
                            <div class="input-icon-wrapper">
                                <i class="fas fa-phone-alt"></i>
                                <input type="tel" v-model="mobileNumber" placeholder="1712345678" required
                                    :disabled="loading" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="input-group">
                    <label>Password</label>
                    <div class="input-icon-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" v-model="password" placeholder="••••••••" required :disabled="loading" />
                    </div>
                </div>

                <div class="input-group">
                    <label>Confirm Password</label>
                    <div class="input-icon-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" v-model="passwordConfirmation" placeholder="••••••••" required
                            :disabled="loading" />
                    </div>
                </div>

                <button type="submit" class="btn-primary" :disabled="loading">
                    <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                    <span v-else>Send OTP</span>
                </button>
                <p class="login-link">Already have an account? <router-link to="/login">Login</router-link></p>
            </form>

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
                    <span v-else>Verify & Register</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
// (same script code as before – unchanged)
</script>

<style scoped>
/* ===== Global form styling ===== */
.register-page {
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
}

.register-card {
    background: var(--card);
    border-radius: 1.5rem;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: var(--shadow-lg);
}

.register-header {
    text-align: center;
    margin-bottom: 2rem;
}

.register-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
}

.register-header p {
    color: var(--text-muted);
}

/* VERTICAL STACKING – label above input */
.input-group {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text);
    letter-spacing: -0.2px;
}

.input-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon-wrapper i {
    position: absolute;
    left: 1rem;
    color: var(--text-muted);
    font-size: 1rem;
    pointer-events: none;
}

.input-icon-wrapper input,
.country-code-selector select {
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 2.5rem;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 0.9rem;
    font-size: 1rem;
    color: var(--text);
    transition: all 0.2s;
}

/* No icon in country selector, adjust padding */
.country-code-selector select {
    padding-left: 2.5rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    appearance: none;
}

.input-icon-wrapper input:focus,
.country-code-selector select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Phone input row (desktop) */
.phone-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (min-width: 481px) {
    .phone-input-wrapper {
        flex-direction: row;
    }

    .country-code-selector {
        flex: 0 0 120px;
    }

    .mobile-number-input {
        flex: 1;
    }
}

/* OTP inputs */
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
    border: 1.5px solid var(--border);
    border-radius: 0.9rem;
    color: var(--text);
}

.otp-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

.btn-primary {
    width: 100%;
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.85rem;
    border-radius: 0.9rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
}

.login-link {
    text-align: center;
    margin-top: 1.5rem;
    color: var(--text-muted);
}

.login-link a {
    color: var(--primary);
    text-decoration: none;
}

.alert {
    padding: 0.75rem;
    border-radius: 0.9rem;
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
    .register-card {
        padding: 1.5rem;
    }

    .otp-input {
        width: 2.5rem;
        height: 3rem;
        font-size: 1.2rem;
    }
}
</style>