<template>
    <div>
        <h2 class="mb-4">
            <i class="fas fa-tachometer-alt me-2 text-primary"></i>
            Dashboard
        </h2>

        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">Total Orders</h6>
                                <h2 class="mb-0">{{ stats.total_orders || 0 }}</h2>
                            </div>
                            <i class="fas fa-shopping-cart fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">Total Users</h6>
                                <h2 class="mb-0">{{ stats.total_users || 0 }}</h2>
                            </div>
                            <i class="fas fa-users fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">Total Products</h6>
                                <h2 class="mb-0">{{ stats.total_products || 0 }}</h2>
                            </div>
                            <i class="fas fa-box fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title">Total Revenue</h6>
                                <h2 class="mb-0">৳{{ stats.total_revenue || 0 }}</h2>
                            </div>
                            <i class="fas fa-chart-line fa-2x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mt-3">
            <div class="card-header bg-white">
                <h5 class="mb-0">
                    <i class="fas fa-clock me-2 text-primary"></i>
                    Recent Orders
                </h5>
            </div>
            <div class="card-body p-0">
                <div v-if="loading" class="text-center p-5">
                    <div class="spinner-border text-primary"></div>
                </div>

                <div v-else-if="recentOrders.length === 0" class="text-center p-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2"></i>
                    <p>No orders found</p>
                </div>

                <table v-else class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in recentOrders" :key="order.id">
                            <td>#{{ order.order_number }}</td>
                            <td>{{ order.customer_name }}</td>
                            <td>৳{{ order.total }}</td>
                            <td>
                                <span :class="getStatusClass(order.order_status)">
                                    {{ getStatusText(order.order_status) }}
                                </span>
                            </td>
                            <td>{{ formatDate(order.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

// State Variables
const stats = ref({
    total_orders: 0,
    total_users: 0,
    total_products: 0,
    total_revenue: 0
})
const recentOrders = ref([])
const loading = ref(true)

// Get CSS class based on status
const getStatusClass = (status) => {
    const classes = {
        pending: 'badge bg-warning',
        processing: 'badge bg-info',
        shipped: 'badge bg-primary',
        delivered: 'badge bg-success',
        cancelled: 'badge bg-danger'
    }
    return classes[status] || 'badge bg-secondary'
}

// Get readable text based on status
const getStatusText = (status) => {
    const texts = {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
    }
    return texts[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

// Date formatter
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// Load Dashboard Data from endpoints that exist in this backend.
const loadDashboardData = async () => {
    loading.value = true

    try {
        const productsRes = await api.get('products?page=1')
        const productsData = productsRes.data

        stats.value = {
            ...stats.value,
            total_products: productsData.total || productsData.data?.length || 0,
        }

        // This backend does not expose order summary endpoints yet.
        recentOrders.value = []
    } catch (error) {
        console.error('Dashboard data load error:', error)
    } finally {
        loading.value = false
    }
}

// Fetch data on component mount
onMounted(() => {
    loadDashboardData()
})
</script>
