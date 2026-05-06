<template>
    <div class="dashboard">

        <!-- HEADER -->
        <div class="header">
            <div>
                <h1>Dashboard</h1>
                <p>Overview of your store performance</p>
            </div>
            <div class="date">
                {{ today }}
            </div>
        </div>

        <!-- STATS -->
        <div class="stats">
            <div v-for="card in statCards" :key="card.label" class="stat-card">
                <div class="stat-top">
                    <span>{{ card.label }}</span>
                    <i :class="card.icon"></i>
                </div>
                <h2>{{ card.value }}</h2>
            </div>
        </div>

        <!-- TABLES -->
        <div class="grid">

            <!-- Recent Orders -->
            <div class="panel">
                <div class="panel-header">
                    <h3>Recent Orders</h3>
                </div>
                <div v-if="loading" class="empty">Loading...</div>
                <div class="table-responsive" v-else>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in recentOrders" :key="order.id">
                                <td>#{{ order.order_number }}</td>
                                <td>{{ order.customer_name }}</td>
                                <td>৳{{ order.total }}</td>
                                <td><span :class="statusClass(order.order_status)">{{ order.order_status }}</span></td>
                                <td>{{ formatDate(order.created_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Top Products -->
            <div class="panel">
                <div class="panel-header">
                    <h3>Top Products</h3>
                </div>
                <div v-if="loading" class="empty">Loading...</div>
                <div class="table-responsive" v-else>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Views</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in topProducts" :key="product.id">
                                <td>{{ product.name }}</td>
                                <td>{{ product.brand?.name || '-' }}</td>
                                <td>{{ product.view_count }}</td>
                                <td><span :class="product.is_active ? 'badge success' : 'badge'">{{ product.is_active ?
                                    'Active' : 'Inactive' }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'

const loading = ref(true)
const dashboard = ref({})
const recentOrders = ref([])
const topProducts = ref([])

const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
})

const statCards = computed(() => [
    { label: 'Orders', value: dashboard.value?.sales?.orders || 0, icon: 'fas fa-shopping-cart' },
    { label: 'Users', value: dashboard.value?.people?.users || 0, icon: 'fas fa-users' },
    { label: 'Products', value: dashboard.value?.catalog?.products || 0, icon: 'fas fa-box' },
    { label: 'Revenue', value: `৳${dashboard.value?.sales?.revenue || 0}`, icon: 'fas fa-chart-line' }
])

const statusClass = (status) => {
    const map = {
        pending: 'badge warning',
        processing: 'badge info',
        shipped: 'badge primary',
        delivered: 'badge success',
        cancelled: 'badge danger'
    }
    return map[status] || 'badge'
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const load = async () => {
    loading.value = true
    try {
        const { data } = await api.get('admin/dashboard')
        dashboard.value = data
        recentOrders.value = data.recent_orders || []
        topProducts.value = data.top_products || []
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.header h1 {
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
}

.header p {
    color: var(--muted);
    font-size: 13px;
}

.date {
    font-size: 13px;
    background: var(--bg);
    padding: 6px 10px;
    border-radius: 6px;
    color: var(--text);
}

.stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
}

.stat-top {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--muted);
}

.stat-card h2 {
    margin-top: 8px;
    font-size: 22px;
    color: var(--text);
}

.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
}

.panel-header {
    padding: 14px;
    border-bottom: 1px solid var(--border);
}

.panel-header h3 {
    font-size: 15px;
    color: var(--text);
}

.table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.table {
    width: 100%;
    border-collapse: collapse;
    min-width: 500px;
}

.table th {
    text-align: left;
    font-size: 12px;
    color: var(--muted);
    padding: 10px;
    background-color: var(--card);
}

.table td {
    padding: 10px;
    border-top: 1px solid var(--border);
    color: var(--text);
    background-color: var(--card);
}



.empty {
    padding: 40px;
    text-align: center;
    color: var(--muted);
}

@media (max-width: 1024px) {
    .stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
}

@media (max-width: 768px) {
    .dashboard {
        gap: 16px;
    }

    .header {
        flex-direction: column;
        align-items: stretch;
    }

    .stats {
        grid-template-columns: 1fr;
    }

    .grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .table th,
    .table td {
        padding: 8px 6px;
        font-size: 12px;
    }

    .badge {
        font-size: 10px;
        padding: 2px 6px;
    }

    .stat-card h2 {
        font-size: 18px;
    }
}
</style>