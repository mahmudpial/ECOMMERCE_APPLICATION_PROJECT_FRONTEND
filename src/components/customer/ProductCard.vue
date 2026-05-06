<template>
    <div class="product-card">
        <router-link :to="`/product/${product.id}`" class="image-link">
            <img :src="getProductImage(product)" :alt="product.name" loading="lazy" />
        </router-link>
        <div class="product-info">
            <router-link :to="`/product/${product.id}`" class="title">{{ product.name }}</router-link>
            <p class="price">৳{{ product.price }}</p>
            <button class="add-to-cart" @click="addToCart">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'

const props = defineProps(['product'])
const cartStore = useCartStore()

const getProductImage = (product) => {
    let images = product.images
    if (typeof images === 'string' && images.trim().startsWith('[')) {
        try {
            images = JSON.parse(images)
        } catch (e) {
            /* If parsing fails, fallback to original string */

        }
    }
    if (Array.isArray(images) && images.length) return images[0]
    if (typeof images === 'string' && images.trim()) return images
    return 'https://via.placeholder.com/300?text=No+Image'
}

const addToCart = () => {
    cartStore.addItem(props.product)
}
</script>

<style scoped>
.product-card {
    background: var(--card);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.image-link {
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
}

.product-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.product-card:hover img {
    transform: scale(1.05);
}

.product-info {
    padding: 1rem;
}

.title {
    font-weight: 600;
    color: var(--text);
    text-decoration: none;
    display: block;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.title:hover {
    color: var(--primary);
}

.price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.75rem;
}

.add-to-cart {
    width: 100%;
    padding: 0.5rem;
    background: var(--primary);
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.add-to-cart:hover {
    background: var(--primary-hover);
}

@media (max-width: 640px) {
    .product-info {
        padding: 0.75rem;
    }

    .price {
        font-size: 1rem;
    }

    .title {
        font-size: 0.9rem;
    }
}
</style>