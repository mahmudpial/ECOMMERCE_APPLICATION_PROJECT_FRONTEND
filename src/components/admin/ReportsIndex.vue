<template>
    <div class="reports">
        <h2>Business Reports</h2>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'sales' }"
                    @click="activeTab = 'sales'">Sales</button></li>
            <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'products' }"
                    @click="activeTab = 'products'">Top Products</button></li>
            <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'customers' }"
                    @click="activeTab = 'customers'">Top Customers</button></li>
            <li class="nav-item"><button class="nav-link" :class="{ active: activeTab === 'orders' }"
                    @click="activeTab = 'orders'">Orders</button></li>
        </ul>

        <!-- Sales Report -->
        <div v-if="activeTab === 'sales'">
            <div class="row mb-3">
                <div class="col-md-3">
                    <select v-model="salesPeriod" class="form-select" @change="fetchSalesReport">
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <input type="date" v-model="salesDate" class="form-control" @change="fetchSalesReport">
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="card p-3">Total Orders: {{ salesReport.total_orders }}</div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3">Revenue: ৳{{ salesReport.total_revenue }}</div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3">Avg Order: ৳{{ salesReport.avg_order_value }}</div>
                </div>
            </div>
            <canvas ref="salesChart" class="mt-4"></canvas>
        </div>

        <!-- Top Products -->
        <div v-if="activeTab === 'products'">
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Sold</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in topProducts" :key="p.id">
                        <td>{{ p.name }}</td>
                        <td>{{ p.total_sold }}</td>
                        <td>৳{{ p.revenue }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Top Customers -->
        <div v-if="activeTab === 'customers'">
            <table class="table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Orders</th>
                        <th>Spent</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in topCustomers" :key="c.id">
                        <td>{{ c.name }}</td>
                        <td>{{ c.total_orders }}</td>
                        <td>৳{{ c.total_spent }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Orders List -->
        <div v-if="activeTab === 'orders'">
            <div class="mb-3">
                <select v-model="orderStatusFilter" class="form-select w-auto d-inline-block" @change="fetchOrders">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>
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
                    <tr v-for="order in orders" :key="order.id">
                        <td>#{{ order.id }}</td>
                        <td>{{ order.user?.name }}</td>
                        <td>৳{{ order.total }}</td>
                        <td>{{ order.order_status }}</td>
                        <td>{{ formatDate(order.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
            <Pagination :data="ordersPagination" @pagination-change-page="fetchOrders" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/utils/axios'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const activeTab = ref('sales')
const salesPeriod = ref('daily')
const salesDate = ref(new Date().toISOString().slice(0, 10))
const salesReport = ref({})
const salesChart = ref(null)
let chartInstance = null

const topProducts = ref([])
const topCustomers = ref([])
const orders = ref([])
const ordersPagination = ref({})
const orderStatusFilter = ref('')

const fetchSalesReport = async () => {
    const { data } = await api.get('reports/sales', { params: { period: salesPeriod.value, date: salesDate.value } })
    salesReport.value = data
    renderChart(data.trend)
}
const renderChart = (trend) => {
    if (chartInstance) chartInstance.destroy()
    const ctx = salesChart.value.getContext('2d')
    const labels = trend.map(t => t.date || t.month)
    const revenues = trend.map(t => t.revenue)
    chartInstance = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: 'Revenue', data: revenues, backgroundColor: '#3b82f6' }] } })
}
const fetchTopProducts = async () => {
    const { data } = await api.get('reports/products', { params: { limit: 10 } })
    topProducts.value = data
}
const fetchTopCustomers = async () => {
    const { data } = await api.get('reports/customers')
    topCustomers.value = data
}
const fetchOrders = async (page = 1) => {
    const { data } = await api.get('reports/orders', { params: { page, status: orderStatusFilter.value } })
    orders.value = data.data
    ordersPagination.value = data
}
const formatDate = (d) => new Date(d).toLocaleDateString()

watch(activeTab, (tab) => {
    if (tab === 'sales') fetchSalesReport()
    if (tab === 'products') fetchTopProducts()
    if (tab === 'customers') fetchTopCustomers()
    if (tab === 'orders') fetchOrders()
})
onMounted(() => {
    fetchSalesReport()
})
</script>