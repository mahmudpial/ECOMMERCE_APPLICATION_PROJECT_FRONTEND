<template>
    <div class="brands-index">
        <!-- Header: responsive stack on mobile -->
        <div class="header">
            <div style="text-align: justify;">
                <h2>
                    <i class="fas fa-trademark me-2 text-primary"></i>
                    Brand Management
                </h2>
                <p>Manage your product brands</p>
            </div>
            <button class="btn btn-primary add-btn" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New Brand
            </button>
        </div>

        <!-- Search & Filter Card (responsive grid) -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label class="form-label">Search</label>
                        <input v-model="searchKeyword" type="text" class="form-control"
                            placeholder="Search by name or slug...">
                    </div>
                    <div class="filter-item">
                        <label class="form-label">Status</label>
                        <select v-model="statusFilter" class="form-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="filter-item filter-button">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-secondary w-100" type="button" @click="clearFilters">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Brands Table Card -->
        <div class="card">
            <div class="card-body p-0">
                <div class="text-center p-5" v-if="isLoading">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading...</p>
                </div>

                <div class="table-responsive" v-if="!isLoading && filteredBrands.length > 0">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Brand Name</th>
                                <th>Logo</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style="width: 170px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="brand in filteredBrands" :key="brand.id">
                                <td>{{ brand.id }}</td>
                                <td>{{ brand.name }}</td>
                                <td>
                                    <img v-if="brand.logo" :src="brand.logo" :alt="brand.name"
                                        class="rounded border brand-thumb">
                                    <span v-else class="text-muted">No logo</span>
                                </td>
                                <td>{{ brand.slug }}</td>
                                <td>
                                    <span :class="brand.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                                        {{ brand.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-1 action-buttons">
                                        <button class="btn btn-sm btn-outline-info" @click="openEditModal(brand)"
                                            :disabled="isSubmitting">
                                            <i class="fas fa-edit me-1"></i>
                                            <span class="d-none d-md-inline">Edit</span>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="openDeleteModal(brand)"
                                            :disabled="isDeleting">
                                            <i class="fas fa-trash me-1"></i>
                                            <span class="d-none d-md-inline">Delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="!isLoading && filteredBrands.length === 0" class="text-center py-4 text-muted">
                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                    No brands found
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal (responsive) -->
        <div class="modal fade" id="brandModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ formMode === 'edit' ? 'Edit Brand' : 'Add New Brand' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
                        <form @submit.prevent="submitBrand">
                            <div class="mb-3">
                                <label class="form-label">Brand Name</label>
                                <input v-model="form.name" type="text" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Slug</label>
                                <input v-model="form.slug" type="text" class="form-control" placeholder="auto-generate">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Logo URL</label>
                                <input v-model="form.logo" type="text" class="form-control" placeholder="https://...">
                                <div v-if="form.logo" class="mt-2">
                                    <img :src="form.logo" :alt="form.name || 'Brand preview'"
                                        class="img-thumbnail brand-preview">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                            </div>
                            <div class="form-check mb-3">
                                <input v-model="form.is_active" class="form-check-input" type="checkbox"
                                    id="brandActive">
                                <label class="form-check-label" for="brandActive">Active</label>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    {{ isSubmitting ? 'Saving...' : 'Save Brand' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirm Modal -->
        <div class="modal fade" id="brandDeleteModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Brand</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">
                            Are you sure you want to delete
                            <strong>{{ selectedBrand?.name }}</strong>?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" :disabled="isDeleting" @click="deleteBrand">
                            {{ isDeleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import api from '@/utils/axios'

// Reactive state
const brands = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formMode = ref('create')
const formError = ref('')
const editingBrandId = ref(null)
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedBrand = ref(null)

const form = reactive({
    name: '',
    slug: '',
    logo: '',
    description: '',
    is_active: true,
})

// Helper: get Bootstrap modal instance
const getModal = () => {
    const el = document.getElementById('brandModal')
    if (el && window.bootstrap?.Modal) return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    return null
}

const getDeleteModal = () => {
    const el = document.getElementById('brandDeleteModal')
    if (el && window.bootstrap?.Modal) return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    return null
}

// Filtered brands (client-side, instant)
const filteredBrands = computed(() => {
    return brands.value.filter((brand) => {
        const matchesSearch = !searchKeyword.value
            || brand.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
            || brand.slug?.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const matchesStatus = !statusFilter.value
            || (statusFilter.value === 'active' && brand.is_active)
            || (statusFilter.value === 'inactive' && !brand.is_active)
        return matchesSearch && matchesStatus
    })
})

// Reset form
const resetForm = () => {
    Object.assign(form, {
        name: '', slug: '', logo: '', description: '', is_active: true
    })
    formMode.value = 'create'
    formError.value = ''
    editingBrandId.value = null
}

// Clear filters
const clearFilters = () => {
    searchKeyword.value = ''
    statusFilter.value = ''
}

// Open modal (create)
const openModal = () => {
    resetForm()
    getModal()?.show()
}

// Populate form for edit
const populateForm = (brand) => {
    form.name = brand.name || ''
    form.slug = brand.slug || ''
    form.logo = brand.logo || ''
    form.description = brand.description || ''
    form.is_active = brand.is_active ?? true
}

// Open edit modal
const openEditModal = async (brand) => {
    formMode.value = 'edit'
    formError.value = ''
    try {
        const response = await api.get(`admin/brands/${brand.id}`)
        populateForm(response.data.brand)
        editingBrandId.value = brand.id
        getModal()?.show()
    } catch (error) {
        console.error('Load brand error:', error)
        formError.value = error.response?.data?.message || 'Failed to load brand'
    }
}

// Extract validation error message
const extractValidationMessage = (error) => {
    const response = error.response?.data
    if (!response) return 'Something went wrong'
    if (response.message) return response.message
    const firstErrorKey = response.errors ? Object.keys(response.errors)[0] : null
    if (firstErrorKey && response.errors[firstErrorKey]?.length) {
        return response.errors[firstErrorKey][0]
    }
    return 'Validation failed'
}

// Submit brand (create or update)
const submitBrand = async () => {
    isSubmitting.value = true
    formError.value = ''
    try {
        const payload = {
            name: form.name,
            slug: form.slug || null,
            logo: form.logo || null,
            description: form.description || null,
            is_active: !!form.is_active,
        }
        if (formMode.value === 'edit' && editingBrandId.value) {
            await api.put(`admin/brands/${editingBrandId.value}`, payload)
        } else {
            await api.post('admin/brands', payload)
        }
        getModal()?.hide()
        resetForm()
        await loadBrands()
    } catch (error) {
        console.error('Brand save error:', error)
        formError.value = extractValidationMessage(error)
    } finally {
        isSubmitting.value = false
    }
}

// Open delete modal
const openDeleteModal = (brand) => {
    selectedBrand.value = brand
    getDeleteModal()?.show()
}

// Delete brand
const deleteBrand = async () => {
    if (!selectedBrand.value) return
    isDeleting.value = true
    try {
        await api.delete(`admin/brands/${selectedBrand.value.id}`)
        getDeleteModal()?.hide()
        selectedBrand.value = null
        await loadBrands()
    } catch (error) {
        console.error('Brand delete error:', error)
        alert(error.response?.data?.message || 'Failed to delete brand')
    } finally {
        isDeleting.value = false
    }
}

// Load brands from API
const loadBrands = async () => {
    isLoading.value = true
    try {
        const response = await api.get('admin/brands')
        brands.value = response.data.data || []
    } catch (error) {
        console.error('Brands loading error:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadBrands()
})
</script>

<style scoped>
/* ===== LAYOUT ===== */
.brands-index {
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

.add-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

/* Brand thumbnail */
.brand-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 0.375rem;
}

.brand-preview {
    max-width: 160px;
    max-height: 120px;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
}





/* Action buttons */
.action-buttons {
    gap: 0.5rem;
}

.btn-sm {
    min-width: 64px;
}

/* ===== RESPONSIVE MOBILE ===== */
@media (max-width: 768px) {
    .brands-index {
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
        min-width: auto;
    }

    .btn-sm .d-none.d-md-inline {
        display: none !important;
    }

    .brand-thumb {
        width: 36px;
        height: 36px;
    }

    .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
    }
}
</style>