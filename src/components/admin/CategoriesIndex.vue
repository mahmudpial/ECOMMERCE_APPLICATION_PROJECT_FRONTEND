<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
                <i class="fas fa-tags me-2 text-primary"></i>
                Category Management
            </h2>
            <button class="btn btn-primary" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New Category
            </button>
        </div>

        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-md-6">
                        <label class="form-label">Search</label>
                        <input v-model="searchKeyword" type="text" class="form-control"
                            placeholder="Search category by name or slug...">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Status</label>
                        <select v-model="statusFilter" class="form-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-grid">
                        <button class="btn btn-outline-secondary" type="button" @click="clearFilters">
                            Clear Filters
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
                                <th style="width: 150px;">Action</th>
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
                                    <button class="btn btn-sm btn-info me-1" @click="openEditModal(category)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" @click="openDeleteModal(category)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="!isLoading && filteredCategories.length === 0" class="text-center text-muted py-4">
                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                    No categories found
                </div>
            </div>
        </div>

        <div class="modal fade" id="categoryModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ formMode === 'edit' ? 'Edit Category' : 'Add New Category' }}
                        </h5>
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
                                    <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                                        {{ category.name }}
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

                            <div class="d-flex justify-content-end gap-2">
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

const categoryOptions = computed(() =>
    categories.value.filter((category) => category.id !== editingCategoryId.value)
)

const getModal = () => {
    const modalEl = document.getElementById('categoryModal')
    return modalEl && window.bootstrap?.Modal ? window.bootstrap.Modal.getOrCreateInstance(modalEl) : null
}

const getDeleteModal = () => {
    const modalEl = document.getElementById('categoryDeleteModal')
    return modalEl && window.bootstrap?.Modal ? window.bootstrap.Modal.getOrCreateInstance(modalEl) : null
}

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

const resetForm = () => {
    form.name = ''
    form.slug = ''
    form.parent_id = ''
    form.image = ''
    form.is_active = true
    formMode.value = 'create'
    formError.value = ''
    editingCategoryId.value = null
}

const clearFilters = () => {
    searchKeyword.value = ''
    statusFilter.value = ''
}

const openModal = () => {
    resetForm()
    getModal()?.show()
}

const populateForm = (category) => {
    form.name = category.name || ''
    form.slug = category.slug || ''
    form.parent_id = category.parent_id || ''
    form.image = category.image || ''
    form.is_active = category.is_active ?? true
}

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

const openDeleteModal = (category) => {
    selectedCategoryItem.value = category
    getDeleteModal()?.show()
}

const deleteCategory = async () => {
    if (!selectedCategoryItem.value) {
        return
    }

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

const getParentName = (parentId) => {
    if (!parentId) {
        return '-'
    }

    return categories.value.find((category) => category.id === parentId)?.name || '-'
}

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
.category-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
}

.category-preview {
    max-width: 160px;
    max-height: 120px;
    object-fit: cover;
}
</style>
