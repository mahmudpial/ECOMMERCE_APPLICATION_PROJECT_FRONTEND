<template>
    <div class="product-card">
        <div v-if="hasDiscount" class="discount-badge">−{{ discountPercent }}%</div>
        <router-link :to="`/product/${product.id}`" class="image-link">
            <img :src="getProductImage(product)" :alt="product.name" loading="lazy" />
        </router-link>
        <div class="product-info">
            <router-link :to="`/product/${product.id}`" class="title">{{ product.name }}</router-link>
            <div class="price-row">
                <p class="price">৳{{ formatMoney(displayPrice) }}</p>
                <span v-if="hasDiscount" class="old-price">৳{{ formatMoney(originalPrice) }}</span>
            </div>
            <button class="add-to-cart" @click="addToCart">
                <span>Add to Cart</span>
                <span class="arrow">→</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { formatMoney, getEffectiveProductPrice } from '@/utils/customerCommerce'

const props = defineProps(['product'])
const cartStore = useCartStore()

const displayPrice = computed(() => getEffectiveProductPrice(props.product))
const originalPrice = computed(() => {
    const regular = Number(props.product?.price || 0)
    const discounted = Number(props.product?.discount_price || 0)
    return discounted > 0 && discounted < regular ? regular : 0
})
const hasDiscount = computed(() => originalPrice.value > displayPrice.value)
const discountPercent = computed(() => {
    if (!hasDiscount.value || !originalPrice.value) return 0
    return Math.round(((originalPrice.value - displayPrice.value) / originalPrice.value) * 100)
})

const getProductImage = (product) => {
    let images = product.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try {
            images = JSON.parse(images)
        } catch (e) { /* fallback */ }
    }
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string' && images.trim()) return images
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
}

const addToCart = () => {
    cartStore.addItem(props.product)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* Light mode (default) – uses same variables as other pages */
.product-card {
    --bg-card: #FFFFFF;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #EAEAEA;
    --border-input: #CCCCCC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --shadow-sm: 0 12px 24px rgba(0, 0, 0, 0.05);
}

/* Dark mode – inherits from parent .dark class */
.dark .product-card {
    --bg-card: #1A1E26;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --shadow-sm: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.product-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-sm);
    border-color: var(--border-input);
}

.image-link {
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1.04;
    background: var(--bg-card);
}

.product-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.product-card:hover img {
    transform: scale(1.02);
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem 1rem 1.2rem;
}

.title {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.35;
    color: var(--text-primary);
    text-decoration: none;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s;
}

.title:hover {
    color: var(--accent);
}

.price-row {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    flex-wrap: wrap;
}

.price {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    margin: 0;
}

.old-price {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem;
    color: var(--text-muted);
    text-decoration: line-through;
}

.add-to-cart {
    width: 100%;
    margin-top: 0.25rem;
    background: none;
    border: 1px solid var(--border-input);
    border-radius: 40px;
    padding: 0.7rem 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 1rem;
    padding-right: 1rem;
    transition: all 0.2s;
}

.add-to-cart .arrow {
    font-size: 0.9rem;
    transition: transform 0.2s;
    color: var(--text-primary);
}

.add-to-cart:hover {
    background: var(--accent);
    border-color: var(--accent);
    color: #FFFFFF;
}

.add-to-cart:hover .arrow {
    transform: translateX(3px);
    color: #FFFFFF;
}

.discount-badge {
    position: absolute;
    top: 0.8rem;
    left: 0.8rem;
    z-index: 2;
    background: var(--accent);
    color: #FFFFFF;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 30px;
    letter-spacing: 0.03em;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 640px) {
    .product-info {
        padding: 0.8rem;
        gap: 0.5rem;
    }

    .title {
        font-size: 0.9rem;
    }

    .price {
        font-size: 0.95rem;
    }

    .add-to-cart {
        padding: 0.6rem 0.8rem;
        font-size: 0.75rem;
    }
}
</style>