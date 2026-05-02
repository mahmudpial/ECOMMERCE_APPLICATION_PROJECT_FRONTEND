<template>
    <AdminMaster>
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

            <div class="card">
                <div class="card-body p-0">
                    <div class="text-center p-5" v-if="isLoading">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-2">Loading...</p>
                    </div>

                    <table class="table table-hover mb-0" v-if="!isLoading && categories.length > 0">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style="width: 150px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="category in categories" :key="category.id">
                                <td>{{ category.id }}</td>
                                <td>{{ category.name }}</td>
                                <td>{{ category.slug }}</td>
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

                    <div v-if="!isLoading && categories.length === 0" class="text-center text-muted py-4">
                        <i class="fas fa-database fa-2x mb-2 d-block"></i>
                        No categories found
                    </div>
                </div>
            </div>
        </div>
    </AdminMaster>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/utils/axios'
import AdminMaster from '@/components/admin/AdminMaster.vue';

const categories = ref([])
const isLoading = ref(false)

const loadCategories = async () => {
    isLoading.value = true
    try {
        const response = await api.get('categories')
        categories.value = response.data.data || []
    } catch (error) {
        console.error('Categories loading error:', error)
    } finally {
        isLoading.value = false
    }
}

const openModal = () => {
    // Open add modal
}

onMounted(() => {
    loadCategories()
})
</script>
