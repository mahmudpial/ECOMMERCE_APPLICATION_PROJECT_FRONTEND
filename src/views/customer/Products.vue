<template>
    <div class="products-page">

        <!-- Minimalist header / brand mark -->
        <div class="minimal-header">
            <div class="brand-mark">Commercia</div>
        </div>

        <!-- Filter bar -->
        <div class="filter-bar">
            <div class="search-field">
                <span class="search-icon">🔍</span>
                <input v-model="filters.search" type="text" placeholder="Search products…" @input="handleSearch" />
            </div>

            <div class="filter-controls">
                <select v-model="filters.brand_id" @change="applyFilters">
                    <option value="">All Brands</option>
                    <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
                <select v-model="filters.category_id" @change="applyFilters">
                    <option value="">All Categories</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <button class="reset-btn" @click="resetFilters">Clear</button>
            </div>
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading" class="products-grid loading">
            <div v-for="n in 12" :key="n" class="skeleton-card"></div>
        </div>

        <!-- Products grid -->
        <div v-else-if="products.length" class="products-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
            <div class="empty-icon">—</div>
            <h2>No products found</h2>
            <p>Try adjusting your filters or search term.</p>
            <button class="reset-btn outlined" @click="resetFilters">Clear all filters</button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination">
            <button class="page-btn" :disabled="pagination.current_page === 1"
                @click="goToPage(pagination.current_page - 1)">←</button>
            <div class="page-numbers">
                <template v-for="p in pageRange" :key="p">
                    <button v-if="p !== '…'" class="page-num" :class="{ active: p === pagination.current_page }"
                        @click="goToPage(p)">{{ p }}</button>
                    <span v-else class="ellipsis">…</span>
                </template>
            </div>
            <button class="page-btn" :disabled="pagination.current_page === pagination.last_page"
                @click="goToPage(pagination.current_page + 1)">→</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/customer/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const products = ref([])
const brands = ref([])
const categories = ref([])
const loading = ref(true)
const pagination = ref({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
const filters = ref({ search: '', brand_id: '', category_id: '' })

const getProductImage = (p) => {
    let imgs = p.images
    if (typeof imgs === 'string' && imgs.trim().startsWith('[')) {
        try { imgs = JSON.parse(imgs) } catch { }
    }
    if (Array.isArray(imgs) && imgs.length) return imgs[0]
    if (typeof imgs === 'string' && imgs.trim()) return imgs
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
}
const formatMoney = (v) => Number(v).toFixed(2)
const getEffectivePrice = (p) => {
    const disc = Number(p.discount_price || 0)
    const reg = Number(p.price || 0)
    return disc > 0 && disc < reg ? disc : reg
}
const getOriginalPrice = (p) => {
    const disc = Number(p.discount_price || 0)
    const reg = Number(p.price || 0)
    return disc > 0 && disc < reg ? reg : 0
}
const getDiscount = (p) => {
    const orig = getOriginalPrice(p)
    const eff = getEffectivePrice(p)
    if (!orig) return 0
    return Math.round(((orig - eff) / orig) * 100)
}

const addToCart = (product) => {
    cartStore.addItem(product, 1)
}

const pageRange = computed(() => {
    const cur = pagination.value.current_page
    const last = pagination.value.last_page
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
    if (cur <= 4) return [1, 2, 3, 4, 5, '…', last]
    if (cur >= last - 3) return [1, '…', last - 4, last - 3, last - 2, last - 1, last]
    return [1, '…', cur - 1, cur, cur + 1, '…', last]
})

const initFiltersFromQuery = () => {
    if (route.query.search) filters.value.search = route.query.search
    if (route.query.brand) filters.value.brand_id = route.query.brand
    if (route.query.category) filters.value.category_id = route.query.category
}
const updateUrlQuery = () => {
    const q = {}
    if (filters.value.search) q.search = filters.value.search
    if (filters.value.brand_id) q.brand = filters.value.brand_id
    if (filters.value.category_id) q.category = filters.value.category_id
    if (pagination.value.current_page > 1) q.page = pagination.value.current_page
    router.replace({ query: q })
}

let searchTimeout
const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { pagination.value.current_page = 1; fetchProducts() }, 500)
}
const applyFilters = () => { pagination.value.current_page = 1; fetchProducts() }
const resetFilters = () => { filters.value = { search: '', brand_id: '', category_id: '' }; pagination.value.current_page = 1; fetchProducts() }

const fetchProducts = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.value.current_page,
            search: filters.value.search || undefined,
            brand_id: filters.value.brand_id || undefined,
            category_id: filters.value.category_id || undefined
        }
        const res = await api.get('products', { params })
        products.value = res.data.data || res.data || []
        pagination.value = {
            current_page: res.data.meta?.current_page || res.data.current_page || 1,
            last_page: res.data.meta?.last_page || res.data.last_page || 1,
            per_page: res.data.meta?.per_page || 20,
            total: res.data.meta?.total || res.data.total || 0
        }
        updateUrlQuery()
    } catch {
        products.value = []
    } finally {
        loading.value = false
    }
}
const goToPage = (p) => {
    if (p < 1 || p > pagination.value.last_page) return
    pagination.value.current_page = p
    fetchProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const fetchMeta = async () => {
    try {
        const [br, ca] = await Promise.all([api.get('brands'), api.get('categories')])
        brands.value = br.data.data || []
        categories.value = ca.data.data || []
    } catch { }
}

watch(() => route.query, (q) => {
    if (q.search !== filters.value.search) filters.value.search = q.search || ''
    if (q.brand !== filters.value.brand_id) filters.value.brand_id = q.brand || ''
    if (q.category !== filters.value.category_id) filters.value.category_id = q.category || ''
    if (q.page && Number(q.page) !== pagination.value.current_page) pagination.value.current_page = Number(q.page)
    fetchProducts()
}, { immediate: false })

onMounted(() => {
    initFiltersFromQuery()
    fetchProducts()
    fetchMeta()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700&display=swap');

/* Light mode (default) */
.products-page {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    --skeleton-bg: #EEEEEE;
    --filter-bg: #FFFFFF;
}

/* Dark mode – triggered by parent .dark class */
.products-page.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    --skeleton-bg: #2A2F3A;
    --filter-bg: #1A1E26;
}

.products-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text-primary);
}

/* Header */
.minimal-header {
    padding: 2rem 0 1.5rem;
    border-bottom: 1px solid var(--border-light);
    margin-bottom: 2rem;
}

.brand-mark {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 1.75rem;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
}

/* Filter bar */
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
    margin-bottom: 3rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid var(--border-light);
}

.search-field {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border-bottom: 2px solid var(--border-input);
    padding-bottom: 0.5rem;
    min-width: 260px;
    transition: border-color 0.2s;
}

.search-field:focus-within {
    border-bottom-color: var(--accent);
}

.search-icon {
    font-size: 1.1rem;
    color: var(--text-muted);
}

.search-field input {
    border: none;
    outline: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    background: transparent;
    width: 260px;
    padding: 0.3rem 0;
    color: var(--text-primary);
}

.search-field input::placeholder {
    color: var(--text-muted);
    font-weight: 400;
}

.filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
}

select {
    background: var(--filter-bg);
    border: 1px solid var(--border-input);
    padding: 0.6rem 2rem 0.6rem 0.9rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    border-radius: 8px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230066FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.7rem center;
    cursor: pointer;
}

select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}

.reset-btn {
    background: none;
    border: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.6rem 0.8rem;
    transition: color 0.2s;
}

.reset-btn:hover {
    color: var(--accent);
}

.reset-btn.outlined {
    border: 1px solid var(--border-input);
    border-radius: 8px;
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
}

.reset-btn.outlined:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
}

/* Products grid */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

.products-grid.loading {
    gap: 0;
}

/* Skeleton */
.skeleton-card {
    aspect-ratio: 3 / 4;
    background: var(--skeleton-bg);
    border-radius: 16px;
    animation: pulse 1.2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.5;
    }

    50% {
        opacity: 0.9;
    }

    100% {
        opacity: 0.5;
    }
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-card);
    border-radius: 20px;
    border: 1px solid var(--border-light);
}

.empty-icon {
    font-size: 3rem;
    font-family: 'Sora', sans-serif;
    color: var(--accent);
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h2 {
    font-weight: 600;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-light);
}

.page-btn {
    background: none;
    border: 1px solid var(--border-input);
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-primary);
}

.page-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    gap: 0.3rem;
}

.page-num {
    background: none;
    border: 1px solid transparent;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: 0.1s;
    color: var(--text-secondary);
}

.page-num.active {
    border-color: var(--accent);
    background: var(--accent);
    color: white;
}

.page-num:hover:not(.active) {
    border-color: var(--border-input);
    background: var(--accent-soft);
}

.ellipsis {
    padding: 0 0.4rem;
    color: var(--text-muted);
}

/* Responsive */
@media (max-width: 700px) {
    .products-page {
        padding: 0 1.2rem 3rem;
    }

    .filter-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-field {
        width: 100%;
    }

    .search-field input {
        width: 100%;
    }

    .filter-controls {
        justify-content: space-between;
    }

    .products-grid {
        gap: 1.2rem;
    }
}

@media (max-width: 500px) {
    .products-grid {
        grid-template-columns: 1fr;
    }
}
</style>