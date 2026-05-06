<template>
    <div class="product-index">
        <!-- Header: responsive stack on mobile -->
        <div class="header">
            <div style="text-align: justify;">
                <h2>
                    <i class="fas fa-box me-2 text-primary"></i>
                    Product Management
                </h2>
                <p>Manage your product catalog</p>
            </div>
            <button class="btn btn-primary add-btn" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New Product
            </button>
        </div>

        <!-- Search & Filter Card: responsive grid -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label class="form-label">Search</label>
                        <input type="text" class="form-control" placeholder="Search product..." v-model="searchKeyword">
                    </div>
                    <div class="filter-item">
                        <label class="form-label">Brand</label>
                        <select class="form-select" v-model="selectedBrand">
                            <option value="">All Brands</option>
                            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                                {{ brand.name }}
                            </option>
                        </select>
                    </div>
                    <div class="filter-item">
                        <label class="form-label">Category</label>
                        <select class="form-select" v-model="selectedCategory">
                            <option value="">All Categories</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="filter-item filter-button">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-primary w-100" @click="searchProducts">
                            <i class="fas fa-search me-1"></i>
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Table Card -->
        <div class="card">
            <div class="card-body p-0">
                <div class="text-center p-5" v-if="isLoading">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading...</p>
                </div>

                <div class="table-responsive" v-else>
                    <table v-if="products.length > 0" class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in products" :key="product.id">
                                <td>{{ product.id }}</td>
                                <td>
                                    <img v-if="getProductImage(product)" :src="getProductImage(product)" width="50"
                                        height="50" class="rounded object-fit-cover product-image">
                                    <div v-else class="product-image-placeholder">No image</div>
                                </td>
                                <td>{{ product.name }}</td>
                                <td>{{ product.brand?.name || '-' }}</td>
                                <td>{{ product.category?.name || '-' }}</td>
                                <td>৳ {{ product.price }}</td>
                                <td><span class="badge bg-success">{{ product.stock }}</span></td>
                                <td>
                                    <span :class="product.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                                        {{ product.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-1 action-buttons">
                                        <button class="btn btn-sm btn-outline-info" @click="openEditModal(product)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="openDeleteModal(product)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="products.length === 0" class="text-center py-4 text-muted">
                        <i class="fas fa-database fa-2x mb-2 d-block"></i>
                        No products found
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="pagination.last_page > 1"
                    class="d-flex justify-content-between align-items-center mt-4 px-3 pb-3 pagination-wrap">
                    <div class="text-muted small">
                        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }}
                    </div>
                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                            <button class="page-link" @click="goToPage(pagination.current_page - 1)">Previous</button>
                        </li>
                        <li v-for="page in pageNumbers" :key="page" class="page-item"
                            :class="{ active: page === pagination.current_page }">
                            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: pagination.current_page >= pagination.last_page }">
                            <button class="page-link" @click="goToPage(pagination.current_page + 1)">Next</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal (responsive) -->
        <div class="modal fade" id="productModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ formMode === 'edit' ? 'Edit Product' : 'Add New Product' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
                        <form @submit.prevent="submitProduct">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label>Product Name *</label>
                                    <input v-model="form.name" type="text" class="form-control" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label>Slug</label>
                                    <input v-model="form.slug" type="text" class="form-control"
                                        placeholder="auto-generate">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label>Brand *</label>
                                    <select v-model="form.brand_id" class="form-select" required>
                                        <option value="">Select Brand</option>
                                        <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name
                                        }}</option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label>Category *</label>
                                    <select v-model="form.category_id" class="form-select" required>
                                        <option value="">Select Category</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label>Stock</label>
                                    <input v-model.number="form.stock" type="number" class="form-control" min="0">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label>Price *</label>
                                    <input v-model.number="form.price" type="number" class="form-control" step="0.01"
                                        required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label>Discount Price</label>
                                    <input v-model.number="form.discount_price" type="number" class="form-control"
                                        step="0.01">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-check mt-4">
                                        <input v-model="form.is_featured" class="form-check-input" type="checkbox"
                                            id="is_featured">
                                        <label class="form-check-label" for="is_featured">Featured</label>
                                    </div>
                                </div>
                                <div class="col-12 mb-3">
                                    <label>Description</label>
                                    <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                                </div>
                                <div class="col-12 mb-3">
                                    <label>Image URLs (one per line or comma separated)</label>
                                    <textarea v-model="form.images" class="form-control" rows="3"
                                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"></textarea>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-check">
                                        <input v-model="form.is_active" class="form-check-input" type="checkbox"
                                            id="is_active">
                                        <label class="form-check-label" for="is_active">Active</label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    {{ isSubmitting ? 'Saving...' : 'Save Product' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Modal -->
        <div class="modal fade" id="productDeleteModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete <strong>{{ selectedProduct?.name }}</strong>?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" :disabled="isDeleting" @click="deleteProduct">
                            {{ isDeleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import api from '@/utils/axios'

// Reactive state
const products = ref([])
const brands = ref([])
const categories = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const searchKeyword = ref('')
const selectedBrand = ref('')
const selectedCategory = ref('')
const formMode = ref('create')
const formError = ref('')
const editingProductId = ref(null)
const selectedProduct = ref(null)
const pagination = ref({ current_page: 1, last_page: 1, from: 0, to: 0, total: 0, per_page: 20 })

const form = reactive({
    name: '', slug: '', description: '', images: '', stock: 0, price: '', discount_price: '',
    is_featured: false, brand_id: '', category_id: '', is_active: true
})

// Helper: get Bootstrap modal instance
const getModal = (id) => {
    const el = document.getElementById(id)
    if (el && window.bootstrap?.Modal) return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    return null
}

// Reset form
const resetForm = () => {
    Object.assign(form, {
        name: '', slug: '', description: '', images: '', stock: 0, price: '', discount_price: '',
        is_featured: false, brand_id: '', category_id: '', is_active: true
    })
    editingProductId.value = null
    formMode.value = 'create'
    formError.value = ''
}

// Convert textarea input to array of URLs
const normalizeImagesInput = (value) => {
    if (!value) return []
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch { }
    return trimmed.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
}

// Extract first image from product (handles JSON string or array)
const getProductImage = (product) => {
    let images = product.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try { images = JSON.parse(images) } catch { }
    }
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string' && images.trim()) return images
    return ''
}

// Populate edit form
const populateForm = (product) => {
    form.name = product.name || ''
    form.slug = product.slug || ''
    form.description = product.description || ''
    let images = product.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try { images = JSON.parse(images) } catch { }
    }
    form.images = Array.isArray(images) ? images.join('\n') : (typeof images === 'string' ? images : '')
    form.stock = product.stock ?? 0
    form.price = product.price ?? ''
    form.discount_price = product.discount_price ?? ''
    form.is_featured = !!product.is_featured
    form.brand_id = product.brand?.id || product.brand_id || ''
    form.category_id = product.category?.id || product.category_id || ''
    form.is_active = product.is_active ?? true
}

// Open modals
const openModal = () => { resetForm(); getModal('productModal')?.show() }
const openEditModal = async (product) => {
    formMode.value = 'edit'
    formError.value = ''
    try {
        const { data } = await api.get(`admin/products/${product.id}`)
        populateForm(data.product || data)
        editingProductId.value = product.id
        getModal('productModal')?.show()
    } catch (err) {
        formError.value = err.response?.data?.message || 'Failed to load product'
    }
}
const openDeleteModal = (product) => { selectedProduct.value = product; getModal('productDeleteModal')?.show() }

// Validation
const validateForm = () => {
    const errors = []
    if (!form.name.trim()) errors.push('Product name required')
    if (!form.price || form.price <= 0) errors.push('Valid price required')
    if (form.discount_price && form.discount_price >= form.price) errors.push('Discount must be less than price')
    if (form.stock < 0) errors.push('Stock must be non-negative')
    return errors
}

// Toast
const showToast = (msg, type = 'success') => {
    const existing = document.querySelector('.app-toast')
    if (existing) existing.remove()
    const toast = document.createElement('div')
    toast.className = `app-toast app-toast--${type}`
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${msg}`
    document.body.appendChild(toast)
    setTimeout(() => toast.classList.add('app-toast--visible'), 10)
    setTimeout(() => {
        toast.classList.remove('app-toast--visible')
        setTimeout(() => toast.remove(), 300)
    }, type === 'success' ? 3000 : 5000)
}

// API calls
const loadProducts = async (page = 1) => {
    isLoading.value = true
    try {
        const params = { page }
        if (searchKeyword.value) params.search = searchKeyword.value
        if (selectedBrand.value) params.brand_id = selectedBrand.value
        if (selectedCategory.value) params.category_id = selectedCategory.value
        const { data } = await api.get('admin/products', { params })
        const items = data.data ?? data
        products.value = Array.isArray(items) ? items : []
        const meta = data.meta ?? data
        pagination.value = {
            current_page: meta.current_page ?? meta.currentPage ?? page,
            last_page: meta.last_page ?? meta.lastPage ?? 1,
            from: meta.from ?? 0,
            to: meta.to ?? products.value.length,
            total: meta.total ?? products.value.length,
            per_page: meta.per_page ?? meta.perPage ?? 20,
        }
    } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load products', 'error')
    } finally { isLoading.value = false }
}
const searchProducts = () => loadProducts(1)
const goToPage = (page) => loadProducts(page)
const loadBrands = async () => {
    try { const { data } = await api.get('admin/brands'); brands.value = data.data ?? data.brands ?? [] }
    catch (err) { console.error(err) }
}
const loadCategories = async () => {
    try { const { data } = await api.get('admin/categories'); categories.value = data.data ?? [] }
    catch (err) { console.error(err) }
}

const submitProduct = async () => {
    isSubmitting.value = true
    formError.value = ''
    const errors = validateForm()
    if (errors.length) {
        formError.value = errors.join('. ')
        isSubmitting.value = false
        return
    }
    const payload = {
        name: form.name,
        slug: form.slug || null,
        description: form.description || null,
        images: normalizeImagesInput(form.images),
        stock: Number(form.stock) || 0,
        price: form.price === '' ? null : Number(form.price),
        discount_price: form.discount_price === '' ? null : Number(form.discount_price),
        is_featured: !!form.is_featured,
        brand_id: form.brand_id,
        category_id: form.category_id,
        is_active: !!form.is_active,
    }
    try {
        if (formMode.value === 'edit' && editingProductId.value) {
            await api.put(`admin/products/${editingProductId.value}`, payload)
            showToast('Product updated')
        } else {
            await api.post('admin/products', payload)
            showToast('Product created')
        }
        getModal('productModal')?.hide()
        resetForm()
        await loadProducts(pagination.value.current_page)
    } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : 'Save failed'
        formError.value = msg
        showToast(msg, 'error')
    } finally { isSubmitting.value = false }
}

const deleteProduct = async () => {
    if (!selectedProduct.value) return
    isDeleting.value = true
    try {
        await api.delete(`admin/products/${selectedProduct.value.id}`)
        getModal('productDeleteModal')?.hide()
        showToast('Product deleted')
        await loadProducts(pagination.value.current_page)
    } catch (err) {
        showToast(err.response?.data?.message || 'Delete failed', 'error')
    } finally { isDeleting.value = false }
}

const pageNumbers = computed(() => {
    const last = pagination.value.last_page
    const current = pagination.value.current_page
    let start = Math.max(1, current - 2)
    let end = Math.min(last, start + 4)
    if (end - start < 4) start = Math.max(1, end - 4)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

onMounted(() => { loadProducts(); loadBrands(); loadCategories() })
</script>

<style scoped>
/* ===== BASE LAYOUT ===== */
.product-index {
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
    min-width: 800px;
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

/* Badge styles (light mode) */
.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    display: inline-block;
}

.badge.bg-success {
    background-color: #dcfce7 !important;
    color: #166534;
}

.badge.bg-secondary {
    background-color: #e2e8f0 !important;
    color: #1e293b;
}

/* Dark mode overrides */
.dark .badge.bg-success {
    background-color: #14532d !important;
    color: #bbf7d0;
}

.dark .badge.bg-secondary {
    background-color: #334155 !important;
    color: #e2e8f0;
}

/* Product image placeholder */
.product-image-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 0.375rem;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.25rem;
}

/* Action buttons */
.action-buttons {
    gap: 0.5rem;
}

.btn-sm {
    min-width: 32px;
}

/* Pagination responsive wrap */
.pagination-wrap {
    flex-wrap: wrap;
    gap: 12px;
}

/* ===== RESPONSIVE MOBILE ===== */
@media (max-width: 768px) {
    .product-index {
        gap: 16px;
    }

    .header {
        flex-direction: column;
        align-items: stretch;
    }

    .add-btn {
        width: 100%;
        justify-content: center;
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
    }

    .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
    }
}
</style>

<style>
/* Global toast styles (already present, keep as is) */
.app-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transform: translateX(110%);
    transition: 0.3s;
}

.app-toast--visible {
    opacity: 1;
    transform: translateX(0);
}

.app-toast--success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.app-toast--error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}
</style>