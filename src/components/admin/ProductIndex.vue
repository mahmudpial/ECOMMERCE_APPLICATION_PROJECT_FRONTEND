<template>
    <AdminMaster>
        <div>
            <!-- Header Section -->
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
                            <input type="text" class="form-control" placeholder="Search product..."
                                v-model="searchKeyword">
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
                        <table v-if="products.length > 0 && !isLoading" class="table table-hover mb-0 align-middle product-table">
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
                                            <img
                                                :src="getProductImage(product)"
                                                :alt="product.name"
                                                width="50"
                                                height="50"
                                                class="rounded object-fit-cover product-image"
                                            >
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
                                        <span class="badge bg-success">{{ product.status }}</span>
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
                        <div v-if="!isLoading && products.length === 0" class="text-center text-muted py-4">
                            <i class="fas fa-database fa-2x mb-2 d-block"></i>
                            No products found
                        </div>
                    </div>


                    <!-- Pagination -->
                    <div v-if="pagination.last_page > 1" class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mt-4">
                        <div class="text-muted">
                            Showing {{ pagination.from || 0 }} to {{ pagination.to || 0 }} of {{ pagination.total || 0 }} products
                        </div>
                        <nav>
                            <ul class="pagination mb-0">
                                <li class="page-item" :class="{ disabled: pagination.current_page <= 1 }">
                                    <button class="page-link" type="button" @click="goToPage(pagination.current_page - 1)"
                                        :disabled="pagination.current_page <= 1">
                                        Previous
                                    </button>
                                </li>
                                <li
                                    v-for="page in pagination.last_page"
                                    :key="page"
                                    class="page-item"
                                    :class="{ active: page === pagination.current_page }"
                                >
                                    <button class="page-link" type="button" @click="goToPage(page)">
                                        {{ page }}
                                    </button>
                                </li>
                                <li class="page-item" :class="{ disabled: pagination.current_page >= pagination.last_page }">
                                    <button class="page-link" type="button" @click="goToPage(pagination.current_page + 1)"
                                        :disabled="pagination.current_page >= pagination.last_page">
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>



                    <!-- Add/Edit Modal -->
                    <div class="modal fade" id="productModal" tabindex="-1" data-bs-backdrop="static">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">
                                        <i class="fas fa-plus-circle me-2"></i>
                                        Add New Product
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <form>

                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">Product Name <span
                                                        class="text-danger">*</span></label>
                                                <input type="text" class="form-control"
                                                    placeholder="e.g., iPhone 15 Pro">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">Slug</label>
                                                <input type="text" class="form-control" placeholder="auto-generate"
                                                    readonly>
                                                <small class="text-muted">Will be auto generated</small>
                                            </div>

                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Brand <span
                                                        class="text-danger">*</span></label>
                                                <select class="form-select">
                                                    <option value="">Select Brand</option>
                                                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                                                        {{ brand.name }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Category <span
                                                        class="text-danger">*</span></label>
                                                <select class="form-select">
                                                    <option value="">Select Category</option>
                                                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                                        {{ cat.name }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Stock</label>
                                                <input type="number" class="form-control" value="0">
                                            </div>

                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Price (BDT) <span
                                                        class="text-danger">*</span></label>
                                                <input type="number" class="form-control" placeholder="0.00">
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Discount Price (BDT)</label>
                                                <input type="number" class="form-control" placeholder="0.00">
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">&nbsp;</label>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="is_featured">
                                                    <label class="form-check-label" for="is_featured">
                                                        Featured Product
                                                    </label>
                                                </div>
                                            </div>

                                            <div class="col-12 mb-3">
                                                <label class="form-label">Description</label>
                                                <textarea class="form-control" rows="3"
                                                    placeholder="Write product details..."></textarea>
                                            </div>

                                            <div class="col-12 mb-3">
                                                <label class="form-label">Image URLs (JSON format)</label>
                                                <input type="text" class="form-control"
                                                    placeholder='["image1.jpg", "image2.jpg"]'>
                                                <small class="text-muted">Enter multiple image URLs as JSON
                                                    array</small>
                                            </div>

                                            <div class="col-md-6 mb-3">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="is_active"
                                                        checked>
                                                    <label class="form-check-label" for="is_active">
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        </div>


                                        <div class="modal-footer px-0 pb-0">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                                Cancel
                                            </button>
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save me-1"></i>
                                                Save Product
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>



                </div> <!-- end card body -->
            </div>



        </div>
    </AdminMaster>

</template>


<script setup>

import { ref, onMounted } from 'vue';
import api from '@/utils/axios'
import AdminMaster from '@/components/admin/AdminMaster.vue';



const products = ref([])
const brands = ref([])
const categories = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedBrand = ref('')
const selectedCategory = ref('')
const pagination = ref({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 20,
})

const buildProductParams = (page = 1) => {
    const params = { page }

    if (searchKeyword.value) params.search = searchKeyword.value
    if (selectedBrand.value) params.brand_id = selectedBrand.value
    if (selectedCategory.value) params.category_id = selectedCategory.value

    return params
}

const getProductImage = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0]
    }

    if (typeof product.images === 'string' && product.images.trim()) {
        return product.images
    }

    return ''
}

const loadProducts = async (page = 1) => {
    isLoading.value = true
    try {
        const response = await api.get('admin/products', {
            params: buildProductParams(page),
        })

        products.value = response.data.data || []
        pagination.value = {
            current_page: response.data.meta?.current_page || page,
            last_page: response.data.meta?.last_page || 1,
            from: response.data.meta?.from || 0,
            to: response.data.meta?.to || products.value.length,
            total: response.data.meta?.total || products.value.length,
            per_page: response.data.meta?.per_page || 20,
        }
    } catch (error) {
        console.error('data error:', error)
    } finally {
        isLoading.value = false
    }
}

const searchProducts = async () => {
    await loadProducts(1)
}

const goToPage = async (page) => {
    if (page < 1 || page > pagination.value.last_page || page === pagination.value.current_page) {
        return
    }

    await loadProducts(page)
}

const loadBrands = async () => {
    try {
        const response = await api.get('brands')
        brands.value = response.data.data || response.data.brands || []
    } catch (error) {
        console.error('Brands loading error:', error)
    }
}

const loadCategories = async () => {
    try {
        const response = await api.get('categories')
        categories.value = response.data.data || []
    } catch (error) {
        console.error('Categories loading error:', error)
    }
}

onMounted(() => {
    loadProducts()
    loadBrands()
    loadCategories()
})


</script>

<style scoped>
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
