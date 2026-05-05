<template>

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
                            <td>{{ formatDate(order.created_at) }}</td>
                            <td>
                                <!-- FIX: view button had no @click handler — completely non-functional -->
                                <button class="btn btn-sm btn-info" @click="openOrderDetail(order)"
                                    title="View order details">
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

                <!-- Pagination -->
                <div v-if="!isLoading && orders.length > 0"
                    class="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                    <div class="text-muted small">
                        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} orders
                    </div>
                    <nav>
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                                <button class="page-link" @click="goToPage(pagination.current_page - 1)"
                                    :disabled="pagination.current_page <= 1">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </li>
                            <li v-for="page in visiblePages" :key="page" class="page-item"
                                :class="{ active: page === pagination.current_page }">
                                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                            </li>
                            <li class="page-item"
                                :class="{ disabled: pagination.current_page >= pagination.last_page }">
                                <button class="page-link" @click="goToPage(pagination.current_page + 1)"
                                    :disabled="pagination.current_page >= pagination.last_page">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- FIX: Order Detail Modal — was missing entirely, making the view button useless -->
        <div class="modal fade" id="orderDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt me-2"></i>
                            Order Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="selectedOrder">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="text-muted small">Order ID</div>
                                <div class="fw-semibold">#{{ selectedOrder.id }}</div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-muted small">Customer</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_name }}</div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-muted small">Phone</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_phone || '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-muted small">Email</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_email || '-' }}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small">Subtotal</div>
                                <div class="fw-semibold">৳{{ selectedOrder.subtotal ?? '-' }}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small">Discount</div>
                                <div class="fw-semibold">৳{{ selectedOrder.discount ?? '0' }}</div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-muted small">Total</div>
                                <div class="fw-semibold text-primary fs-5">৳{{ selectedOrder.total }}</div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-muted small">Payment Status</div>
                                <div class="fw-semibold">{{ selectedOrder.payment_status || '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-muted small">Order Status</div>
                                <span :class="getStatusBadge(selectedOrder.status || selectedOrder.order_status)">
                                    {{ selectedOrder.status || selectedOrder.order_status }}
                                </span>
                            </div>
                            <div class="col-12">
                                <div class="text-muted small">Date</div>
                                <div class="fw-semibold">{{ formatDate(selectedOrder.created_at) }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'

const orders = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
// FIX: added selectedOrder ref for the detail modal
const selectedOrder = ref(null)
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

const getStatusBadge = (status) => {
    const badges = {
        pending: 'badge bg-warning text-dark',
        processing: 'badge bg-info',
        shipped: 'badge bg-primary',
        delivered: 'badge bg-success',
        cancelled: 'badge bg-danger',
    }
    return badges[status] || 'badge bg-secondary'
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

// FIX: handler for the view button — opens the detail modal
const openOrderDetail = (order) => {
    selectedOrder.value = order
    const modalEl = document.getElementById('orderDetailModal')
    if (modalEl && window.bootstrap?.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show()
    }
}

const loadOrders = async (page = 1) => {
    isLoading.value = true
    try {
        const params = { page }
        if (searchKeyword.value) params.search = searchKeyword.value
        if (selectedStatus.value) params.status = selectedStatus.value

        const response = await api.get('admin/orders', { params })
        orders.value = response.data.data || response.data || []
        pagination.value = {
            current_page: response.data.meta?.current_page || response.data.current_page || page,
            last_page: response.data.meta?.last_page || response.data.last_page || 1,
            from: response.data.meta?.from || response.data.from || 0,
            to: response.data.meta?.to || response.data.to || orders.value.length,
            total: response.data.meta?.total || response.data.total || orders.value.length,
            per_page: response.data.meta?.per_page || response.data.per_page || 20,
        }
    } catch (error) {
        console.error('Orders loading error:', error)
        orders.value = []
    } finally {
        isLoading.value = false
    }
}

const searchOrders = async () => {
    await loadOrders(1)
}

const goToPage = async (page) => {
    if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) return
    await loadOrders(page)
}

const visiblePages = computed(() => {
    const current = pagination.value.current_page
    const last = pagination.value.last_page
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
        range.push(i)
    }

    if (current - delta > 2) {
        rangeWithDots.push(1, '...')
    } else {
        rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < last - 1) {
        rangeWithDots.push('...', last)
    } else if (last > 1) {
        rangeWithDots.push(last)
    }

    return rangeWithDots.filter(
        (item) => item !== '...' || rangeWithDots.indexOf(item) === rangeWithDots.lastIndexOf(item),
    )
})

onMounted(() => {
    loadOrders()
})
</script>