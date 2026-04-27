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


                    <!-- Table - Show when products exist -->
                    <table class="table table-hover mb-0">
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

                            <!-- Product Row - Dynamic data will go here -->
                            <tr v-for="product in products" :key="product.id">
                                <td>{{ product.id }}</td>
                                <td>
                                    <img src="" width="50" height="50" class="rounded" style="object-fit: cover;">
                                </td>
                                <td>{{ product.name }}</td>
                                <td>{{ product.brand.name }}</td>
                                <td>{{ product.category.name }}</td>
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


                            <!-- No Data Row -->
                            <tr>
                                <td colspan="9" class="text-center text-muted py-4">
                                    <i class="fas fa-database fa-2x mb-2 d-block"></i>
                                    No products found
                                </td>
                            </tr>
                        </tbody>
                    </table>


                    <!-- Pagination -->
                    <div class="d-flex justify-content-between align-items-center mt-4">
                        <div class="text-muted">
                            Showing 1 to 10 of 25 products
                        </div>
                        <nav>
                            <ul class="pagination mb-0">
                                <li class="page-item disabled">
                                    <a class="page-link" href="#">Previous</a>
                                </li>
                                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                <li class="page-item"><a class="page-link" href="#">2</a></li>
                                <li class="page-item"><a class="page-link" href="#">3</a></li>
                                <li class="page-item">
                                    <a class="page-link" href="#">Next</a>
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
                                                </select>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label class="form-label">Category <span
                                                        class="text-danger">*</span></label>
                                                <select class="form-select">
                                                    <option value="">Select Category</option>
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


const searchProducts = async () => {
    isLoading.value = true
    try {
        let url = `products?page=1`
        if (searchKeyword.value) url += `&search=${searchKeyword.value}`
        if (selectedBrand.value) url += `&brand_id=${selectedBrand.value}`
        if (selectedCategory.value) url += `&category_id=${selectedCategory.value}`

        const response = await api.get(url)
        products.value = response.data.data || response.data
    } catch (error) {
        console.error('Search error:', error)
    } finally {
        isLoading.value = false
    }
}


const loadProducts = async () => {
    isLoading.value = true

    try {

        const response = await api.get('admin/products')

        products.value = response.data.data

        isLoading.value = false

    } catch (error) {
        console.log('data error')
    }

}

const loadBrands = async () => {
    try {
        const response = await api.get('brands')
        brands.value = response.data
    } catch (error) {
        console.error('Brands loading error:', error)
    }
}

const loadCategories = async () => {
    try {
        const response = await api.get('categories')
        categories.value = response.data
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