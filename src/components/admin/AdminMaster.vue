<template>
    <div class="container-fluid p-0">

        <nav class="navbar navbar-dark bg-dark px-3">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-store me-2"></i>
                    Ecommerce Admin
                </a>

                <div class="d-flex">
                    <span class="navbar-text text-white me-3">
                        <i class="fas fa-user me-1"></i>
                        {{ authStore.displayName }}
                    </span>
                    <button @click="handleLogout" class="btn btn-outline-light btn-sm">
                        <i class="fas fa-sign-out-alt me-1"></i>
                        Logout
                    </button>
                </div>
            </div>
        </nav>

        <div class="row g-0 flex-column flex-md-row">

            <div class="col-12 col-md-2 bg-light admin-sidebar p-0 border-end">
                <div class="list-group list-group-flush">
                    <router-link to="/admin/dashboard" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-tachometer-alt me-2"></i>
                        Dashboard

                    </router-link>
                    <router-link to="/admin/product-manage" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-box me-2"></i>
                        Product

                    </router-link>
                    <router-link to="/admin/categories" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-tags me-2"></i>
                        Category

                    </router-link>
                    <router-link to="/admin/brands" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-trademark me-2"></i>
                        Brand

                    </router-link>
                    <router-link to="/admin/orders" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-shopping-cart me-2"></i>
                        Order

                    </router-link>
                    <router-link to="/admin/users" class="list-group-item list-group-item-action py-3">
                        <i class="fas fa-users me-2"></i>
                        User

                    </router-link>
                </div>
            </div>


            <div class="col-12 col-md-10 p-3 p-md-4">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()


const handleLogout = async () => {
    await authStore.logout()
    router.push('/admin/login')
}
</script>

<style scoped>
.admin-sidebar {
    min-height: auto;
}

@media (min-width: 768px) {
    .admin-sidebar {
        min-height: 100vh;
    }
}
</style>
