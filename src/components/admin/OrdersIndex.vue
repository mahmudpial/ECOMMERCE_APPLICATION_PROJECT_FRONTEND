<template>
    <div class="orders-index">
        <!-- Header: responsive stack on mobile -->
        <div class="header">
            <div>
                <h2>
                    <i class="fas fa-shopping-cart me-2 text-primary"></i>
                    Order Management
                </h2>
                <p>Manage customer orders</p>
            </div>
        </div>

        <!-- Search & Filter Card (responsive grid) -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label class="form-label">Search Order ID</label>
                        <input type="text" class="form-control" placeholder="Search by order ID..."
                            v-model="searchKeyword">
                    </div>
                    <div class="filter-item">
                        <label class="form-label">Status</label>
                        <select class="form-select" v-model="selectedStatus">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="filter-item filter-button">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-primary w-100" @click="searchOrders">
                            <i class="fas fa-search me-1"></i>
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Orders Table Card -->
        <div class="card">
            <div class="card-body p-0">
                <div class="text-center p-5" v-if="isLoading">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading...</p>
                </div>

                <div class="table-responsive" v-if="!isLoading && orders.length > 0">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style="width: 80px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" :key="order.id">
                                <td>#{{ order.id }}</td>
                                <td>{{ order.customer_name }}</td>
                                <td>৳ {{ order.total }}</td>
                                <td>
                                    <span :class="getStatusBadge(order.status || order.order_status)">
                                        {{ order.status || order.order_status }}
                                    </span>
                                </td>
                                <td>{{ formatDate(order.created_at) }}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info" @click="openOrderDetail(order)"
                                        title="View details">
                                        <i class="fas fa-eye"></i>
                                        <span class="d-none d-md-inline ms-1">View</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="!isLoading && orders.length === 0" class="text-center py-4 text-muted">
                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                    No orders found
                </div>

                <!-- Pagination -->
                <div v-if="!isLoading && orders.length > 0"
                    class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4 px-3 pb-3">
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

        <!-- Order Detail Modal (responsive) -->
        <div class="modal fade" id="orderDetailModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
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
                            <div class="col-12 col-md-6">
                                <div class="text-muted small">Order ID</div>
                                <div class="fw-semibold">#{{ selectedOrder.id }}</div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="text-muted small">Customer</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_name }}</div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="text-muted small">Phone</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_phone || '-' }}</div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="text-muted small">Email</div>
                                <div class="fw-semibold">{{ selectedOrder.customer_email || '-' }}</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-muted small">Subtotal</div>
                                <div class="fw-semibold">৳{{ selectedOrder.subtotal ?? '-' }}</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-muted small">Discount</div>
                                <div class="fw-semibold">৳{{ selectedOrder.discount ?? '0' }}</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-muted small">Total</div>
                                <div class="fw-semibold text-primary fs-5">৳{{ selectedOrder.total }}</div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="text-muted small">Payment Status</div>
                                <div class="fw-semibold">{{ selectedOrder.payment_status || '-' }}</div>
                            </div>
                            <div class="col-12 col-md-6">
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
const selectedOrder = ref(null)
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

// Status badge classes (light mode defaults, dark mode overrides provided in CSS)
const getStatusBadge = (status) => {
    const badges = {
        pending: 'badge bg-warning text-dark',
        processing: 'badge bg-info text-white',
        shipped: 'badge bg-primary text-white',
        delivered: 'badge bg-success text-white',
        cancelled: 'badge bg-danger text-white',
    }
    return badges[status] || 'badge bg-secondary text-white'
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

// Open order detail modal
const openOrderDetail = (order) => {
    selectedOrder.value = order
    const modalEl = document.getElementById('orderDetailModal')
    if (modalEl && window.bootstrap?.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show()
    }
}

// Load orders from API
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

const searchOrders = async () => await loadOrders(1)
const goToPage = async (page) => {
    if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) return
    await loadOrders(page)
}

// Visible page numbers for pagination
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
        (item) => item !== '...' || rangeWithDots.indexOf(item) === rangeWithDots.lastIndexOf(item)
    )
})

onMounted(() => {
    loadOrders()
})
</script>

<style scoped>
/* ===== LAYOUT ===== */
.orders-index {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* ===== HEADER ===== */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.header h2 {
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
}

.header p {
    color: var(--muted);
    font-size: 13px;
    margin: 4px 0 0;
}

/* ===== FILTER GRID (responsive) ===== */
.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
}

.filter-item label {
    margin-bottom: 0.25rem;
    color: var(--text);
}

.filter-button {
    display: flex;
    flex-direction: column;
}

/* ===== TABLE ===== */
.table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.table {
    min-width: 700px;
    width: 100%;
    border-collapse: collapse;
}

.table th {
    text-align: left;
    font-size: 12px;
    color: var(--muted);
    padding: 12px 10px;
    background-color: var(--card);
}

.table td {
    padding: 10px;
    border-top: 1px solid var(--border);
    color: var(--text);
    background-color: var(--card);
}

/* Badges (light mode) – Bootstrap colour classes are used, but we add dark overrides */
.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
}

/* Dark mode overrides for badges */
.dark .badge.bg-warning {
    background-color: #f59e0b !important;
    color: #1e293b !important;
}

.dark .badge.bg-info {
    background-color: #0ea5e9 !important;
    color: white;
}

.dark .badge.bg-primary {
    background-color: #3b82f6 !important;
    color: white;
}

.dark .badge.bg-success {
    background-color: #10b981 !important;
    color: white;
}

.dark .badge.bg-danger {
    background-color: #ef4444 !important;
    color: white;
}

.dark .badge.bg-secondary {
    background-color: #475569 !important;
    color: white;
}

/* Action buttons */
.btn-sm {
    min-width: 64px;
}

.btn-sm i {
    margin-right: 0.25rem;
}

/* ===== RESPONSIVE MOBILE ===== */
@media (max-width: 768px) {
    .orders-index {
        gap: 16px;
    }

    .header {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-grid {
        grid-template-columns: 1fr;
    }

    .filter-button {
        margin-top: 0;
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

    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        min-width: auto;
    }

    .btn-sm .d-none.d-md-inline {
        display: none !important;
    }

    .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
    }
}
</style>