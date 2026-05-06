<template>
    <div class="product-card">
        <router-link :to="`/product/${product.id}`">
            <img :src="product.image || 'https://via.placeholder.com/200'" :alt="product.name" />
            <h3>{{ product.name }}</h3>
            <p class="price">৳{{ product.price }}</p>
        </router-link>
        <button @click="addToCart" class="btn-primary">Add to Cart</button>
    </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
const props = defineProps(['product'])
const cart = useCartStore()
const addToCart = () => cart.addItem(props.product)
</script>

<style scoped>
.product-card {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
}

.product-card img {
    max-width: 100%;
    height: auto;
    border-radius: 0.25rem;
}

.price {
    color: var(--primary);
    font-weight: bold;
    margin: 0.5rem 0;
}

.btn-primary {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
}
</style>