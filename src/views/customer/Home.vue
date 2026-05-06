<template>
    <div class="home">
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1>Welcome to Commercia</h1>
                <p>Discover amazing products at unbeatable prices</p>
                <router-link to="/products" class="btn-primary">Shop Now</router-link>
            </div>
            <div class="hero-image">
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600" alt="Shopping" />
            </div>
        </section>

        <!-- Categories Section -->
        <section class="categories">
            <div class="section-header">
                <h2>Shop by Category</h2>
                <p>Browse our popular categories</p>
            </div>
            <div v-if="categoriesLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div v-else class="categories-grid">
                <router-link v-for="cat in categories" :key="cat.id" :to="`/products?category=${cat.id}`"
                    class="category-card">
                    <div class="category-icon">
                        <i class="fas fa-tag"></i>
                    </div>
                    <h3>{{ cat.name }}</h3>
                    <span class="category-count">{{ cat.products_count || 0 }} products</span>
                </router-link>
            </div>
        </section>

        <!-- Featured Products -->
        <section class="products-section">
            <div class="section-header">
                <h2>Featured Products</h2>
                <p>Handpicked just for you</p>
            </div>
            <div v-if="featuredLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div v-else class="products-grid">
                <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
            </div>
        </section>

        <!-- Latest Products -->
        <section class="products-section">
            <div class="section-header">
                <h2>Latest Arrivals</h2>
                <p>New products added recently</p>
            </div>
            <div v-if="latestLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div v-else class="products-grid">
                <ProductCard v-for="product in latestProducts" :key="product.id" :product="product" />
            </div>
        </section>

        <!-- Popular Products -->
        <section class="products-section">
            <div class="section-header">
                <h2>Most Popular</h2>
                <p>What everyone is buying</p>
            </div>
            <div v-if="popularLoading" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div v-else class="products-grid">
                <ProductCard v-for="product in popularProducts" :key="product.id" :product="product" />
            </div>
        </section>

        <!-- Newsletter Section -->
        <section class="newsletter">
            <div class="newsletter-content">
                <h2>Subscribe to our Newsletter</h2>
                <p>Get the latest updates on new products and upcoming sales</p>
                <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
                    <input type="email" v-model="newsletterEmail" placeholder="Your email address" required />
                    <button type="submit" :disabled="newsletterLoading">
                        {{ newsletterLoading ? 'Subscribing...' : 'Subscribe' }}
                    </button>
                </form>
                <p v-if="newsletterMessage" class="newsletter-message">{{ newsletterMessage }}</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import ProductCard from '@/components/customer/ProductCard.vue'

// Categories
const categories = ref([])
const categoriesLoading = ref(true)

// Products
const featuredProducts = ref([])
const featuredLoading = ref(true)
const latestProducts = ref([])
const latestLoading = ref(true)
const popularProducts = ref([])
const popularLoading = ref(true)

// Newsletter
const newsletterEmail = ref('')
const newsletterLoading = ref(false)
const newsletterMessage = ref('')

const fetchCategories = async () => {
    categoriesLoading.value = true
    try {
        const res = await api.get('categories')
        categories.value = res.data.data || []
    } catch (err) {
        console.error('Failed to fetch categories', err)
    } finally {
        categoriesLoading.value = false
    }
}

const fetchFeaturedProducts = async () => {
    featuredLoading.value = true
    try {
        const res = await api.get('products/featured')
        featuredProducts.value = res.data.data || []
    } catch (err) {
        console.error(err)
    } finally {
        featuredLoading.value = false
    }
}

const fetchLatestProducts = async () => {
    latestLoading.value = true
    try {
        const res = await api.get('products/latest')
        latestProducts.value = res.data.data || []
    } catch (err) {
        console.error(err)
    } finally {
        latestLoading.value = false
    }
}

const fetchPopularProducts = async () => {
    popularLoading.value = true
    try {
        const res = await api.get('products/popular')
        popularProducts.value = res.data.data || []
    } catch (err) {
        console.error(err)
    } finally {
        popularLoading.value = false
    }
}

const subscribeNewsletter = async () => {
    newsletterLoading.value = true
    newsletterMessage.value = ''
    try {
        // If you have a newsletter endpoint, replace it. Here's a placeholder.
        await api.post('newsletter/subscribe', { email: newsletterEmail.value })
        newsletterMessage.value = 'Thank you for subscribing!'
        newsletterEmail.value = ''
        setTimeout(() => (newsletterMessage.value = ''), 3000)
    } catch (err) {
        newsletterMessage.value = err.response?.data?.message || 'Subscription failed. Try again.'
    } finally {
        newsletterLoading.value = false
    }
}

onMounted(() => {
    fetchCategories()
    fetchFeaturedProducts()
    fetchLatestProducts()
    fetchPopularProducts()
})
</script>

<style scoped>
/* Hero Section */
.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 3rem 0;
    flex-wrap: wrap;
}

.hero-content {
    flex: 1;
    min-width: 280px;
}

.hero-content h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.125rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.btn-primary {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.hero-image {
    flex: 1;
    text-align: center;
}

.hero-image img {
    max-width: 100%;
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
}

/* Categories */
.categories {
    margin: 3rem 0;
}

.section-header {
    text-align: center;
    margin-bottom: 2rem;
}

.section-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
}

.section-header p {
    color: var(--text-muted);
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.5rem;
}

.category-card {
    background: var(--card);
    padding: 1.5rem;
    text-align: center;
    border-radius: 1rem;
    box-shadow: var(--shadow);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: var(--text);
}

.category-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.category-icon {
    font-size: 2rem;
    color: var(--primary);
    margin-bottom: 0.75rem;
}

.category-card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.category-count {
    font-size: 0.8rem;
    color: var(--text-muted);
}

/* Products Sections */
.products-section {
    margin: 3rem 0;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
}

.loading-spinner {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
}

.loading-spinner i {
    font-size: 2rem;
}

/* Newsletter */
.newsletter {
    background: var(--card);
    border-radius: 1.5rem;
    padding: 3rem 2rem;
    margin: 3rem 0;
    text-align: center;
    box-shadow: var(--shadow);
}

.newsletter-content {
    max-width: 600px;
    margin: 0 auto;
}

.newsletter h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: var(--text);
}

.newsletter p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.newsletter-form {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.newsletter-form input {
    flex: 1;
    min-width: 200px;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 2rem;
    background: var(--bg);
    color: var(--text);
}

.newsletter-form input:focus {
    outline: none;
    border-color: var(--primary);
}

.newsletter-form button {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.newsletter-form button:hover:not(:disabled) {
    background: var(--primary-hover);
}

.newsletter-form button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.newsletter-message {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        text-align: center;
        padding: 2rem 0;
    }

    .hero-content h1 {
        font-size: 2rem;
    }

    .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .newsletter {
        padding: 2rem 1rem;
    }

    .newsletter h2 {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    .newsletter-form {
        flex-direction: column;
    }

    .newsletter-form button {
        width: 100%;
    }
}
</style>