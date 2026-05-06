<template>
    <div class="categories-index">
        <!-- Header: responsive stack on mobile -->
        <div class="header">
            <div style="text-align: justify;">
                <h2>
                    <i class="fas fa-tags me-2 text-primary"></i>
                    Category Management
                </h2>
                <p>Manage your product categories</p>
            </div>
            <button class="btn btn-primary add-btn" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New Category
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

        <!-- Categories Table Card -->
        <div class="card">
            <div class="card-body p-0">
                <div class="text-center p-5" v-if="isLoading">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Loading...</p>
                </div>

                <div class="table-responsive" v-if="!isLoading && filteredCategories.length > 0">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Image</th>
                                <th>Parent</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style="width: 100px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="category in filteredCategories" :key="category.id">
                                <td>{{ category.id }}</td>
                                <td>{{ category.name }}</td>
                                <td>
                                    <img v-if="category.image" :src="category.image" :alt="category.name"
                                        class="rounded border category-thumb">
                                    <span v-else class="text-muted">No image</span>
                                </td>
                                <td>{{ getParentName(category.parent_id) }}</td>
                                <td>{{ category.slug }}</td>
                                <td>
                                    <span :class="category.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                                        {{ category.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-1 action-buttons">
                                        <button class="btn btn-sm btn-outline-info" @click="openEditModal(category)">
                                            <i class="fas fa-edit"></i>
                                            <span class="d-none d-md-inline ms-1">Edit</span>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger"
                                            @click="openDeleteModal(category)">
                                            <i class="fas fa-trash"></i>
                                            <span class="d-none d-md-inline ms-1">Delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="!isLoading && filteredCategories.length === 0" class="text-center py-4 text-muted">
                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                    No categories found
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal (responsive) -->
        <div class="modal fade" id="categoryModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ formMode === 'edit' ? 'Edit Category' : 'Add New Category' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="formError" class="alert alert-danger">{{ formError }}</div>
                        <form @submit.prevent="submitCategory">
                            <div class="mb-3">
                                <label class="form-label">Category Name</label>
                                <input v-model="form.name" type="text" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Slug</label>
                                <input v-model="form.slug" type="text" class="form-control" placeholder="auto-generate">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Parent Category</label>
                                <select v-model="form.parent_id" class="form-select">
                                    <option value="">No Parent</option>
                                    <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">
                                        {{ cat.name }}
                                    </option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Image URL</label>
                                <input v-model="form.image" type="text" class="form-control" placeholder="https://...">
                                <div v-if="form.image" class="mt-2">
                                    <img :src="form.image" :alt="form.name || 'Category preview'"
                                        class="img-thumbnail category-preview">
                                </div>
                            </div>
                            <div class="form-check mb-3">
                                <input v-model="form.is_active" class="form-check-input" type="checkbox"
                                    id="categoryActive">
                                <label class="form-check-label" for="categoryActive">Active</label>
                            </div>
                            <div class="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    {{ isSubmitting ? 'Saving...' : 'Save Category' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirm Modal -->
        <div class="modal fade" id="categoryDeleteModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Delete Category</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">
                            Are you sure you want to delete
                            <strong>{{ selectedCategoryItem?.name }}</strong>?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" :disabled="isDeleting" @click="deleteCategory">
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
const categories = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formMode = ref('create')
const formError = ref('')
const editingCategoryId = ref(null)
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedCategoryItem = ref(null)

const form = reactive({
    name: '',
    slug: '',
    parent_id: '',
    image: '',
    is_active: true,
})

// Helper: get Bootstrap modal instance
const getModal = () => {
    const el = document.getElementById('categoryModal')
    if (el && window.bootstrap?.Modal) return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    return null
}

const getDeleteModal = () => {
    const el = document.getElementById('categoryDeleteModal')
    if (el && window.bootstrap?.Modal) return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el)
    return null
}

// Category options for parent dropdown (exclude current when editing)
const categoryOptions = computed(() =>
    categories.value.filter(cat => cat.id !== editingCategoryId.value)
)

// Client‑side filter
const filteredCategories = computed(() => {
    return categories.value.filter((category) => {
        const matchesSearch = !searchKeyword.value
            || category.name?.toLowerCase().includes(searchKeyword.value.toLowerCase())
            || category.slug?.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const matchesStatus = !statusFilter.value
            || (statusFilter.value === 'active' && category.is_active)
            || (statusFilter.value === 'inactive' && !category.is_active)
        return matchesSearch && matchesStatus
    })
})

// Reset form
const resetForm = () => {
    Object.assign(form, {
        name: '', slug: '', parent_id: '', image: '', is_active: true
    })
    formMode.value = 'create'
    formError.value = ''
    editingCategoryId.value = null
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
const populateForm = (category) => {
    form.name = category.name || ''
    form.slug = category.slug || ''
    form.parent_id = category.parent_id || ''
    form.image = category.image || ''
    form.is_active = category.is_active ?? true
}

// Open edit modal
const openEditModal = async (category) => {
    formMode.value = 'edit'
    formError.value = ''
    try {
        const response = await api.get(`admin/categories/${category.id}`)
        populateForm(response.data.category)
        editingCategoryId.value = category.id
        getModal()?.show()
    } catch (error) {
        console.error('Load category error:', error)
        formError.value = error.response?.data?.message || 'Failed to load category'
    }
}

// Extract validation message
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

// Submit category (create or update)
const submitCategory = async () => {
    isSubmitting.value = true
    formError.value = ''
    try {
        const payload = {
            name: form.name,
            slug: form.slug || null,
            parent_id: form.parent_id || null,
            image: form.image || null,
            is_active: !!form.is_active,
        }
        if (formMode.value === 'edit' && editingCategoryId.value) {
            await api.put(`admin/categories/${editingCategoryId.value}`, payload)
        } else {
            await api.post('admin/categories', payload)
        }
        getModal()?.hide()
        resetForm()
        await loadCategories()
    } catch (error) {
        console.error('Category save error:', error)
        formError.value = extractValidationMessage(error)
    } finally {
        isSubmitting.value = false
    }
}

// Open delete modal
const openDeleteModal = (category) => {
    selectedCategoryItem.value = category
    getDeleteModal()?.show()
}

// Delete category
const deleteCategory = async () => {
    if (!selectedCategoryItem.value) return
    isDeleting.value = true
    try {
        await api.delete(`admin/categories/${selectedCategoryItem.value.id}`)
        getDeleteModal()?.hide()
        selectedCategoryItem.value = null
        await loadCategories()
    } catch (error) {
        console.error('Category delete error:', error)
        alert(error.response?.data?.message || 'Failed to delete category')
    } finally {
        isDeleting.value = false
    }
}

// Get parent name helper
const getParentName = (parentId) => {
    if (!parentId) return '-'
    return categories.value.find(cat => cat.id === parentId)?.name || '-'
}

// Load categories from API
const loadCategories = async () => {
    isLoading.value = true
    try {
        const response = await api.get('admin/categories')
        categories.value = response.data.data || []
    } catch (error) {
        console.error('Categories loading error:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadCategories()
})
</script>

<style scoped>
/* ===== LAYOUT ===== */
.categories-index {
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

/* Category thumbnail */
.category-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 0.375rem;
}

.category-preview {
    max-width: 160px;
    max-height: 120px;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
}

/* Badges (light mode defaults) */
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

/* Action buttons */
.action-buttons {
    gap: 0.5rem;
}

.btn-sm {
    min-width: 64px;
}

/* ===== RESPONSIVE MOBILE ===== */
@media (max-width: 768px) {
    .categories-index {
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

    .category-thumb {
        width: 36px;
        height: 36px;
    }

    .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
    }
}
</style>