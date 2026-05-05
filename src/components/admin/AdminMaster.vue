<template>
    <div class="admin-layout" :class="{ dark: isDark }">

        <!-- TOP NAVBAR -->
        <header class="topbar">
            <div class="topbar-inner">

                <!-- LEFT -->
                <div class="left">
                    <button class="hamburger" @click="toggleSidebar">
                        <i class="fas fa-bars"></i>
                    </button>

                    <div class="brand">
                        <span class="logo">◆</span>
                        <span class="name">Commercia</span>
                    </div>
                </div>

                <!-- CENTER SEARCH -->
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input v-model="searchQuery" @keyup.enter="goSearch" placeholder="Search products, orders..." />
                </div>

                <!-- RIGHT -->
                <div class="right">
                    <!-- THEME -->
                    <button class="icon-btn" @click="toggleTheme">
                        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
                    </button>

                    <!-- USER -->
                    <div class="user-menu" @click="toggleUserMenu">
                        <div class="avatar">
                            {{ authStore?.displayName?.charAt(0) || 'A' }}
                        </div>
                        <span class="username">{{ authStore?.displayName || 'Admin' }}</span>

                        <div v-if="userMenuOpen" class="dropdown">
                            <button @click="handleLogout">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- BODY -->
        <div class="layout-body">

            <!-- SIDEBAR -->
            <aside class="sidebar" :class="{ collapsed, mobile: mobileOpen }">

                <nav>
                    <router-link to="/admin/dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span v-if="!collapsed">Dashboard</span>
                    </router-link>

                    <router-link to="/admin/product-manage">
                        <i class="fas fa-box"></i>
                        <span v-if="!collapsed">Products</span>
                    </router-link>

                    <router-link to="/admin/brands">
                        <i class="fas fa-gem"></i>
                        <span v-if="!collapsed">Brands</span>
                    </router-link>

                    <router-link to="/admin/categories">
                        <i class="fas fa-tags"></i>
                        <span v-if="!collapsed">Categories</span>
                    </router-link>

                    <router-link to="/admin/orders">
                        <i class="fas fa-shopping-cart"></i>
                        <span v-if="!collapsed">Orders</span>
                    </router-link>

                    <router-link to="/admin/users">
                        <i class="fas fa-users"></i>
                        <span v-if="!collapsed">Users</span>
                    </router-link>
                </nav>

                <button class="collapse-btn" @click="collapsed = !collapsed">
                    <i :class="collapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
                </button>
            </aside>

            <!-- OVERLAY -->
            <div v-if="mobileOpen" class="overlay" @click="mobileOpen = false"></div>

            <!-- Default slot from page wrappers; router-view for nested admin routes -->
            <main class="content">
                <router-view />
            </main>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isDark = ref(false)
const collapsed = ref(false)
const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const searchQuery = ref('')

// Close mobile menu on window resize
const handleResize = () => {
    if (window.innerWidth >= 768) {
        mobileOpen.value = false
    }
}

onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
        isDark.value = true
    }
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

const toggleSidebar = () => {
    if (window.innerWidth < 768) {
        mobileOpen.value = !mobileOpen.value
    } else {
        collapsed.value = !collapsed.value
    }
}

const toggleTheme = () => {
    isDark.value = !isDark.value
    // Optional: persist preference in localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleUserMenu = () => {
    userMenuOpen.value = !userMenuOpen.value
}

const goSearch = () => {
    if (!searchQuery.value.trim()) return
    router.push({ path: '/admin/product-manage', query: { search: searchQuery.value } })
}

const handleLogout = async () => {
    if (authStore && authStore.logout) {
        await authStore.logout()
    }
    router.push('/admin/login')
}
</script>

<style scoped>
/* ROOT */
.admin-layout {
    --bg: #f6f8fb;
    --card: #ffffff;
    --text: #1e293b;
    --muted: #64748b;
    --primary: #2563eb;
    --border: #e5e7eb;

    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
    color: var(--text);
}

/* DARK MODE */
.admin-layout.dark {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --border: #334155;
}

/* TOPBAR */
.topbar {
    height: 64px;
    background: var(--card);
    border-bottom: 1px solid var(--border, #e5e7eb);
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.topbar-inner {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 20px;
}

.left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.hamburger {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text);
}

.brand {
    display: flex;
    gap: 6px;
    font-weight: 700;
}

.logo {
    color: var(--primary);
}

/* SEARCH */
.search-box {
    margin: 0 auto;
    display: flex;
    align-items: center;
    background: var(--bg);
    padding: 6px 12px;
    border-radius: 8px;
    width: 300px;
}

.search-box input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 8px;
    width: 100%;
    color: var(--text);
}

/* RIGHT */
.right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-btn {
    background: var(--bg);
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text);
}

/* USER */
.user-menu {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    position: relative;
}

.avatar {
    background: var(--primary);
    color: #fff;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.dropdown {
    position: absolute;
    right: 0;
    top: 45px;
    background: var(--card);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.dropdown button {
    border: none;
    background: none;
    padding: 10px 16px;
    width: 100%;
    text-align: left;
    cursor: pointer;
    color: var(--text);
    white-space: nowrap;
}

.dropdown button:hover {
    background: var(--bg);
}

/* BODY */
.layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* SIDEBAR */
.sidebar {
    width: 240px;
    background: var(--card);
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-shrink: 0;
}

.sidebar.collapsed {
    width: 70px;
}

.sidebar nav {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 4px;
}

.sidebar a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text);
    transition: 0.2s;
}

.sidebar a:hover {
    background: var(--bg);
}

.sidebar a.router-link-active {
    background: var(--primary);
    color: white;
}

/* COLLAPSE BTN */
.collapse-btn {
    position: absolute;
    bottom: 20px;
    right: -12px;
    background: var(--card);
    border: 1px solid var(--muted);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text);
}

/* CONTENT */
.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: var(--bg);
}

/* MOBILE */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
}

@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        left: -100%;
        top: 64px;
        height: calc(100% - 64px);
        z-index: 50;
        transition: left 0.3s ease;
    }

    .sidebar.mobile {
        left: 0;
    }

    .search-box {
        display: none;
    }

    .collapse-btn {
        display: none;
    }
}
</style>