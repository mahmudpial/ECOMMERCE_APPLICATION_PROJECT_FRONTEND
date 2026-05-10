<template>
    <div class="product-detail-page">

        <!-- Loading Skeleton -->
        <div v-if="loading" class="skeleton-shell">
            <div class="skeleton-grid">
                <div class="skeleton-gallery">
                    <div class="skeleton-main"></div>
                    <div class="skeleton-thumbs">
                        <div v-for="n in 4" :key="n" class="skeleton-thumb"></div>
                    </div>
                </div>
                <div class="skeleton-info">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line long"></div>
                    <div class="skeleton-line xlong"></div>
                </div>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="errorMessage || !product" class="empty-state">
            <div class="empty-icon">—</div>
            <h2>Piece not found</h2>
            <p>{{ errorMessage || 'We could not load this piece.' }}</p>
            <div class="empty-actions">
                <router-link to="/products" class="btn-outline">Return to shop</router-link>
                <button class="btn-ghost" @click="loadProduct">Try again</button>
            </div>
        </div>

        <!-- Product content -->
        <div v-else class="product-content">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
                <router-link to="/">Home</router-link>
                <span class="separator">/</span>
                <router-link to="/products">Shop</router-link>
                <span class="separator">/</span>
                <span>{{ product.name }}</span>
            </nav>

            <!-- Hero section -->
            <div class="product-hero">
                <!-- Gallery column -->
                <div class="gallery-col">
                    <div class="main-image">
                        <img :src="selectedImage" :alt="product.name" />
                        <span v-if="discountPercent" class="discount-badge">−{{ discountPercent }}%</span>
                    </div>
                    <div v-if="images.length > 1" class="thumbnails">
                        <button v-for="img in images" :key="img" class="thumb"
                            :class="{ active: selectedImage === img }" @click="selectedImage = img">
                            <img :src="img" :alt="product.name" />
                        </button>
                    </div>
                </div>

                <!-- Info column -->
                <div class="info-col">
                    <div class="product-meta">
                        <span class="category">{{ categoryLabel }}</span>
                        <span class="stock" :class="stockCount > 0 ? 'in-stock' : 'out-of-stock'">
                            {{ stockCount > 0 ? 'In stock' : 'Out of stock' }}
                        </span>
                    </div>

                    <h1 class="product-title">{{ product.name }}</h1>

                    <div class="rating">
                        <div class="stars">
                            <span v-for="n in 5" :key="n" class="star" :class="getStarClass(n)">★</span>
                        </div>
                        <span class="rating-value">{{ rating.toFixed(1) }}</span>
                        <span class="rating-count">({{ reviewCount }} reviews)</span>
                    </div>

                    <div class="price-block">
                        <div class="price-row">
                            <span class="current">৳{{ formatMoney(displayPrice) }}</span>
                            <span v-if="originalPrice" class="original">৳{{ formatMoney(originalPrice) }}</span>
                        </div>
                        <span v-if="discountPercent" class="save-badge">Save {{ discountPercent }}%</span>
                    </div>

                    <p class="description">
                        {{ product.short_description || product.description?.slice(0, 180) || 'A considered piece of
                        enduring quality.' }}
                    </p>

                    <!-- Trust signals -->
                    <div class="trust-signals">
                        <div class="trust-item" v-for="t in trustItems" :key="t.label">
                            <span class="trust-icon">{{ t.icon }}</span>
                            <span>{{ t.label }}</span>
                        </div>
                    </div>

                    <!-- Quantity and Add to Cart -->
                    <div class="cart-controls">
                        <div class="quantity">
                            <button @click="decrementQuantity" :disabled="quantity <= 1">−</button>
                            <span>{{ quantity }}</span>
                            <button @click="incrementQuantity" :disabled="quantity >= stockCount">+</button>
                        </div>
                        <button class="btn-primary add-btn" @click="addToCart" :disabled="stockCount === 0">
                            Add to cart
                        </button>
                    </div>

                    <button class="btn-outline buy-now" @click="buyNow" :disabled="stockCount === 0">
                        Buy now — ৳{{ formatMoney(displayPrice * quantity) }}
                    </button>

                    <div v-if="successMessage" class="success-toast">
                        <span>✓</span> {{ successMessage }}
                    </div>

                    <!-- Meta info grid -->
                    <div class="meta-grid">
                        <div class="meta-item" v-for="m in metaItems" :key="m.label">
                            <span class="meta-label">{{ m.label }}</span>
                            <strong class="meta-value">{{ m.value }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Details section (description + specs) -->
            <div class="details-section">
                <div class="detail-card">
                    <div class="detail-header">
                        <span class="detail-kicker">Product story</span>
                        <h2>Description</h2>
                    </div>
                    <p class="detail-text">
                        {{ product.description || 'This piece represents the finest in considered design — built for
                        longevity, worn for meaning.' }}
                    </p>
                    <div v-if="highlights.length" class="highlights">
                        <div v-for="h in highlights" :key="h" class="highlight">
                            <span class="highlight-icon">✦</span>
                            <span>{{ h }}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-card">
                    <div class="detail-header">
                        <span class="detail-kicker">Details & specs</span>
                        <h2>Specifications</h2>
                    </div>
                    <div class="specs">
                        <div v-for="s in specifications" :key="s.label" class="spec-row">
                            <span class="spec-label">{{ s.label }}</span>
                            <strong class="spec-value">{{ s.value }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Related products -->
            <section class="related-section">
                <div class="related-header">
                    <span class="related-kicker">You may also like</span>
                    <h2>Related pieces</h2>
                </div>

                <div v-if="relatedLoading" class="related-loading">
                    <span class="loading-spinner">⋯</span> Loading…
                </div>

                <div v-else-if="relatedProducts.length" class="related-grid">
                    <article v-for="item in relatedProducts" :key="item.id" class="related-card">
                        <router-link :to="`/product/${item.id}`" class="related-link">
                            <div class="related-image">
                                <img :src="getProductImage(item)" :alt="item.name" loading="lazy" />
                            </div>
                            <div class="related-info">
                                <div class="related-category">{{ item.category?.name || 'Collection' }}</div>
                                <div class="related-name">{{ item.name }}</div>
                                <div class="related-price">৳{{ formatMoney(getEffectivePrice(item)) }}</div>
                            </div>
                        </router-link>
                    </article>
                </div>

                <div v-else class="related-empty">No related pieces at this time.</div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// Data
const product = ref(null)
const relatedProducts = ref([])
const loading = ref(true)
const relatedLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedImage = ref('')
const quantity = ref(1)

// Trust items
const trustItems = [
    { icon: '✓', label: 'Authenticity guaranteed' },
    { icon: '📦', label: 'Free delivery' },
    { icon: '⟳', label: '30-day returns' },
]

// Helper functions
const getProductImage = (p) => {
    let imgs = p?.images
    if (typeof imgs === 'string' && imgs.trim().startsWith('[')) {
        try { imgs = JSON.parse(imgs) } catch { }
    }
    if (Array.isArray(imgs) && imgs.length) return imgs[0]
    if (typeof imgs === 'string' && imgs.trim()) return imgs
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
}

const getProductImages = (p) => {
    if (!p) return []
    let imgs = p.images
    if (typeof imgs === 'string' && imgs.trim().startsWith('[')) {
        try { imgs = JSON.parse(imgs) } catch { }
    }
    if (Array.isArray(imgs)) return imgs
    if (typeof imgs === 'string' && imgs.trim()) return [imgs]
    return []
}

const formatMoney = (v) => Number(v).toFixed(2)
const getEffectivePrice = (p) => {
    const disc = Number(p?.discount_price || 0)
    const reg = Number(p?.price || 0)
    return disc > 0 && disc < reg ? disc : reg
}

// Computed
const images = computed(() => {
    const imgs = getProductImages(product.value)
    return imgs.length ? imgs : [getProductImage(product.value)]
})

const categoryLabel = computed(() => product.value?.category?.name || product.value?.category_name || 'Collection')
const stockCount = computed(() => Number(product.value?.stock ?? product.value?.quantity ?? 0))
const displayPrice = computed(() => getEffectivePrice(product.value))
const originalPrice = computed(() => {
    const reg = Number(product.value?.price || 0)
    const disc = Number(product.value?.discount_price || 0)
    return disc > 0 && disc < reg ? reg : 0
})
const discountPercent = computed(() => {
    if (!originalPrice.value) return 0
    return Math.round(((originalPrice.value - displayPrice.value) / originalPrice.value) * 100)
})
const reviewCount = computed(() => Number(product.value?.review_count || 24))
const rating = computed(() => Number(product.value?.rating || 4.8))

const highlights = computed(() => {
    const pts = []
    if (product.value?.short_description) pts.push('Premium materials, considered construction.')
    if (stockCount.value > 0) pts.push(`${stockCount.value} unit${stockCount.value === 1 ? '' : 's'} available now.`)
    if (discountPercent.value) pts.push(`Save ${discountPercent.value}% on this piece.`)
    return pts
})

const specifications = computed(() => {
    const sp = []
    const s = product.value || {}
    if (s.sku) sp.push({ label: 'SKU', value: s.sku })
    if (s.brand?.name || s.brand_name) sp.push({ label: 'Brand', value: s.brand?.name || s.brand_name })
    if (s.category?.name || s.category_name) sp.push({ label: 'Category', value: s.category?.name || s.category_name })
    if (s.weight) sp.push({ label: 'Weight', value: `${s.weight}` })
    if (s.color) sp.push({ label: 'Colour', value: s.color })
    if (s.material) sp.push({ label: 'Material', value: s.material })
    if (!sp.length) sp.push({ label: 'Delivery', value: s.delivery_time || '3–5 days' }, { label: 'Rating', value: `${rating.value.toFixed(1)} / 5` })
    return sp.slice(0, 6)
})

const metaItems = computed(() => [
    { label: 'Brand', value: product.value?.brand?.name || 'Atelier' },
    { label: 'SKU', value: product.value?.sku || '—' },
    { label: 'Delivery', value: product.value?.delivery_time || '3–5 days' },
    { label: 'Availability', value: stockCount.value > 10 ? 'In stock' : stockCount.value > 0 ? 'Limited' : 'Sold out' },
])

const getStarClass = (n) => {
    const r = rating.value
    if (n <= Math.floor(r)) return 'full'
    if (n === Math.ceil(r) && r % 1 > 0.3) return 'half'
    return 'empty'
}

// Methods
const loadProduct = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const res = await api.get(`products/${route.params.id}`)
        product.value = res.data.product || res.data.data || res.data
        selectedImage.value = images.value[0]
        const related = res.data.related_products?.data || res.data.related_products || []
        relatedProducts.value = Array.isArray(related) ? related : []
        if (!relatedProducts.value.length) loadRelated()
    } catch (e) {
        errorMessage.value = e.response?.data?.message || 'Unable to load this piece.'
        product.value = null
    } finally {
        loading.value = false
    }
}

const loadRelated = async () => {
    relatedLoading.value = true
    try {
        const res = await api.get('products')
        const list = res.data.data || res.data || []
        const cid = product.value?.category_id || product.value?.category?.id
        relatedProducts.value = list
            .filter(i => Number(i.id) !== Number(route.params.id) && (!cid || Number(i.category_id || i.category?.id) === Number(cid)))
            .slice(0, 4)
    } catch { } finally {
        relatedLoading.value = false
    }
}

const incrementQuantity = () => { if (quantity.value < stockCount.value) quantity.value++ }
const decrementQuantity = () => { if (quantity.value > 1) quantity.value-- }

const addToCart = () => {
    if (!product.value) return
    cartStore.addItem(product.value, quantity.value)
    successMessage.value = `${product.value.name} added to cart.`
    setTimeout(() => { successMessage.value = '' }, 2800)
}

const buyNow = () => {
    addToCart()
    router.push('/checkout')
}

// Watchers
watch(() => route.params.id, loadProduct)
watch(images, () => { selectedImage.value = images.value[0] })

onMounted(() => {
    loadProduct()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700&display=swap');

/* Light mode (default) */
.product-detail-page {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --success: #10B981;
    --danger: #EF4444;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    --skeleton-bg: #EEEEEE;
}

/* Dark mode – triggered by parent .dark class */
.product-detail-page.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    --skeleton-bg: #2A2F3A;
}

.product-detail-page {
    max-width: 1400px;
    margin: 0 auto;
    background: var(--bg-page);
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text-primary);
}

/* Skeleton */
.skeleton-shell {
    padding: 2rem;
}

.skeleton-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.skeleton-gallery {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skeleton-main {
    aspect-ratio: 3/4;
    background: var(--skeleton-bg);
    border-radius: 20px;
    animation: pulse 1.2s infinite;
}

.skeleton-thumbs {
    display: flex;
    gap: 0.5rem;
}

.skeleton-thumb {
    width: 64px;
    height: 64px;
    background: var(--skeleton-bg);
    border-radius: 12px;
    animation: pulse 1.2s infinite;
}

.skeleton-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.skeleton-line {
    background: var(--skeleton-bg);
    border-radius: 8px;
    animation: pulse 1.2s infinite;
}

.skeleton-line.short {
    height: 28px;
    width: 40%;
}

.skeleton-line.medium {
    height: 56px;
    width: 70%;
}

.skeleton-line.long {
    height: 100px;
}

.skeleton-line.xlong {
    height: 200px;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.5;
    }

    50% {
        opacity: 0.9;
    }
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-light);
}

.breadcrumb a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb a:hover {
    color: var(--accent);
}

.separator {
    color: var(--accent);
}

/* Hero section */
.product-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding: 2rem;
}

/* Gallery */
.gallery-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.main-image {
    position: relative;
    aspect-ratio: 3/4;
    background: var(--bg-card);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-light);
}

.main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.discount-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: var(--accent);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 30px;
}

.thumbnails {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.thumb {
    width: 80px;
    height: 80px;
    padding: 0;
    border: 1px solid var(--border-light);
    border-radius: 12px;
    background: var(--bg-card);
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;
}

.thumb.active,
.thumb:hover {
    border-color: var(--accent);
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Info column */
.info-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.category {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 0.2rem 0.6rem;
    border-radius: 30px;
}

.stock {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 30px;
}

.stock.in-stock {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
}

.stock.out-of-stock {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
}

.product-title {
    font-family: 'Sora', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
}

.rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stars {
    display: flex;
    gap: 0.15rem;
}

.star {
    color: #CCCCCC;
    font-size: 0.9rem;
}

.star.full,
.star.half {
    color: #FFB800;
}

.rating-value,
.rating-count {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.price-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
}

.price-row {
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
}

.current {
    font-family: 'Sora', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
}

.original {
    font-size: 1rem;
    color: var(--text-muted);
    text-decoration: line-through;
}

.save-badge {
    font-size: 0.7rem;
    font-weight: 600;
    background: var(--accent-soft);
    color: var(--accent);
    padding: 0.2rem 0.6rem;
    border-radius: 30px;
}

.description {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

.trust-signals {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.5rem 0;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    color: var(--text-muted);
}

.trust-icon {
    font-size: 0.9rem;
}

.cart-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.quantity {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-input);
    border-radius: 40px;
}

.quantity button {
    width: 2.5rem;
    height: 2.8rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.2s;
}

.quantity button:hover:not(:disabled) {
    background: var(--accent-soft);
    color: var(--accent);
}

.quantity button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.quantity span {
    min-width: 2.5rem;
    text-align: center;
    font-weight: 500;
}

.btn-primary,
.btn-outline {
    flex: 1;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.btn-primary {
    background: var(--accent);
    border: none;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0052CC;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-outline {
    background: none;
    border: 1px solid var(--border-input);
    color: var(--text-primary);
}

.btn-outline:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
}

.buy-now {
    width: 100%;
}

.success-toast {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    background: rgba(16, 185, 129, 0.1);
    border-left: 3px solid var(--success);
    border-radius: 12px;
    font-size: 0.8rem;
}

.meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border-light);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    overflow: hidden;
}

.meta-item {
    background: var(--bg-card);
    padding: 0.8rem;
}

.meta-label {
    display: block;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.2rem;
}

.meta-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
}

/* Details section */
.details-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border-light);
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
}

.detail-card {
    background: var(--bg-card);
    padding: 2rem;
}

.detail-header {
    margin-bottom: 1.2rem;
}

.detail-kicker {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
}

.detail-header h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0.2rem 0 0;
}

.detail-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.highlights {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.highlight {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.highlight-icon {
    color: var(--accent);
}

.specs {
    display: flex;
    flex-direction: column;
}

.spec-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--border-light);
}

.spec-row:last-child {
    border-bottom: none;
}

.spec-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.spec-value {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary);
}

/* Related section */
.related-section {
    padding: 2rem;
    margin-top: 1rem;
}

.related-header {
    margin-bottom: 1.5rem;
}

.related-kicker {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
}

.related-header h2 {
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.2rem 0 0;
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border-light);
}

.related-card {
    background: var(--bg-card);
}

.related-link {
    display: block;
    text-decoration: none;
}

.related-image {
    aspect-ratio: 3/4;
    overflow: hidden;
}

.related-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.related-card:hover .related-image img {
    transform: scale(1.02);
}

.related-info {
    padding: 1rem;
}

.related-category {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent);
    margin-bottom: 0.3rem;
}

.related-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.3rem;
}

.related-price {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.related-loading,
.related-empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
}

.loading-spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-card);
    border-radius: 24px;
    margin: 2rem;
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
}

.empty-state p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.empty-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-ghost {
    background: none;
    border: 1px solid var(--border-input);
    padding: 0.6rem 1.2rem;
    border-radius: 40px;
    cursor: pointer;
    font-weight: 500;
}

/* Responsive */
@media (max-width: 900px) {
    .product-hero {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .details-section {
        grid-template-columns: 1fr;
    }

    .related-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .product-hero {
        padding: 1rem;
    }

    .related-grid {
        grid-template-columns: 1fr;
    }

    .breadcrumb {
        padding: 0.8rem 1rem;
    }

    .product-title {
        font-size: 1.5rem;
    }

    .current {
        font-size: 1.4rem;
    }

    .cart-controls {
        flex-direction: column;
    }

    .quantity {
        width: 100%;
    }

    .quantity button {
        flex: 1;
    }
}
</style>