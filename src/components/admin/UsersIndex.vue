<template>

    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
                <i class="fas fa-users me-2 text-primary"></i>
                User Management
            </h2>
            <button class="btn btn-primary" @click="openModal()">
                <i class="fas fa-plus me-1"></i>
                Add New User
            </button>
        </div>

        <div class="card mb-4">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Search User</label>
                        <input type="text" class="form-control" placeholder="Search by name or email..."
                            v-model="searchKeyword">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Role</label>
                        <select class="form-select" v-model="selectedRole">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-primary w-100" @click="searchUsers">
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

                <table class="table table-hover mb-0" v-if="!isLoading && users.length > 0">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style="width: 150px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span class="badge bg-primary">{{ user.role }}</span>
                            </td>
                            <td>
                                <span class="badge bg-success">Active</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-info me-1">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="!isLoading && users.length === 0" class="text-center text-muted py-4">
                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                    No users found
                </div>

                <!-- Pagination -->
                <div v-if="!isLoading && users.length > 0"
                    class="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div class="text-muted small">
                        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} users
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
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/axios';

const users = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedRole = ref('')
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

const loadUsers = async (page = 1) => {
    isLoading.value = true
    try {
        const params = { page }
        if (searchKeyword.value) {
            params.search = searchKeyword.value
        }
        if (selectedRole.value) {
            params.role = selectedRole.value
        }

        const response = await api.get('admin/users', { params })
        users.value = response.data.data || response.data || []
        pagination.value = {
            current_page: response.data.meta?.current_page || response.data.current_page || page,
            last_page: response.data.meta?.last_page || response.data.last_page || 1,
            from: response.data.meta?.from || response.data.from || 0,
            to: response.data.meta?.to || response.data.to || users.value.length,
            total: response.data.meta?.total || response.data.total || users.value.length,
            per_page: response.data.meta?.per_page || response.data.per_page || 20,
        }
    } catch (error) {
        console.error('Users loading error:', error)
        users.value = []
    } finally {
        isLoading.value = false
    }
}

const searchUsers = async () => {
    await loadUsers(1)
}

const goToPage = async (page) => {
    if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) {
        return
    }
    await loadUsers(page)
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

    return rangeWithDots.filter(item => item !== '...' || rangeWithDots.indexOf(item) === rangeWithDots.lastIndexOf(item))
})

const openModal = () => {
    // Placeholder until users API is available
}

onMounted(() => {
    loadUsers()
})
</script>
