<template>
    <div class="customer-layout" :class="{ dark: isDark }">
        <!-- Mobile overlay (closes drawer when clicked) -->
        <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>

        <header class="header">
            <div class="container">
                <div class="logo">
                    <router-link to="/">Commercia</router-link>
                </div>

                <!-- Desktop navigation -->
                <nav class="nav-desktop">
                    <router-link to="/" class="nav-link">Home</router-link>
                    <router-link to="/products" class="nav-link">Shop</router-link>
                    <router-link to="/cart" class="nav-link cart-link">
                        <i class="fas fa-shopping-cart"></i>
                        <span v-if="cartCount" class="cart-badge">{{ cartCount }}</span>
                    </router-link>
                    <div v-if="isLoggedIn" class="user-menu" @click="toggleUserMenu" @blur="closeUserMenu" tabindex="0">
                        <div class="user-avatar">{{ userInitial }}</div>
                        <span class="user-name">{{ user?.name || 'Account' }}</span>
                        <i class="fas fa-chevron-down" :class="{ rotated: userMenuOpen }"></i>
                        <div v-if="userMenuOpen" class="dropdown">
                            <router-link to="/profile" class="dropdown-item"><i class="fas fa-user"></i>
                                Profile</router-link>
                            <router-link to="/orders" class="dropdown-item"><i class="fas fa-box"></i>
                                Orders</router-link>
                            <div class="dropdown-divider"></div>
                            <button @click="logout" class="dropdown-item logout-btn"><i class="fas fa-sign-out-alt"></i>
                                Logout</button>
                        </div>
                    </div>
                    <router-link v-else to="/login" class="nav-link login-btn">Login</router-link>
                    <button class="theme-toggle" @click="toggleTheme">
                        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                    </button>
                </nav>

                <!-- Mobile menu button -->
                <button class="mobile-menu-btn" @click="toggleMobileMenu">
                    <i class="fas" :class="mobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
                </button>

                <!-- Mobile drawer (always present, animated) -->
                <div class="nav-mobile" :class="{ open: mobileMenuOpen }">
                    <button class="close-drawer" @click="closeMobileMenu"><i class="fas fa-times"></i></button>
                    <router-link to="/" class="nav-link" @click.native="closeMobileMenu">Home</router-link>
                    <router-link to="/products" class="nav-link" @click.native="closeMobileMenu">Shop</router-link>
                    <router-link to="/cart" class="nav-link cart-link" @click.native="closeMobileMenu">
                        <i class="fas fa-shopping-cart"></i> Cart
                        <span v-if="cartCount" class="cart-badge-mobile">{{ cartCount }}</span>
                    </router-link>
                    <div v-if="isLoggedIn">
                        <div class="mobile-user-info">
                            <div class="user-avatar">{{ userInitial }}</div>
                            <span>{{ user?.name }}</span>
                        </div>
                        <router-link to="/profile" class="nav-link" @click.native="closeMobileMenu"><i
                                class="fas fa-user"></i> Profile</router-link>
                        <router-link to="/orders" class="nav-link" @click.native="closeMobileMenu"><i
                                class="fas fa-box"></i> Orders</router-link>
                        <button @click="logout" class="nav-link logout-mobile" @click.native="closeMobileMenu"><i
                                class="fas fa-sign-out-alt"></i> Logout</button>
                    </div>
                    <router-link v-else to="/login" class="nav-link" @click.native="closeMobileMenu"><i
                            class="fas fa-sign-in-alt"></i> Login</router-link>
                    <div class="mobile-theme-toggle">
                        <button class="theme-toggle" @click="toggleTheme">
                            <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="main">
            <div class="container main-container"><router-view /></div>
        </main>

        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-section">
                        <h4>Commercia</h4>
                        <p>Your one-stop shop for quality products at unbeatable prices.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                        </div>
                    </div>
                    <div class="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><router-link to="/">Home</router-link></li>
                            <li><router-link to="/products">Shop</router-link></li>
                            <li><router-link to="/cart">Cart</router-link></li>
                            <li v-if="!isLoggedIn"><router-link to="/login">Login</router-link></li>
                            <li v-if="isLoggedIn"><router-link to="/profile">My Account</router-link></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Contact Us</h4>
                        <ul>
                            <li><i class="fas fa-phone"></i> +880 1234 567890</li>
                            <li><i class="fas fa-envelope"></i> support@commercia.com</li>
                            <li><i class="fas fa-map-marker-alt"></i> Dhaka, Bangladesh</li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; {{ year }} Commercia. All rights reserved.</p>
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

const isDark = ref(false)
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const year = new Date().getFullYear()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const cartCount = computed(() => cartStore.totalItems)
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'U')

const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('customerTheme', isDark.value ? 'dark' : 'light')
    if (isDark.value) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
}

const toggleUserMenu = () => { userMenuOpen.value = !userMenuOpen.value }
const closeUserMenu = () => { setTimeout(() => userMenuOpen.value = false, 200) }

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
    document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
    document.body.style.overflow = ''
}

const logout = async () => {
    await authStore.logout()
    closeMobileMenu()
    router.push('/')
}

const handleResize = () => {
    if (window.innerWidth > 768 && mobileMenuOpen.value) closeMobileMenu()
}

onMounted(() => {
    const savedTheme = localStorage.getItem('customerTheme')
    if (savedTheme === 'dark') { isDark.value = true; document.documentElement.classList.add('dark') }
    authStore.loadUser()
    cartStore.loadCart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.body.style.overflow = ''
})
</script>

<style scoped>
/* ========== CSS Variables ========== */
.customer-layout {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --text-muted: #64748b;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --border: #e2e8f0;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
}

.customer-layout.dark {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --border: #334155;
    --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

/* ========== Header ========== */
.header {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow);
}

.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 70px;
}

.logo a {
    font-weight: 800;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--primary), #8b5cf6);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    text-decoration: none;
    letter-spacing: -0.5px;
}

.nav-desktop {
    display: flex;
    align-items: center;
    gap: 1.75rem;
}

.nav-link {
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    padding: 0.5rem 0;
    position: relative;
}

.nav-link:hover {
    color: var(--primary);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: width 0.2s;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
    width: 100%;
}

.cart-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -12px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.7rem;
    font-weight: 600;
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    position: relative;
    padding: 0.5rem 0.75rem;
    border-radius: 2rem;
    background: var(--bg);
    transition: 0.2s;
}

.user-menu:hover {
    background: rgba(59, 130, 246, 0.1);
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--primary), #8b5cf6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
}

.user-name {
    font-weight: 500;
    font-size: 0.9rem;
}

.user-menu i.fa-chevron-down {
    font-size: 0.7rem;
    transition: transform 0.2s;
}

.user-menu i.rotated {
    transform: rotate(180deg);
}

.dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    z-index: 50;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text);
    text-decoration: none;
    font-size: 0.9rem;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
}

.dropdown-item:hover {
    background: var(--bg);
}

.dropdown-divider {
    height: 1px;
    background: var(--border);
    margin: 0.25rem 0;
}

.logout-btn {
    color: #ef4444;
}

.logout-btn i {
    color: #ef4444;
}

.login-btn {
    background: var(--primary);
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 2rem;
}

.login-btn:hover {
    background: var(--primary-hover);
    color: white;
}

.login-btn::after {
    display: none;
}

.theme-toggle {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2rem;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text);
}

.theme-toggle:hover {
    background: var(--border);
}

/* ========== Mobile Menu ========== */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text);
    padding: 0.5rem;
}

.mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 150;
}

.nav-mobile {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background: var(--card);
    z-index: 200;
    padding: 1rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
}

.nav-mobile.open {
    transform: translateX(0);
}

.close-drawer {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    color: var(--text);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
}

.nav-mobile .nav-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    font-size: 1rem;
    border-bottom: 1px solid var(--border);
}

.nav-mobile .nav-link::after {
    display: none;
}

.cart-badge-mobile {
    background: var(--primary);
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.7rem;
    margin-left: 0.5rem;
}

.mobile-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.5rem;
}

.mobile-user-info .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1rem;
}

.mobile-theme-toggle {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.mobile-theme-toggle .theme-toggle {
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
}

.logout-mobile {
    color: #ef4444;
}

.logout-mobile i {
    color: #ef4444;
}

/* ========== Main & Footer ========== */
.main {
    flex: 1;
    padding: 2rem 0;
}

.main-container {
    padding: 0 1.5rem;
}

.footer {
    background: var(--card);
    border-top: 1px solid var(--border);
    margin-top: auto;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 3rem 0 2rem;
}

.footer-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text);
}

.footer-section p {
    color: var(--text-muted);
    line-height: 1.5;
}

.footer-section ul {
    list-style: none;
    padding: 0;
}

.footer-section ul li {
    margin-bottom: 0.5rem;
    color: var(--text-muted);
}

.footer-section ul li i {
    width: 25px;
    color: var(--primary);
}

.footer-section a {
    color: var(--text-muted);
    text-decoration: none;
}

.footer-section a:hover {
    color: var(--primary);
}

.social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.social-links a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--bg);
    border-radius: 50%;
    color: var(--text);
    transition: 0.2s;
}

.social-links a:hover {
    background: var(--primary);
    color: white;
}

.footer-bottom {
    text-align: center;
    padding: 1.5rem 0;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.85rem;
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
    .nav-desktop {
        display: none;
    }

    .mobile-menu-btn {
        display: block;
    }

    .header .container {
        padding: 0 1rem;
        min-height: 60px;
    }

    .main {
        padding: 1rem 0;
    }

    .main-container {
        padding: 0 1rem;
    }

    .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 1.5rem;
        padding: 2rem 0;
    }

    .footer-section .social-links {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .logo a {
        font-size: 1.2rem;
    }

    .user-name {
        display: none;
    }

    .user-menu {
        padding: 0.25rem;
    }
}
</style>
<style>
.dark {
    color-scheme: dark;
}
</style>