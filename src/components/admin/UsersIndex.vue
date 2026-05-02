<template>
    <AdminMaster>
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
                </div>
            </div>
        </div>
    </AdminMaster>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminMaster from '@/components/admin/AdminMaster.vue';

const users = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedRole = ref('')

const loadUsers = async () => {
    isLoading.value = true
    try {
        // Add API call here
        users.value = []
    } catch (error) {
        console.error('Users loading error:', error)
    } finally {
        isLoading.value = false
    }
}

const searchUsers = async () => {
    isLoading.value = true
    try {
        // Add API call here
        users.value = []
    } catch (error) {
        console.error('Search error:', error)
    } finally {
        isLoading.value = false
    }
}

const openModal = () => {
    // Open add modal
}

onMounted(() => {
    loadUsers()
})
</script>
