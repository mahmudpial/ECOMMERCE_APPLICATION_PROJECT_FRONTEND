<template>
    <div class="app" :class="{ dark: isDark }">

        <!-- ░░ SCROLL PROGRESS BAR ░░ -->
        <div class="progress-bar" :style="{ transform: `scaleX(${scrollProgress})` }"></div>

        <!-- ░░ OVERLAY ░░ -->
        <Transition name="t-overlay">
            <div v-if="drawerOpen" class="overlay" @click="closeDrawer"></div>
        </Transition>

        <!-- ░░ HEADER ░░ -->
        <header class="header" :class="{ 'header--lifted': isScrolled }">
            <div class="header__wrap">

                <!-- Logo -->
                <router-link to="/" class="brand" @click="closeDrawer">
                    <span class="brand__icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor" />
                            <rect x="11" y="1" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                            <rect x="1" y="11" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                            <rect x="11" y="11" width="8" height="8" rx="1.5" fill="currentColor" />
                        </svg>
                    </span>
                    <span class="brand__name">Commercia</span>
                </router-link>

                <!-- Desktop nav -->
                <nav class="nav" aria-label="Primary navigation">
                    <router-link to="/" class="nav__item" exact-active-class="nav__item--active">Home</router-link>
                    <router-link to="/products" class="nav__item" active-class="nav__item--active">Shop</router-link>
                    <router-link to="/cart" class="nav__item nav__item--cart" active-class="nav__item--active">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.75">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Cart
                        <span v-if="cartCount" class="nav__badge">{{ cartCount }}</span>
                    </router-link>
                </nav>

                <!-- Right controls -->
                <div class="controls">
                    <!-- User chip (desktop) -->
                    <div v-if="isLoggedIn" class="user-menu" tabindex="0" @click="toggleUserMenu" @blur="blurUserMenu">
                        <div class="user-menu__avatar">{{ userInitial }}</div>
                        <span class="user-menu__name">{{ firstName }}</span>
                        <svg class="user-menu__caret" :class="{ flip: userMenuOpen }" width="10" height="10"
                            viewBox="0 0 10 10">
                            <path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
                                fill="none" />
                        </svg>
                        <Transition name="t-drop">
                            <div v-if="userMenuOpen" class="dropdown" role="menu">
                                <router-link to="/profile" class="dropdown__item" role="menuitem">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="1.8">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Profile
                                </router-link>
                                <router-link to="/orders" class="dropdown__item" role="menuitem">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="1.8">
                                        <path
                                            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    My Orders
                                </router-link>
                                <div class="dropdown__sep"></div>
                                <button class="dropdown__item dropdown__item--danger" role="menuitem" @click="logout">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="1.8">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </Transition>
                    </div>
                    <router-link v-else to="/login" class="btn-primary">Sign in</router-link>

                    <!-- Theme toggle -->
                    <button class="ctrl-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
                        <Transition name="t-icon" mode="out-in">
                            <svg v-if="isDark" key="sun" width="17" height="17" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.8">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                            <svg v-else key="moon" width="17" height="17" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.8">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        </Transition>
                    </button>

                    <!-- Hamburger (mobile only) -->
                    <button class="hamburger" @click="openDrawer" aria-label="Open menu"
                        :class="{ active: drawerOpen }">
                        <span></span><span></span><span></span>
                    </button>
                </div>

            </div>
        </header>

        <!-- ░░ DRAWER (slides from right) ░░ -->
        <aside class="drawer" :class="{ open: drawerOpen }" aria-label="Mobile navigation">
            <div class="drawer__header">
                <router-link to="/" class="brand" @click="closeDrawer">
                    <span class="brand__icon">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor" />
                            <rect x="11" y="1" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                            <rect x="1" y="11" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                            <rect x="11" y="11" width="8" height="8" rx="1.5" fill="currentColor" />
                        </svg>
                    </span>
                    <span class="brand__name">Commercia</span>
                </router-link>
                <button class="drawer__close" @click="closeDrawer" aria-label="Close menu">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.6"
                            stroke-linecap="round" />
                    </svg>
                </button>
            </div>

            <!-- Logged-in user strip -->
            <div v-if="isLoggedIn" class="drawer__user">
                <div class="drawer__avatar">{{ userInitial }}</div>
                <div class="drawer__user-info">
                    <p class="drawer__user-name">{{ user?.name }}</p>
                    <p class="drawer__user-email">{{ user?.email }}</p>
                </div>
            </div>

            <nav class="drawer__nav">
                <p class="drawer__label">Menu</p>
                <button class="drawer__link" @click="go('/')" :style="{ '--d': '0ms' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.7">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                </button>
                <button class="drawer__link" @click="go('/products')" :style="{ '--d': '50ms' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.7">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Shop
                </button>
                <button class="drawer__link" @click="go('/cart')" :style="{ '--d': '100ms' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.7">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Cart
                    <span v-if="cartCount" class="drawer__badge">{{ cartCount }}</span>
                </button>

                <template v-if="isLoggedIn">
                    <p class="drawer__label">Account</p>
                    <button class="drawer__link" @click="go('/profile')" :style="{ '--d': '150ms' }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.7">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                    </button>
                    <button class="drawer__link" @click="go('/orders')" :style="{ '--d': '200ms' }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.7">
                            <path
                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                        My Orders
                    </button>
                    <button class="drawer__link drawer__link--danger" @click="handleLogout" :style="{ '--d': '250ms' }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.7">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                    </button>
                </template>
                <template v-else>
                    <p class="drawer__label">Account</p>
                    <button class="drawer__link" @click="go('/login')" :style="{ '--d': '150ms' }">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.7">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Sign in
                    </button>
                </template>
            </nav>

            <div class="drawer__footer">
                <button class="drawer__theme" @click="toggleTheme">
                    <Transition name="t-icon" mode="out-in">
                        <svg v-if="isDark" key="s" width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                        </svg>
                        <svg v-else key="m" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    </Transition>
                    {{ isDark ? 'Light mode' : 'Dark mode' }}
                    <div class="toggle-pill" :class="{ on: isDark }">
                        <div class="toggle-pill__thumb"></div>
                    </div>
                </button>
                <p class="drawer__copy">&copy; {{ year }} Commercia</p>
            </div>
        </aside>

        <!-- ░░ PAGE ░░ -->
        <main class="page">
            <div class="wrap">
                <router-view />
            </div>
        </main>

        <!-- ░░ FOOTER ░░ -->
        <footer class="footer">
            <div class="footer__wrap">
                <div class="footer__top">

                    <div class="footer__brand-col">
                        <router-link to="/" class="brand">
                            <span class="brand__icon">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor" />
                                    <rect x="11" y="1" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                                    <rect x="1" y="11" width="8" height="8" rx="1.5" fill="currentColor" opacity=".4" />
                                    <rect x="11" y="11" width="8" height="8" rx="1.5" fill="currentColor" />
                                </svg>
                            </span>
                            <span class="brand__name">Commercia</span>
                        </router-link>
                        <p class="footer__tagline">Quality products, exceptional experience.</p>
                        <div class="footer__socials">
                            <a href="#" class="social" aria-label="Facebook">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                            <a href="#" class="social" aria-label="Instagram">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                            <a href="#" class="social" aria-label="Twitter/X">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="footer__col">
                        <h5>Explore</h5>
                        <router-link to="/">Home</router-link>
                        <router-link to="/products">Shop</router-link>
                        <router-link to="/cart">Cart</router-link>
                    </div>

                    <div class="footer__col">
                        <h5>Account</h5>
                        <router-link v-if="!isLoggedIn" to="/login">Sign in</router-link>
                        <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>
                        <router-link v-if="isLoggedIn" to="/orders">Orders</router-link>
                    </div>

                    <div class="footer__col">
                        <h5>Contact</h5>
                        <a href="tel:+8801234567890">+880 1234 567890</a>
                        <a href="mailto:support@commercia.com">support@commercia.com</a>
                        <span>Dhaka, Bangladesh</span>
                    </div>

                </div>
                <div class="footer__bottom">
                    <p>&copy; {{ year }} Commercia. All rights reserved.</p>
                    <div class="footer__legal">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Support</a>
                    </div>
                </div>
            </div>
        </footer>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useCustomerAuthStore()
const cartStore = useCartStore()
const year = new Date().getFullYear()

// State
const isDark = ref(false)
const drawerOpen = ref(false)
const userMenuOpen = ref(false)
const isScrolled = ref(false)
const scrollProgress = ref(0)

// Computed
const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const cartCount = computed(() => cartStore.totalItems)
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'U')
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Account')

// Theme
const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
}

// User menu
const toggleUserMenu = () => { userMenuOpen.value = !userMenuOpen.value }
const blurUserMenu = () => { setTimeout(() => { userMenuOpen.value = false }, 160) }

// Drawer
const openDrawer = () => { drawerOpen.value = true; document.body.style.overflow = 'hidden' }
const closeDrawer = () => { drawerOpen.value = false; document.body.style.overflow = '' }

const go = (path) => {
    closeDrawer()
    router.push(path)
}

// Auth
const logout = async () => {
    userMenuOpen.value = false
    await authStore.logout()
    router.push('/')
}

const handleLogout = async () => {
    closeDrawer()
    await authStore.logout()
    router.push('/')
}

// Scroll
const onScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    isScrolled.value = scrollTop > 12
    scrollProgress.value = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
}

const onResize = () => {
    if (window.innerWidth > 768 && drawerOpen.value) closeDrawer()
}

onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { isDark.value = true; document.documentElement.classList.add('dark') }
    authStore.loadUser()
    cartStore.loadCart()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    document.body.style.overflow = ''
})
</script>

<style scoped>
/* ─────────────────────────────────────────────────────────────
   Add to index.html <head>:
   <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
───────────────────────────────────────────────────────────── */

/* ── TOKENS ──────────────────────────────────────────────── */
.app {
    --blue: #0066FF;
    --blue-dim: rgba(0, 102, 255, .08);
    --blue-mid: rgba(0, 102, 255, .14);

    --bg: #FAFAFA;
    --surface: #FFFFFF;
    --surface-2: #F4F4F5;
    --border: #E4E4E7;
    --border-2: #D1D1D6;

    --text-1: #09090B;
    --text-2: #52525B;
    --text-3: #A1A1AA;

    --danger: #DC2626;
    --danger-bg: rgba(220, 38, 38, .06);

    --header-h: 62px;

    --font-brand: 'Sora', system-ui, sans-serif;
    --font-ui: 'Plus Jakarta Sans', system-ui, sans-serif;

    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    font-family: var(--font-ui);
    background: var(--bg);
    color: var(--text-1);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.app.dark {
    --bg: #09090B;
    --surface: #111113;
    --surface-2: #18181B;
    --border: #27272A;
    --border-2: #3F3F46;
    --text-1: #FAFAFA;
    --text-2: #A1A1AA;
    --text-3: #52525B;
    --blue-dim: rgba(0, 102, 255, .12);
    --blue-mid: rgba(0, 102, 255, .2);
}

/* ── PROGRESS BAR ────────────────────────────────────────── */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2.5px;
    background: var(--blue);
    transform-origin: left;
    z-index: 1000;
    transition: transform 0.1s linear;
}

/* ── OVERLAY ─────────────────────────────────────────────── */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(9, 9, 11, .5);
    backdrop-filter: blur(2px);
    z-index: 300;
}

/* ── HEADER ──────────────────────────────────────────────── */
.header {
    position: sticky;
    top: 0;
    z-index: 200;
    height: var(--header-h);
    background: var(--bg);
    border-bottom: 1px solid transparent;
    transition: border-color 0.25s, background 0.25s;
}

.header--lifted {
    border-bottom-color: var(--border);
    background: rgba(250, 250, 250, .92);
    backdrop-filter: blur(16px) saturate(1.2);
}

.app.dark .header--lifted {
    background: rgba(9, 9, 11, .92);
}

.header__wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.75rem;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 2rem;
}

/* ── BRAND ───────────────────────────────────────────────── */
.brand {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    text-decoration: none;
    flex-shrink: 0;
}

.brand__icon {
    color: var(--blue);
    display: flex;
    align-items: center;
}

.brand__name {
    font-family: var(--font-brand);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -0.02em;
}

/* ── DESKTOP NAV ─────────────────────────────────────────── */
.nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: auto;
}

.nav__item {
    position: relative;
    padding: 0.45rem 0.85rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-2);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    transition: color 0.15s, background 0.15s;
}

.nav__item:hover {
    color: var(--text-1);
    background: var(--surface-2);
}

.nav__item--active {
    color: var(--blue);
    background: var(--blue-dim);
}

.nav__item--cart {
    position: relative;
}

.nav__badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--blue);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-brand);
}

/* ── CONTROLS ────────────────────────────────────────────── */
.controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

/* User menu */
.user-menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.3rem 0.65rem 0.3rem 0.35rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.user-menu:hover,
.user-menu:focus-visible {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px var(--blue-dim);
    outline: none;
}

.user-menu__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--blue);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: var(--font-brand);
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-menu__name {
    font-size: 0.83rem;
    font-weight: 600;
    color: var(--text-1);
}

.user-menu__caret {
    color: var(--text-3);
    transition: transform 0.2s var(--ease-out);
}

.user-menu__caret.flip {
    transform: rotate(180deg);
}

/* Dropdown */
.dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 188px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(9, 9, 11, .1), 0 2px 8px rgba(9, 9, 11, .06);
    overflow: hidden;
    z-index: 100;
}

.dropdown__item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-1);
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s;
}

.dropdown__item:hover {
    background: var(--surface-2);
}

.dropdown__item svg {
    color: var(--text-3);
    flex-shrink: 0;
}

.dropdown__sep {
    height: 1px;
    background: var(--border);
    margin: 3px 0;
}

.dropdown__item--danger {
    color: var(--danger);
}

.dropdown__item--danger svg {
    color: var(--danger);
}

.dropdown__item--danger:hover {
    background: var(--danger-bg);
}

/* Sign-in button */
.btn-primary {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 1.1rem;
    border-radius: 8px;
    background: var(--blue);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.15s, transform 0.15s;
}

.btn-primary:hover {
    opacity: 0.88;
    transform: translateY(-1px);
}

/* Icon control button */
.ctrl-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.ctrl-btn:hover {
    background: var(--surface-2);
    color: var(--text-1);
    border-color: var(--border-2);
}

/* Hamburger */
.hamburger {
    display: none;
    flex-direction: column;
    gap: 4.5px;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.15s, border-color 0.15s;
}

.hamburger:hover {
    background: var(--surface-2);
    border-color: var(--border-2);
}

.hamburger span {
    display: block;
    width: 16px;
    height: 1.5px;
    background: var(--text-1);
    border-radius: 2px;
    transition: transform 0.25s var(--ease-out), opacity 0.2s;
    transform-origin: center;
}

.hamburger.active span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
}

.hamburger.active span:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
}

/* ── DRAWER (right side) ─────────────────────────────────── */
.drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: min(320px, 90vw);
    height: 100dvh;
    background: var(--surface);
    border-left: 1px solid var(--border);
    z-index: 400;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s var(--ease-out);
    overflow: hidden;
}

.drawer.open {
    transform: translateX(0);
}

.drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.drawer__close {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
}

.drawer__close:hover {
    background: var(--border);
    color: var(--text-1);
}

.drawer__user {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
    background: var(--blue-dim);
    flex-shrink: 0;
}

.drawer__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--blue);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: var(--font-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.drawer__user-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-1);
    margin: 0;
    line-height: 1.3;
}

.drawer__user-email {
    font-size: 0.72rem;
    color: var(--text-3);
    margin: 0.15rem 0 0;
}

.drawer__nav {
    flex: 1;
    overflow-y: auto;
    padding: 0.85rem 0.85rem;
}

.drawer__label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-3);
    padding: 0.65rem 0.5rem 0.35rem;
    margin: 0;
}

/* Staggered drawer links */
.drawer__link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 0.85rem;
    border-radius: 9px;
    border: none;
    background: none;
    color: var(--text-1);
    font-family: var(--font-ui);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, color 0.12s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
    margin-bottom: 1px;

    /* Stagger animation when drawer opens */
    opacity: 0;
    transform: translateX(12px);
    animation: none;
}

.drawer.open .drawer__link {
    animation: slideIn 0.35s var(--ease-out) both;
    animation-delay: var(--d, 0ms);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(12px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.drawer__link:hover {
    background: var(--surface-2);
}

.drawer__link:active {
    transform: scale(0.98);
}

.drawer__link svg {
    color: var(--text-3);
    flex-shrink: 0;
    transition: color 0.12s;
}

.drawer__link:hover svg {
    color: var(--blue);
}

.drawer__link--danger {
    color: var(--danger);
}

.drawer__link--danger svg {
    color: var(--danger);
}

.drawer__link--danger:hover {
    background: var(--danger-bg);
}

.drawer__badge {
    margin-left: auto;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--blue);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.drawer__footer {
    padding: 0.85rem 1.1rem 1.25rem;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
}

.drawer__theme {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.65rem 0.85rem;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 0.85rem;
    transition: background 0.12s, border-color 0.12s;
}

.drawer__theme:hover {
    background: var(--blue-dim);
    border-color: var(--blue-mid);
    color: var(--blue);
}

/* Toggle pill */
.toggle-pill {
    width: 34px;
    height: 18px;
    border-radius: 999px;
    background: var(--border-2);
    margin-left: auto;
    position: relative;
    flex-shrink: 0;
    transition: background 0.25s;
}

.toggle-pill.on {
    background: var(--blue);
}

.toggle-pill__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .2);
    transition: transform 0.25s var(--ease-out);
}

.toggle-pill.on .toggle-pill__thumb {
    transform: translateX(16px);
}

.drawer__copy {
    font-size: 0.7rem;
    color: var(--text-3);
    text-align: center;
    margin: 0;
}

/* ── PAGE CONTENT ────────────────────────────────────────── */
.page {
    flex: 1;
    padding: 2rem 0;
}

.wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.75rem;
}

/* ── FOOTER ──────────────────────────────────────────────── */
.footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
}

.footer__wrap {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.75rem;
}

.footer__top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 2.5rem;
    padding: 3rem 0 2rem;
}

.footer__brand-col .brand {
    margin-bottom: 0.85rem;
}

.footer__tagline {
    font-size: 0.85rem;
    color: var(--text-3);
    margin: 0 0 1.25rem;
    line-height: 1.6;
}

.footer__socials {
    display: flex;
    gap: 0.5rem;
}

.social {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.social:hover {
    background: var(--blue);
    color: #fff;
    border-color: var(--blue);
}

.footer__col {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.footer__col h5 {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-3);
    margin: 0 0 0.35rem;
}

.footer__col a,
.footer__col span {
    font-size: 0.85rem;
    color: var(--text-2);
    text-decoration: none;
    transition: color 0.12s;
}

.footer__col a:hover {
    color: var(--blue);
}

.footer__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 0;
    border-top: 1px solid var(--border);
    gap: 1rem;
    flex-wrap: wrap;
}

.footer__bottom p {
    font-size: 0.8rem;
    color: var(--text-3);
    margin: 0;
}

.footer__legal {
    display: flex;
    gap: 1.25rem;
}

.footer__legal a {
    font-size: 0.8rem;
    color: var(--text-3);
    text-decoration: none;
    transition: color 0.12s;
}

.footer__legal a:hover {
    color: var(--text-1);
}

/* ── TRANSITIONS ─────────────────────────────────────────── */
.t-overlay-enter-active,
.t-overlay-leave-active {
    transition: opacity 0.22s ease;
}

.t-overlay-enter-from,
.t-overlay-leave-to {
    opacity: 0;
}

.t-drop-enter-active,
.t-drop-leave-active {
    transition: opacity 0.14s ease, transform 0.16s var(--ease-out);
}

.t-drop-enter-from,
.t-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}

.t-icon-enter-active,
.t-icon-leave-active {
    transition: opacity 0.12s, transform 0.15s;
}

.t-icon-enter-from {
    opacity: 0;
    transform: scale(0.7) rotate(-30deg);
}

.t-icon-leave-to {
    opacity: 0;
    transform: scale(0.7) rotate(30deg);
}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 768px) {
    .nav {
        display: none;
    }

    .hamburger {
        display: flex;
    }

    .user-menu .user-menu__name {
        display: none;
    }

    .user-menu__caret {
        display: none;
    }

    .header__wrap {
        padding: 0 1.25rem;
        gap: 1rem;
    }

    .controls {
        gap: 0.4rem;
    }

    .page {
        padding: 1.25rem 0;
    }

    .wrap {
        padding: 0 1.25rem;
    }

    .footer__top {
        grid-template-columns: 1fr 1fr;
        gap: 1.75rem;
        padding: 2rem 0 1.5rem;
    }

    .footer__brand-col {
        grid-column: 1 / -1;
    }

    .footer__wrap {
        padding: 0 1.25rem;
    }

    .footer__bottom {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .footer__top {
        grid-template-columns: 1fr;
    }

    .brand__name {
        font-size: 0.95rem;
    }
}
</style>