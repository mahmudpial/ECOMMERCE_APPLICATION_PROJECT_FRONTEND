<template>
    <AdminMaster>
        <div>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i class="fas fa-shopping-cart me-2 text-primary"></i>
                    Order Management
                </h2>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <label class="form-label">Search Order ID</label>
                            <input type="text" class="form-control" placeholder="Search by order ID..."
                                v-model="searchKeyword">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" v-model="selectedStatus">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <button class="btn btn-outline-primary w-100" @click="searchOrders">
                                <i class="fas fa-search me-1"></i>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-body p-0">
                    <div class="text-center p-5" v-if="isLoading">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-2">Loading...</p>
                    </div>

                    <table class="table table-hover mb-0" v-if="!isLoading && orders.length > 0">
                        <thead class="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style="width: 100px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" :key="order.id">
                                <td>#{{ order.id }}</td>
                                <td>{{ order.customer_name }}</td>
                                <td>৳ {{ order.total }}</td>
                                <td>
                                    <span :class="getStatusBadge(order.status)">{{ order.status }}</span>
                                </td>
                                <td>{{ order.created_at }}</td>
                                <td>
                                    <button class="btn btn-sm btn-info">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="!isLoading && orders.length === 0" class="text-center text-muted py-4">
                        <i class="fas fa-database fa-2x mb-2 d-block"></i>
                        No orders found
                    </div>
                </div>
            </div>
        </div>
    </AdminMaster>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminMaster from '@/components/admin/AdminMaster.vue';

const orders = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')

const getStatusBadge = (status) => {
    const badges = {
        pending: 'badge bg-warning',
        processing: 'badge bg-info',
        shipped: 'badge bg-primary',
        delivered: 'badge bg-success'
    }
    return badges[status] || 'badge bg-secondary'
}

const loadOrders = async () => {
    isLoading.value = true
    try {
        // Add API call here
        orders.value = []
    } catch (error) {
        console.error('Orders loading error:', error)
    } finally {
        isLoading.value = false
    }
}

const searchOrders = async () => {
    isLoading.value = true
    try {
        // Add API call here
        orders.value = []
    } catch (error) {
        console.error('Search error:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadOrders()
})
</script>
