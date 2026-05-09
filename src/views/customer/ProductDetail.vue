<template>
    <div class="product-detail-page">
        <div v-if="loading" class="loading-shell">
            <div class="skeleton-grid">
                <div class="skeleton-card image-skeleton"></div>
                <div class="skeleton-stack">
                    <div class="skeleton-card line short"></div>
                    <div class="skeleton-card line medium"></div>
                    <div class="skeleton-card line long"></div>
                    <div class="skeleton-card line tall"></div>
                </div>
            </div>
        </div>

        <div v-else-if="errorMessage || !product" class="error-shell">
            <div class="error-card">
                <div class="error-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h1>Product not found</h1>
                <p>{{ errorMessage || 'We could not load this product right now.' }}</p>
                <div class="error-actions">
                    <router-link to="/products" class="primary-btn">Back to shop</router-link>
                    <button class="secondary-btn" type="button" @click="reloadProduct">Try again</button>
                </div>
            </div>
        </div>

        <div v-else class="detail-shell">
            <nav class="breadcrumb">
                <router-link to="/">Home</router-link>
                <span>/</span>
                <router-link to="/products">Shop</router-link>
                <span>/</span>
                <span>{{ product.name }}</span>
            </nav>

            <section class="product-hero">
                <div class="gallery-card">
                    <div class="main-image">
                        <img :src="selectedImage" :alt="product.name" />
                    </div>

                    <div class="thumb-row" v-if="images.length > 1">
                        <button
                            v-for="img in images"
                            :key="img"
                            type="button"
                            class="thumb"
                            :class="{ active: selectedImage === img }"
                            @click="selectedImage = img"
                        >
                            <img :src="img" :alt="product.name" />
                        </button>
                    </div>
                </div>

                <aside class="purchase-card">
                    <div class="purchase-top">
                        <span class="category-badge">{{ categoryLabel }}</span>
                        <span v-if="stockCount > 0" class="stock-pill in-stock">
                            <i class="fas fa-circle-check"></i>
                            In stock
                        </span>
                        <span v-else class="stock-pill out-stock">
                            <i class="fas fa-circle-xmark"></i>
                            Out of stock
                        </span>
                    </div>

                    <h1>{{ product.name }}</h1>

                    <div class="rating-row">
                        <div class="stars" :aria-label="`${rating} out of 5 stars`">
                            <i v-for="n in 5" :key="n" class="fas" :class="n <= Math.round(rating) ? 'fa-star' : 'fa-star-half-stroke'"></i>
                        </div>
                        <span>{{ rating.toFixed(1) }}</span>
                        <span>({{ reviewCount }} reviews)</span>
                    </div>

                    <div class="price-row">
                        <div class="price-stack">
                            <strong>৳{{ formatMoney(displayPrice) }}</strong>
                            <span v-if="originalPrice">৳{{ formatMoney(originalPrice) }}</span>
                        </div>
                        <span v-if="discountPercent" class="discount-pill">-{{ discountPercent }}%</span>
                    </div>

                    <p class="short-description">
                        {{ product.short_description || product.description || 'A polished, high-quality product ready for checkout.' }}
                    </p>

                    <div class="trust-grid">
                        <div class="trust-item">
                            <i class="fas fa-shield-heart"></i>
                            <span>Secure payment</span>
                        </div>
                        <div class="trust-item">
                            <i class="fas fa-truck-fast"></i>
                            <span>Fast delivery</span>
                        </div>
                        <div class="trust-item">
                            <i class="fas fa-rotate-left"></i>
                            <span>Easy returns</span>
                        </div>
                    </div>

                    <div class="quantity-row">
                        <div class="qty-control">
                            <button type="button" @click="decrementQuantity" :disabled="quantity <= 1">-</button>
                            <span>{{ quantity }}</span>
                            <button type="button" @click="incrementQuantity">+</button>
                        </div>

                        <button class="primary-btn" type="button" @click="addToCart" :disabled="stockCount === 0">
                            <i class="fas fa-cart-shopping"></i>
                            Add to cart
                        </button>
                    </div>

                    <button class="buy-now-btn" type="button" @click="buyNow" :disabled="stockCount === 0">
                        Buy now
                    </button>

                    <div v-if="successMessage" class="toast-success">
                        <i class="fas fa-circle-check"></i>
                        {{ successMessage }}
                    </div>

                    <div class="meta-grid">
                        <div class="meta-card">
                            <span>Brand</span>
                            <strong>{{ brandLabel }}</strong>
                        </div>
                        <div class="meta-card">
                            <span>SKU</span>
                            <strong>{{ skuLabel }}</strong>
                        </div>
                        <div class="meta-card">
                            <span>Delivery</span>
                            <strong>{{ deliveryLabel }}</strong>
                        </div>
                        <div class="meta-card">
                            <span>Availability</span>
                            <strong>{{ stockLabel }}</strong>
                        </div>
                    </div>
                </aside>
            </section>

            <section class="details-grid">
                <article class="detail-card wide">
                    <div class="section-head">
                        <h2>Description</h2>
                        <span>{{ product.category?.name || product.category_name || 'Featured' }}</span>
                    </div>
                    <p class="description-text">
                        {{ product.description || 'This product comes with clear details, a clean presentation, and a shopping flow that keeps customers focused on the purchase.' }}
                    </p>

                    <div v-if="highlightPoints.length" class="feature-list">
                        <div v-for="point in highlightPoints" :key="point" class="feature-item">
                            <i class="fas fa-check"></i>
                            <span>{{ point }}</span>
                        </div>
                    </div>
                </article>

                <article class="detail-card">
                    <div class="section-head">
                        <h2>Specifications</h2>
                        <span>Quick view</span>
                    </div>
                    <div class="spec-list">
                        <div v-for="spec in specifications" :key="spec.label" class="spec-row">
                            <span>{{ spec.label }}</span>
                            <strong>{{ spec.value }}</strong>
                        </div>
                    </div>
                </article>
            </section>

            <section class="related-section">
                <div class="section-head">
                    <h2>Related products</h2>
                    <span>{{ relatedProducts.length }} item{{ relatedProducts.length === 1 ? '' : 's' }}</span>
                </div>

                <div v-if="relatedLoading" class="related-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading related products...</p>
                </div>

                <div v-else-if="relatedProducts.length" class="related-grid">
                    <ProductCard v-for="item in relatedProducts" :key="item.id" :product="item" />
                </div>

                <div v-else class="related-empty">
                    <i class="fas fa-boxes-stacked"></i>
                    <p>No related products found for this item.</p>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'
import ProductCard from '@/components/customer/ProductCard.vue'
import {
    formatMoney,
    getEffectiveProductPrice,
    getProductImage,
    getProductImages,
} from '@/utils/customerCommerce'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref(null)
const relatedProducts = ref([])
const loading = ref(true)
const relatedLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedImage = ref('')
const quantity = ref(1)

const images = computed(() => getProductImages(product.value).length ? getProductImages(product.value) : [getProductImage(product.value)])

const categoryLabel = computed(() => product.value?.category?.name || product.value?.category_name || 'Featured product')
const brandLabel = computed(() => product.value?.brand?.name || product.value?.brand_name || 'Unknown')
const skuLabel = computed(() => product.value?.sku || product.value?.code || 'N/A')
const stockCount = computed(() => Number(product.value?.stock ?? product.value?.quantity ?? product.value?.available_stock ?? 0))
const displayPrice = computed(() => getEffectiveProductPrice(product.value))
const originalPrice = computed(() => {
    const regular = Number(product.value?.price || 0)
    const discounted = Number(product.value?.discount_price || 0)

    if (discounted > 0 && discounted < regular) return regular
    return 0
})
const stockLabel = computed(() => {
    if (stockCount.value > 10) return 'Plenty available'
    if (stockCount.value > 0) return 'Limited stock'
    return 'Out of stock'
})
const deliveryLabel = computed(() => product.value?.delivery_time || '3-5 business days')
const reviewCount = computed(() => Number(product.value?.review_count || product.value?.reviews_count || 24))
const rating = computed(() => Number(product.value?.rating || product.value?.average_rating || 4.8))
const discountPercent = computed(() => {
    if (!originalPrice.value || originalPrice.value <= displayPrice.value) return 0
    return Math.round(((originalPrice.value - displayPrice.value) / originalPrice.value) * 100)
})

const highlightPoints = computed(() => {
    const points = []

    if (product.value?.short_description) points.push('Premium finish and carefully crafted product details.')
    if (stockCount.value > 0) points.push(`In stock now with ${stockCount.value} unit${stockCount.value === 1 ? '' : 's'} ready to ship.`)
    if (deliveryLabel.value) points.push(`Estimated delivery: ${deliveryLabel.value}.`)
    if (discountPercent.value) points.push(`Save ${discountPercent.value}% compared to the original price.`)

    return points.slice(0, 4)
})

const specifications = computed(() => {
    const spec = []
    const source = product.value || {}

    if (source.sku) spec.push({ label: 'SKU', value: source.sku })
    if (source.brand?.name || source.brand_name) spec.push({ label: 'Brand', value: source.brand?.name || source.brand_name })
    if (source.category?.name || source.category_name) spec.push({ label: 'Category', value: source.category?.name || source.category_name })
    if (source.weight) spec.push({ label: 'Weight', value: `${source.weight}` })
    if (source.color) spec.push({ label: 'Color', value: `${source.color}` })
    if (source.size) spec.push({ label: 'Size', value: `${source.size}` })
    if (source.material) spec.push({ label: 'Material', value: `${source.material}` })
    if (source.warranty) spec.push({ label: 'Warranty', value: `${source.warranty}` })

    if (!spec.length) {
        spec.push(
            { label: 'Delivery', value: deliveryLabel.value },
            { label: 'Stock', value: stockLabel.value },
            { label: 'Rating', value: `${rating.value.toFixed(1)} / 5` },
        )
    }

    return spec.slice(0, 6)
})

const selectedImageFallback = () => {
    selectedImage.value = images.value[0] || getProductImage(product.value)
}

const loadRelatedProducts = async () => {
    if (!product.value) return

    relatedLoading.value = true
    try {
        const response = await api.get('products')
        const list = response.data.data || response.data || []
        const currentId = Number(route.params.id)
        const categoryId = product.value.category_id || product.value.category?.id

        relatedProducts.value = (Array.isArray(list) ? list : [])
            .filter((item) => Number(item.id) !== currentId)
            .filter((item) => {
                if (!categoryId) return true
                return Number(item.category_id || item.category?.id || 0) === Number(categoryId)
            })
            .slice(0, 4)
    } catch (error) {
        console.error('Failed to load related products:', error)
        relatedProducts.value = []
    } finally {
        relatedLoading.value = false
    }
}

const loadProduct = async () => {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    quantity.value = 1

    try {
        const response = await api.get(`products/${route.params.id}`)
        product.value = response.data.product || response.data.data || response.data
        selectedImageFallback()
        const related = response.data.related_products?.data || response.data.related_products || []
        relatedProducts.value = Array.isArray(related) ? related : []

        if (!relatedProducts.value.length) {
            await loadRelatedProducts()
        }
    } catch (error) {
        console.error('Product detail error:', error)
        errorMessage.value = error.response?.data?.message || 'Unable to load this product.'
        product.value = null
        relatedProducts.value = []
    } finally {
        loading.value = false
    }
}

const reloadProduct = () => {
    loadProduct()
}

const incrementQuantity = () => {
    if (stockCount.value > 0 && quantity.value < stockCount.value) {
        quantity.value += 1
    }
}

const decrementQuantity = () => {
    if (quantity.value > 1) quantity.value -= 1
}

const addToCart = () => {
    if (!product.value) return

    cartStore.addItem(product.value, quantity.value)
    successMessage.value = `${product.value.name} added to cart.`
    window.setTimeout(() => {
        successMessage.value = ''
    }, 2500)
}

const buyNow = () => {
    addToCart()
    router.push('/checkout')
}

watch(
    () => route.params.id,
    () => {
        loadProduct()
    },
)

watch(images, () => {
    selectedImageFallback()
})

onMounted(() => {
    loadProduct()
})
</script>

<style scoped>
.product-detail-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}

.loading-shell,
.error-shell {
    display: grid;
    place-items: center;
    min-height: 60vh;
}

.skeleton-grid {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 1rem;
}

.skeleton-card {
    border-radius: 1.5rem;
    background: linear-gradient(90deg, rgba(148, 163, 184, 0.14), rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.14));
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
}

.image-skeleton {
    min-height: 520px;
}

.skeleton-stack {
    display: grid;
    gap: 0.75rem;
}

.line.short {
    height: 58px;
}

.line.medium {
    height: 92px;
}

.line.long {
    height: 160px;
}

.line.tall {
    height: 260px;
}

.error-card {
    width: min(100%, 560px);
    padding: 2rem;
    text-align: center;
    border-radius: 1.5rem;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.error-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    display: grid;
    place-items: center;
    border-radius: 1.2rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(20, 184, 166, 0.16));
    color: var(--primary);
    font-size: 1.7rem;
}

.error-card h1 {
    margin-bottom: 0.5rem;
}

.error-card p {
    color: var(--text-muted);
    margin-bottom: 1.25rem;
}

.error-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

.primary-btn,
.secondary-btn,
.buy-now-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 999px;
    padding: 0.9rem 1.25rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s, opacity 0.2s;
}

.primary-btn {
    border: none;
    background: linear-gradient(135deg, var(--primary), #0ea5e9);
    color: white;
    box-shadow: 0 16px 34px rgba(59, 130, 246, 0.22);
}

.primary-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
}

.secondary-btn {
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
}

.buy-now-btn {
    width: 100%;
    border: 1px solid rgba(16, 185, 129, 0.35);
    background: rgba(16, 185, 129, 0.1);
    color: #047857;
}

.primary-btn:hover,
.secondary-btn:hover,
.buy-now-btn:hover:not(:disabled),
.thumb:hover {
    transform: translateY(-1px);
}

.buy-now-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.breadcrumb a {
    color: inherit;
    text-decoration: none;
}

.breadcrumb a:hover {
    color: var(--primary);
}

.product-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(330px, 0.85fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.gallery-card,
.purchase-card,
.detail-card,
.related-section {
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
}

.gallery-card,
.purchase-card,
.detail-card,
.related-section {
    border-radius: 1.5rem;
}

.gallery-card {
    padding: 1rem;
}

.main-image {
    aspect-ratio: 1 / 1;
    border-radius: 1.25rem;
    overflow: hidden;
    background: rgba(59, 130, 246, 0.05);
}

.main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.thumb-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.9rem;
}

.thumb {
    width: 74px;
    height: 74px;
    border-radius: 1rem;
    padding: 0;
    border: 2px solid transparent;
    background: transparent;
    cursor: pointer;
    overflow: hidden;
}

.thumb.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.purchase-card {
    padding: 1.25rem;
    position: sticky;
    top: 6rem;
}

.purchase-top {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-items: center;
    margin-bottom: 0.8rem;
}

.category-badge,
.stock-pill,
.discount-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 999px;
    padding: 0.45rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 700;
}

.category-badge {
    background: rgba(59, 130, 246, 0.12);
    color: var(--primary);
}

.stock-pill.in-stock {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.stock-pill.out-stock {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
}

.purchase-card h1 {
    margin: 0 0 0.75rem;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1.08;
    letter-spacing: -0.04em;
}

.rating-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
}

.stars {
    display: inline-flex;
    gap: 0.2rem;
    color: #f59e0b;
}

.price-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.9rem;
}

.price-stack {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.7rem;
}

.price-stack strong {
    font-size: clamp(1.8rem, 4vw, 2.7rem);
    letter-spacing: -0.04em;
    color: var(--text);
}

.price-stack span {
    color: var(--text-muted);
    text-decoration: line-through;
}

.discount-pill {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
}

.short-description {
    color: var(--text-muted);
    line-height: 1.75;
    margin-bottom: 1rem;
}

.trust-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.trust-item {
    display: grid;
    gap: 0.4rem;
    place-items: center;
    padding: 0.85rem 0.7rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid var(--border);
    text-align: center;
}

.trust-item i {
    color: var(--primary);
    font-size: 1.1rem;
}

.trust-item span {
    font-size: 0.84rem;
    color: var(--text);
    line-height: 1.35;
}

.quantity-row {
    display: grid;
    grid-template-columns: minmax(160px, 0.6fr) minmax(0, 1fr);
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.qty-control {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    border-radius: 999px;
    padding: 0.45rem;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.75);
}

.qty-control button {
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.08);
    color: var(--primary);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
}

.qty-control button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.qty-control span {
    min-width: 2rem;
    text-align: center;
    font-weight: 800;
}

.primary-btn {
    width: 100%;
}

.toast-success {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin-top: 0.8rem;
    padding: 0.8rem 0.95rem;
    border-radius: 1rem;
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    font-size: 0.92rem;
    font-weight: 600;
}

.meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
}

.meta-card {
    padding: 0.9rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.05);
}

.meta-card span {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--text-muted);
    font-size: 0.84rem;
}

.meta-card strong {
    font-size: 0.95rem;
}

.details-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.75fr);
    gap: 1rem;
    margin-bottom: 1rem;
}

.detail-card {
    padding: 1.25rem;
}

.detail-card.wide {
    min-height: 100%;
}

.section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
}

.section-head h2 {
    margin: 0;
    font-size: 1.2rem;
}

.section-head span {
    color: var(--text-muted);
    font-size: 0.88rem;
    white-space: nowrap;
}

.description-text {
    color: var(--text);
    line-height: 1.8;
    margin-bottom: 1rem;
}

.feature-list {
    display: grid;
    gap: 0.7rem;
}

.feature-item {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
}

.feature-item i {
    color: #047857;
    margin-top: 0.15rem;
}

.spec-list {
    display: grid;
    gap: 0.75rem;
}

.spec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0.9rem;
    border-radius: 1rem;
    background: rgba(59, 130, 246, 0.05);
}

.spec-row span {
    color: var(--text-muted);
}

.related-section {
    padding: 1.25rem;
}

.related-loading,
.related-empty {
    display: grid;
    place-items: center;
    gap: 0.6rem;
    min-height: 200px;
    color: var(--text-muted);
    text-align: center;
}

.related-loading i,
.related-empty i {
    font-size: 1.8rem;
    color: var(--primary);
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
}

@keyframes shimmer {
    0% {
        background-position: 100% 0;
    }
    100% {
        background-position: -100% 0;
    }
}

@media (max-width: 1180px) {
    .product-hero,
    .details-grid,
    .skeleton-grid {
        grid-template-columns: 1fr;
    }

    .purchase-card {
        position: static;
    }

    .related-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 760px) {
    .product-detail-page {
        padding: 0 0.75rem 1.5rem;
    }

    .gallery-card,
    .purchase-card,
    .detail-card,
    .related-section,
    .error-card {
        border-radius: 1.25rem;
    }

    .trust-grid,
    .meta-grid {
        grid-template-columns: 1fr;
    }

    .quantity-row {
        grid-template-columns: 1fr;
    }

    .related-grid {
        grid-template-columns: 1fr;
    }

    .price-row {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
