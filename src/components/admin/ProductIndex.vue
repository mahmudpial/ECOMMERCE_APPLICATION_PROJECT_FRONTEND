<template>

    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
                <i class="fas fa-box me-2 text-primary"></i>
                Product Management
            </h2>
            <button class="btn btn-primary" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New Product
            </button>
        </div>

        <!-- Search & Filter Section -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Search</label>
                        <input type="text" class="form-control" placeholder="Search product..." v-model="searchKeyword">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Brand</label>
                        <select class="form-select" v-model="selectedBrand">
                            <option value="">All Brands</option>
                            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                                {{ brand.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Category</label>
                        <select class="form-select" v-model="selectedCategory">
                            <option value="">All Categories</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-primary w-100" @click="searchProducts">
                            <i class="fas fa-search me-1"></i>
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div class="text-center p-5" v-if="isLoading">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading...</p>
                </div>

                <div class="table-responsive">
                    <table v-if="products.length > 0 && !isLoading"
                        class="table table-hover mb-0 align-middle product-table">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 50px;">ID</th>
                                <th style="width: 80px;">Image</th>
                                <th>Product Name</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th style="width: 150px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in products" :key="product.id">
                                <td>{{ product.id }}</td>
                                <td>
                                    <template v-if="getProductImage(product)">
                                        <img :src="getProductImage(product)" :alt="product.name" width="50" height="50"
                                            class="rounded object-fit-cover product-image">
                                    </template>
                                    <div v-else class="product-image-placeholder">
                                        No image
                                    </div>
                                </td>
                                <td>{{ product.name }}</td>
                                <td>{{ product.brand?.name || '-' }}</td>
                                <td>{{ product.category?.name || '-' }}</td>
                                <td>৳ {{ product.price }}</td>
                                <td>
                                    <span class="badge bg-success">{{ product.stock }}</span>
                                </td>
                                <td>
                                    <span :class="product.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                                        {{ product.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-1">
                                        <button class="btn btn-sm btn-outline-info" @click="openEditModal(product)"
                                            :disabled="isSubmitting">
                                            <i class="fas fa-edit"></i>
                                            <span class="d-none d-md-inline ms-1">Edit</span>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="openDeleteModal(product)"
                                            :disabled="isDeleting">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="!isLoading && products.length === 0" class="text-center text-muted py-4">
                        <i class="fas fa-database fa-2x mb-2 d-block"></i>
                        No products found
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="pagination.last_page > 1"
                    class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mt-4 px-3 pb-3">
                    <div class="text-muted">
                        Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total || 0
                        }} products
                    </div>
                    <nav>
                        <ul class="pagination mb-0">
                            <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                                <button class="page-link" type="button" @click="goToPage(pagination.current_page - 1)"
                                    :disabled="pagination.current_page <= 1">
                                    Previous
                                </button>
                            </li>
                            <li v-for="page in pagination.last_page" :key="page" class="page-item"
                                :class="{ active: page === pagination.current_page }">
                                <button class="page-link" type="button" @click="goToPage(page)">
                                    {{ page }}
                                </button>
                            </li>
                            <li class="page-item"
                                :class="{ disabled: pagination.current_page >= pagination.last_page }">
                                <button class="page-link" type="button" @click="goToPage(pagination.current_page + 1)"
                                    :disabled="pagination.current_page >= pagination.last_page">
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div class="modal fade" id="productModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus-circle me-2"></i>
                            {{ formMode === 'edit' ? 'Edit Product' : 'Add New Product' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="formError" class="alert alert-danger">
                            {{ formError }}
                        </div>

                        <form @submit.prevent="submitProduct">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Product Name <span class="text-danger">*</span></label>
                                    <input v-model="form.name" type="text" class="form-control"
                                        placeholder="e.g., iPhone 15 Pro" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Slug</label>
                                    <input v-model="form.slug" type="text" class="form-control"
                                        placeholder="auto-generate">
                                    <small class="text-muted">Will be auto generated</small>
                                </div>

                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Brand <span class="text-danger">*</span></label>
                                    <select v-model="form.brand_id" class="form-select" required>
                                        <option value="">Select Brand</option>
                                        <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                                            {{ brand.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Category <span class="text-danger">*</span></label>
                                    <select v-model="form.category_id" class="form-select" required>
                                        <option value="">Select Category</option>
                                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                            {{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Stock</label>
                                    <input v-model.number="form.stock" type="number" class="form-control" min="0">
                                </div>

                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Price (BDT) <span class="text-danger">*</span></label>
                                    <input v-model.number="form.price" type="number" class="form-control" step="0.01"
                                        min="0" placeholder="0.00" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Discount Price (BDT)</label>
                                    <input v-model.number="form.discount_price" type="number" class="form-control"
                                        step="0.01" min="0" placeholder="0.00">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">&nbsp;</label>
                                    <div class="form-check mt-2">
                                        <input v-model="form.is_featured" class="form-check-input" type="checkbox"
                                            id="is_featured">
                                        <label class="form-check-label" for="is_featured">Featured Product</label>
                                    </div>
                                </div>

                                <div class="col-12 mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea v-model="form.description" class="form-control" rows="3"
                                        placeholder="Write product details..."></textarea>
                                </div>

                                <div class="col-12 mb-3">
                                    <label class="form-label">Image URLs</label>
                                    <textarea v-model="form.images" class="form-control" rows="3"
                                        placeholder="Paste image URLs, one per line or comma separated"></textarea>
                                    <small class="text-muted">You can paste plain URLs or JSON array format.</small>
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
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
                                    <span v-if="isSubmitting">Saving...</span>
                                    <span v-else><i class="fas fa-save me-1"></i>Save Product</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirm Modal -->
        <div class="modal fade" id="productDeleteModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">
                            Are you sure you want to delete
                            <strong>{{ selectedProduct?.name }}</strong>?
                        </p>
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
import { reactive, ref, onMounted } from 'vue'
import api from '@/utils/axios'


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
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

const form = reactive({
    name: '',
    slug: '',
    description: '',
    images: '',
    stock: 0,
    price: '',
    discount_price: '',
    is_featured: false,
    brand_id: '',
    category_id: '',
    is_active: true,
})

const getCurrentModal = () => {
    const modalEl = document.getElementById('productModal')
    if (!modalEl || !window.bootstrap?.Modal) return null
    return window.bootstrap.Modal.getOrCreateInstance(modalEl)
}

const getDeleteModal = () => {
    const modalEl = document.getElementById('productDeleteModal')
    return modalEl && window.bootstrap?.Modal ? window.bootstrap.Modal.getOrCreateInstance(modalEl) : null
}

const resetForm = () => {
    form.name = ''
    form.slug = ''
    form.description = ''
    form.images = ''
    form.stock = 0
    form.price = ''
    form.discount_price = ''
    form.is_featured = false
    form.brand_id = ''
    form.category_id = ''
    form.is_active = true
    editingProductId.value = null
    formMode.value = 'create'
    formError.value = ''
}

const normalizeImagesInput = (value) => {
    if (!value) return []
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
        // fall back to line/comma separated
    }
    return trimmed.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
}

const populateForm = (product) => {
    form.name = product.name || ''
    form.slug = product.slug || ''
    form.description = product.description || ''
    form.images = Array.isArray(product.images) ? product.images.join('\n') : (product.images || '')
    form.stock = product.stock ?? 0
    form.price = product.price ?? ''
    form.discount_price = product.discount_price ?? ''
    form.is_featured = !!product.is_featured
    form.brand_id = product.brand?.id || product.brand_id || ''
    form.category_id = product.category?.id || product.category_id || ''
    form.is_active = product.is_active ?? true
}

const openModal = () => {
    resetForm()
    getCurrentModal()?.show()
}

const openEditModal = async (product) => {
    formMode.value = 'edit'
    formError.value = ''
    try {
        const response = await api.get(`admin/products/${product.id}`)
        populateForm(response.data.product)
        editingProductId.value = product.id
        getCurrentModal()?.show()
    } catch (error) {
        console.error('Load product error:', error)
        formError.value = error.response?.data?.message || 'Failed to load product'
    }
}

const openDeleteModal = (product) => {
    selectedProduct.value = product
    getDeleteModal()?.show()
}

const validateForm = () => {
    const errors = []
    if (!form.name?.trim()) errors.push('Product name is required')
    if (!form.price || form.price <= 0) errors.push('Valid price is required')
    if (form.discount_price && form.discount_price >= form.price) {
        errors.push('Discount price must be less than regular price')
    }
    if (form.stock < 0) errors.push('Stock must be a non-negative number')
    return errors
}

// FIX: merged toast styles into a single <style scoped> block below.
// These DOM-appended toasts are a workaround since Bootstrap's toast
// requires JS init. They are kept simple and functional.
const showToast = (message, type = 'success') => {
    const existing = document.querySelector('.app-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.className = `app-toast app-toast--${type}`
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
        ${message}
    `
    document.body.appendChild(toast)
    // Trigger reflow for CSS transition
    toast.getBoundingClientRect()
    toast.classList.add('app-toast--visible')
    setTimeout(() => {
        toast.classList.remove('app-toast--visible')
        setTimeout(() => toast.remove(), 300)
    }, type === 'success' ? 3000 : 5000)
}

const extractValidationMessage = (error) => {
    const response = error.response?.data
    if (!response) return 'Something went wrong. Please try again.'
    if (response.message) return response.message
    const firstErrorKey = response.errors ? Object.keys(response.errors)[0] : null
    if (firstErrorKey && response.errors[firstErrorKey]?.length) {
        return response.errors[firstErrorKey][0]
    }
    return 'Validation failed. Please check your input.'
}

const buildProductPayload = () => ({
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
})

const buildProductParams = (page = 1) => {
    const params = { page }
    if (searchKeyword.value) params.search = searchKeyword.value
    if (selectedBrand.value) params.brand_id = selectedBrand.value
    if (selectedCategory.value) params.category_id = selectedCategory.value
    return params
}

const getProductImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0]
    if (typeof product.images === 'string' && product.images.trim()) return product.images
    return ''
}

const loadProducts = async (page = 1) => {
    isLoading.value = true
    try {
        const response = await api.get('admin/products', { params: buildProductParams(page) })
        products.value = response.data.data || response.data || []
        pagination.value = {
            current_page: response.data.meta?.current_page || response.data.current_page || page,
            last_page: response.data.meta?.last_page || response.data.last_page || 1,
            from: response.data.meta?.from || response.data.from || 0,
            to: response.data.meta?.to || response.data.to || products.value.length,
            total: response.data.meta?.total || response.data.total || products.value.length,
            per_page: response.data.meta?.per_page || response.data.per_page || 20,
        }
    } catch (error) {
        console.error('Products load error:', error)
    } finally {
        isLoading.value = false
    }
}

const searchProducts = async () => {
    await loadProducts(1)
}

const goToPage = async (page) => {
    if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) return
    await loadProducts(page)
}

const loadBrands = async () => {
    try {
        const response = await api.get('admin/brands')
        brands.value = response.data.data || response.data.brands || []
    } catch (error) {
        console.error('Brands loading error:', error)
    }
}

const loadCategories = async () => {
    try {
        const response = await api.get('admin/categories')
        categories.value = response.data.data || []
    } catch (error) {
        console.error('Categories loading error:', error)
    }
}

const submitProduct = async () => {
    isSubmitting.value = true
    formError.value = ''

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
        formError.value = validationErrors.join('. ')
        isSubmitting.value = false
        return
    }

    try {
        const payload = buildProductPayload()
        if (formMode.value === 'edit' && editingProductId.value) {
            await api.put(`admin/products/${editingProductId.value}`, payload)
            showToast('Product updated successfully!')
        } else {
            await api.post('admin/products', payload)
            showToast('Product created successfully!')
        }
        getCurrentModal()?.hide()
        resetForm()
        await loadProducts(pagination.value.current_page)
    } catch (error) {
        console.error('Product save error:', error)
        formError.value = extractValidationMessage(error)
        showToast(formError.value, 'error')
    } finally {
        isSubmitting.value = false
    }
}

const deleteProduct = async () => {
    if (!selectedProduct.value) return
    isDeleting.value = true
    try {
        await api.delete(`admin/products/${selectedProduct.value.id}`)
        getDeleteModal()?.hide()
        selectedProduct.value = null
        await loadProducts(pagination.value.current_page)
        showToast('Product deleted successfully!')
    } catch (error) {
        console.error('Product delete error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete product.'
        showToast(errorMessage, 'error')
    } finally {
        isDeleting.value = false
    }
}

onMounted(() => {
    loadProducts()
    loadBrands()
    loadCategories()
})
</script>

<style scoped>
/* FIX: merged both <style scoped> blocks into one — duplicate blocks meant
   only the last block was applied, silently dropping the toast styles. */

.product-table {
    min-width: 900px;
}

.product-image {
    object-fit: cover;
}

.product-image-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 0.375rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0.25rem;
}
</style>

<!-- Toast styles must be global (not scoped) because the toast elements
     are appended to document.body, outside this component's DOM scope. -->
<style>
.app-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transform: translateX(110%);
    transition: opacity 0.3s ease, transform 0.3s ease;
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