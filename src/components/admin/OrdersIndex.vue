<template>
    <div class="orders-index">
        <!-- Header: responsive stack on mobile -->
        <div class="header">
            <div>
                <h2>
                    <i class="fas fa-shopping-cart me-2 text-primary"></i>
                    Order Management
                </h2>
                <p>Track order numbers, customer contact details, payments, and status changes.</p>
            </div>
        </div>

        <div v-if="loadError" class="alert alert-danger mb-0">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ loadError }}
        </div>

        <!-- Search & Filter Card (responsive grid) -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label class="form-label">Search Order</label>
                        <input type="text" class="form-control"
                            placeholder="Search by order no, phone, or transaction..." v-model="searchKeyword">
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
                                <th>Order No.</th>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Payment</th>
                                <th>Transaction ID</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style="width: 120px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" :key="order.id">
                                <td>
                                    <div class="fw-semibold">#{{ order.order_number || order.id }}</div>
                                    <div class="text-muted small">ID {{ order.id }}</div>
                                </td>
                                <td>
                                    <div class="fw-semibold">{{ order.customer_name || '-' }}</div>
                                    <div class="text-muted small">{{ order.customer_email || '-' }}</div>
                                </td>
                                <td>{{ order.customer_phone || '-' }}</td>
                                <td>
                                    <span class="badge" :class="getPaymentBadge(order.payment_method)">
                                        {{ order.payment_label || order.payment_method || '-' }}
                                    </span>
                                </td>
                                <td>
                                    <code class="transaction-code">{{ order.transaction_id || '-' }}</code>
                                </td>
                                <td>৳ {{ formatMoney(order.total) }}</td>
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
                                        <span class="d-none d-md-inline ms-1">Manage</span>
                                    </button>
                                    <button class="btn btn-sm btn-success" @click="downloadInvoice(order.id)">
                                        <i class="fas fa-file-pdf"></i> Invoice
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
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-receipt me-2"></i>
                            Order Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="selectedOrder">
                        <div class="detail-loading" v-if="detailLoading">
                            <div class="spinner-border text-primary"></div>
                            <p class="mb-0 mt-3 text-muted">Refreshing order details...</p>
                        </div>

                        <div class="summary-grid">
                            <div class="summary-card">
                                <span class="summary-label">Order Number</span>
                                <strong>#{{ selectedOrder.order_number || selectedOrder.id }}</strong>
                                <small class="text-muted">Internal ID {{ selectedOrder.id }}</small>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Customer</span>
                                <strong>{{ selectedOrder.customer_name || '-' }}</strong>
                                <small class="text-muted">{{ selectedOrder.customer_email || '-' }}</small>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Phone</span>
                                <strong>{{ selectedOrder.customer_phone || '-' }}</strong>
                                <small class="text-muted">Customer contact number</small>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Payment Method</span>
                                <strong>{{ selectedOrder.payment_label || selectedOrder.payment_method || '-'
                                    }}</strong>
                                <small class="text-muted">Method used at checkout</small>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Transaction ID</span>
                                <strong class="transaction-code">{{ selectedOrder.transaction_id || '-' }}</strong>
                                <small class="text-muted">Gateway reference</small>
                            </div>
                            <div class="summary-card">
                                <span class="summary-label">Created</span>
                                <strong>{{ formatDate(selectedOrder.created_at) }}</strong>
                                <small class="text-muted">Last updated {{ formatDate(selectedOrder.updated_at)
                                    }}</small>
                            </div>
                        </div>

                        <div class="detail-panels">
                            <div class="detail-panel">
                                <div class="detail-panel-title">Payment & Status</div>
                                <div class="row g-3">
                                    <div class="col-12 col-md-4">
                                        <div class="text-muted small">Payment Status</div>
                                        <div class="fw-semibold">
                                            <span :class="getPaymentStateBadge(selectedOrder.payment_status)">
                                                {{ selectedOrder.payment_status || '-' }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-muted small">Order Status</div>
                                        <div class="fw-semibold">
                                            <span :class="getStatusBadge(currentOrderStatus)">
                                                {{ currentOrderStatus }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <label class="form-label mb-1">Update Status</label>
                                        <select v-model="editableStatus" class="form-select">
                                            <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                                                {{ item.label }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="detail-panel">
                                <div class="detail-panel-title">Order Summary</div>
                                <div class="row g-3">
                                    <div class="col-12 col-md-3">
                                        <div class="text-muted small">Subtotal</div>
                                        <div class="fw-semibold">৳{{ formatMoney(selectedOrder.subtotal) }}</div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="text-muted small">Shipping</div>
                                        <div class="fw-semibold">৳{{ formatMoney(selectedOrder.shipping_cost) }}</div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="text-muted small">Discount</div>
                                        <div class="fw-semibold">৳{{ formatMoney(selectedOrder.discount) }}</div>
                                    </div>
                                    <div class="col-12 col-md-3">
                                        <div class="text-muted small">Total</div>
                                        <div class="fw-semibold text-primary fs-5">৳{{ formatMoney(selectedOrder.total)
                                            }}</div>
                                    </div>
                                    <div class="col-12">
                                        <div class="text-muted small mb-1">Shipping Address</div>
                                        <div class="detail-box">{{ selectedOrder.shipping_address || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="detail-panel" v-if="selectedOrder.items && selectedOrder.items.length">
                            <div class="detail-panel-title">Order Items</div>
                            <div class="table-responsive modal-table">
                                <table class="table table-sm align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th class="text-end">Price</th>
                                            <th class="text-center">Qty</th>
                                            <th class="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in selectedOrder.items"
                                            :key="item.id || `${item.product_id}-${item.product_name}`">
                                            <td>
                                                <div class="fw-semibold">{{ item.product_name || item.name || '-' }}
                                                </div>
                                            </td>
                                            <td class="text-end">৳{{ formatMoney(item.price) }}</td>
                                            <td class="text-center">{{ item.quantity }}</td>
                                            <td class="text-end">৳{{ formatMoney(item.total) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveOrderStatus"
                            :disabled="savingStatus || detailLoading || !selectedOrder || editableStatus === currentOrderStatus">
                            <span v-if="savingStatus" class="spinner-border spinner-border-sm me-2"></span>
                            Save Status
                        </button>
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
const detailLoading = ref(false)
const savingStatus = ref(false)
const loadError = ref('')
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedOrder = ref(null)
const editableStatus = ref('pending')
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const currentOrderStatus = computed(() => selectedOrder.value?.status || selectedOrder.value?.order_status || 'pending')


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

const getPaymentStateBadge = (status) => {
    const value = String(status || '').toLowerCase()
    if (value === 'paid') return 'badge bg-success text-white'
    if (value === 'failed') return 'badge bg-danger text-white'
    if (value === 'refunded') return 'badge bg-secondary text-white'
    return 'badge bg-warning text-dark'
}

const getPaymentBadge = (method) => {
    const value = String(method || '').toLowerCase()
    const badges = {
        cod: 'bg-warning text-dark',
        bkash: 'bg-danger text-white',
        card: 'bg-primary text-white',
        sslcommerz: 'bg-info text-white',
    }
    return badges[value] || 'bg-secondary text-white'
}

const formatMoney = (value) => {
    const amount = Number(value ?? 0)
    return amount.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const getModal = (id) => {
    const element = document.getElementById(id)
    if (!element || !window.bootstrap?.Modal) return null
    return window.bootstrap.Modal.getOrCreateInstance(element)
}

const showToast = (message, type = 'success') => {
    const existing = document.querySelector('.app-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.className = `app-toast app-toast--${type}`
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}`
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '9999',
        minWidth: '300px',
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        opacity: '0',
        transform: 'translateX(110%)',
        transition: '0.3s',
        background:
            type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
    })

    document.body.appendChild(toast)
    setTimeout(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateX(0)'
    }, 10)

    setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(110%)'
        setTimeout(() => toast.remove(), 300)
    }, type === 'success' ? 3000 : 5000)
}

// Open order detail modal
const openOrderDetail = async (order) => {
    selectedOrder.value = { ...order }
    editableStatus.value = order.status || order.order_status || 'pending'
    getModal('orderDetailModal')?.show()
    detailLoading.value = true

    try {
        const { data } = await api.get(`admin/orders/${order.id}`)
        const detail = data.order || data.data || data

        if (detail) {
            selectedOrder.value = detail
            editableStatus.value = detail.status || detail.order_status || editableStatus.value
        }
    } catch (error) {
        console.error('Failed to load order detail:', error)
        showToast(error.response?.data?.message || 'Failed to load order details', 'error')
    } finally {
        detailLoading.value = false
    }
}

const saveOrderStatus = async () => {
    if (!selectedOrder.value) return

    if (editableStatus.value === currentOrderStatus.value) {
        return
    }

    savingStatus.value = true
    try {
        const { data } = await api.patch(`admin/orders/${selectedOrder.value.id}`, {
            order_status: editableStatus.value,
        })

        const updatedOrder = data.order || data.data || data
        if (updatedOrder) {
            selectedOrder.value = updatedOrder
            editableStatus.value = updatedOrder.status || updatedOrder.order_status || editableStatus.value
            orders.value = orders.value.map((item) =>
                item.id === updatedOrder.id
                    ? { ...item, ...updatedOrder }
                    : item,
            )
        }

        showToast('Order status updated')
        getModal('orderDetailModal')?.hide()
        await loadOrders(pagination.value.current_page)
    } catch (error) {
        console.error('Failed to update order status:', error)
        showToast(error.response?.data?.message || 'Failed to update order status', 'error')
    } finally {
        savingStatus.value = false
    }
}

// Load orders from API
const loadOrders = async (page = 1) => {
    isLoading.value = true
    loadError.value = ''
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
        loadError.value = error.response?.data?.message || 'Unable to load orders right now.'
        showToast(loadError.value, 'error')
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

// Download invoice PDF in a new tab
const downloadInvoice = (orderId) => {
    window.open(`/api/v1/admin/orders/${orderId}/invoice`, '_blank');
}

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

.transaction-code {
    font-size: 12px;
    white-space: nowrap;
}

.detail-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 0 12px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
}

.summary-card,
.detail-panel {
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--card);
    padding: 16px;
}

.summary-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.summary-label,
.detail-panel-title {
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
}

.detail-panels {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}

.detail-panel-title {
    margin-bottom: 12px;
}

.detail-box {
    border: 1px dashed var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.02);
    color: var(--text);
    line-height: 1.6;
}

.modal-table {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.modal-table .table {
    min-width: 100%;
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
    min-width: 1200px;
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

    .summary-grid {
        grid-template-columns: 1fr;
    }

    .detail-panels {
        grid-template-columns: 1fr;
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

    .detail-loading {
        padding-top: 12px;
    }
}
</style>
