<template>
    <div class="products-page">
        <!-- Page header -->
        <div class="page-header">
            <h1>Shop</h1>
            <p>Browse our collection of quality products</p>
        </div>

        <!-- Filters & Search -->
        <div class="filters">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input v-model="filters.search" type="text" placeholder="Search products..." @input="handleSearch" />
            </div>
            <div class="filter-group">
                <select v-model="filters.brand_id" @change="applyFilters">
                    <option value="">All Brands</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                        {{ brand.name }}
                    </option>
                </select>
                <select v-model="filters.category_id" @change="applyFilters">
                    <option value="">All Categories</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                    </option>
                </select>
                <button class="reset-btn" @click="resetFilters">Reset</button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading products...</p>
        </div>

        <!-- Products grid -->
        <div v-else-if="products.length" class="products-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>No products found. Try adjusting your filters.</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination">
            <button class="page-btn" :disabled="pagination.current_page === 1"
                @click="goToPage(pagination.current_page - 1)">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="page-info">
                Page {{ pagination.current_page }} of {{ pagination.last_page }}
            </span>
            <button class="page-btn" :disabled="pagination.current_page === pagination.last_page"
                @click="goToPage(pagination.current_page + 1)">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'
import ProductCard from '@/components/customer/ProductCard.vue'

const route = useRoute()
const router = useRouter()

const products = ref([])
const brands = ref([])
const categories = ref([])
const loading = ref(true)
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
})

const filters = ref({
    search: '',
    brand_id: '',
    category_id: '',
})

// Load filters from URL query params
const initFiltersFromQuery = () => {
    if (route.query.search) filters.value.search = route.query.search
    if (route.query.brand) filters.value.brand_id = route.query.brand
    if (route.query.category) filters.value.category_id = route.query.category
}

// Update URL with current filters (without reloading the page)
const updateUrlQuery = () => {
    const query = {}
    if (filters.value.search) query.search = filters.value.search
    if (filters.value.brand_id) query.brand = filters.value.brand_id
    if (filters.value.category_id) query.category = filters.value.category_id
    if (pagination.value.current_page > 1) query.page = pagination.value.current_page
    router.replace({ query })
}

// Debounce search input
let searchTimeout
const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        pagination.value.current_page = 1
        fetchProducts()
    }, 500)
}

const applyFilters = () => {
    pagination.value.current_page = 1
    fetchProducts()
}

const resetFilters = () => {
    filters.value = { search: '', brand_id: '', category_id: '' }
    pagination.value.current_page = 1
    fetchProducts()
}

const fetchProducts = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.value.current_page,
            search: filters.value.search || undefined,
            brand_id: filters.value.brand_id || undefined,
            category_id: filters.value.category_id || undefined,
        }
        const response = await api.get('products', { params })
        products.value = response.data.data || response.data || []
        pagination.value = {
            current_page: response.data.meta?.current_page || response.data.current_page || 1,
            last_page: response.data.meta?.last_page || response.data.last_page || 1,
            per_page: response.data.meta?.per_page || response.data.per_page || 20,
            total: response.data.meta?.total || response.data.total || 0,
        }
        updateUrlQuery()
    } catch (error) {
        console.error('Failed to fetch products', error)
        products.value = []
    } finally {
        loading.value = false
    }
}

const goToPage = (page) => {
    if (page < 1 || page > pagination.value.last_page) return
    pagination.value.current_page = page
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const fetchBrands = async () => {
    try {
        const res = await api.get('brands')
        brands.value = res.data.data || []
    } catch (err) {
        console.error(err)
    }
}

const fetchCategories = async () => {
    try {
        const res = await api.get('categories')
        categories.value = res.data.data || []
    } catch (err) {
        console.error(err)
    }
}

// Watch URL query changes (e.g., back/forward buttons)
watch(
    () => route.query,
    (newQuery) => {
        if (newQuery.search !== filters.value.search) filters.value.search = newQuery.search || ''
        if (newQuery.brand !== filters.value.brand_id) filters.value.brand_id = newQuery.brand || ''
        if (newQuery.category !== filters.value.category_id) filters.value.category_id = newQuery.category || ''
        if (newQuery.page && Number(newQuery.page) !== pagination.value.current_page) {
            pagination.value.current_page = Number(newQuery.page)
        }
        fetchProducts()
    },
    { immediate: false }
)

onMounted(() => {
    initFiltersFromQuery()
    fetchProducts()
    fetchBrands()
    fetchCategories()
})
</script>

<style scoped>
.products-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
}

.page-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
}

.page-header p {
    color: var(--text-muted);
}

.filters {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--card);
    border-radius: 1rem;
    box-shadow: var(--shadow);
}

.search-box {
    flex: 2;
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: 1px solid var(--border);
}

.search-box i {
    color: var(--text-muted);
}

.search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
}

.filter-group {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.filter-group select,
.reset-btn {
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
}

.reset-btn:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem;
}

.page-btn {
    padding: 0.5rem 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 2rem;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .filters {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box,
    .filter-group {
        width: 100%;
    }

    .filter-group {
        justify-content: center;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
}
</style>