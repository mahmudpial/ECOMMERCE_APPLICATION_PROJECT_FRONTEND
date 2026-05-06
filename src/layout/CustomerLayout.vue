<template>
    <div class="customer-layout" :class="{ dark: isDark }">
        <header class="header">
            <div class="container">
                <div class="logo">
                    <router-link to="/">Commercia</router-link>
                </div>
                <nav class="nav">
                    <router-link to="/products">Shop</router-link>
                    <router-link to="/cart" class="cart-link">
                        <i class="fas fa-shopping-cart"></i>
                        <span v-if="cartCount" class="cart-badge">{{ cartCount }}</span>
                    </router-link>
                    <div v-if="isLoggedIn" class="user-menu" @click="toggleUserMenu">
                        <span>{{ user?.name || 'Account' }}</span>
                        <div v-if="userMenuOpen" class="dropdown">
                            <router-link to="/profile">Profile</router-link>
                            <router-link to="/orders">Orders</router-link>
                            <button @click="logout">Logout</button>
                        </div>
                    </div>
                    <router-link v-else to="/login">Login</router-link>
                    <button class="theme-toggle" @click="toggleTheme">
                        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                    </button>
                </nav>
            </div>
        </header>

        <main class="main">
            <router-view />
        </main>

        <footer class="footer">
            <div class="container">
                <p>&copy; {{ year }} Commercia. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useCustomerAuthStore()
const cartStore = useCartStore()

const isDark = ref(false)
const userMenuOpen = ref(false)

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const cartCount = computed(() => cartStore.totalItems)

const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('customerTheme', isDark.value ? 'dark' : 'light')
}
const toggleUserMenu = () => { userMenuOpen.value = !userMenuOpen.value }
const logout = async () => {
    await authStore.logout()
    router.push('/')
}
onMounted(() => {
    const savedTheme = localStorage.getItem('customerTheme')
    if (savedTheme === 'dark') isDark.value = true
    authStore.loadUser()
    cartStore.loadCart()
})
</script>

<style scoped>
/* similar to AdminMaster but lighter, with CSS variables */
.customer-layout {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --primary: #3b82f6;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.customer-layout.dark {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #e2e8f0;
}

.header {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.logo a {
    font-weight: bold;
    font-size: 1.5rem;
    color: var(--primary);
}

.nav {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.cart-link {
    position: relative;
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
}

.main {
    flex: 1;
    padding: 2rem 1rem;
}

.footer {
    background: var(--card);
    border-top: 1px solid var(--border);
    text-align: center;
    padding: 1rem;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
        gap: 1rem;
    }

    .nav {
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>