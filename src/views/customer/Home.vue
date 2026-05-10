<template>
    <div class="home">

        <!-- ░░ HERO ░░ -->
        <section class="hero">
            <div class="hero__copy">
                <div class="hero__label">
                    <span class="label-dot"></span>
                    New arrivals · {{ currentYear }}
                </div>
                <h1 class="hero__heading">
                    Shop smarter.<br>
                    <span class="hero__heading-accent">Live better.</span>
                </h1>
                <p class="hero__sub">
                    Curated products, transparent pricing, and a checkout
                    experience that actually feels good.
                </p>
                <div class="hero__actions">
                    <router-link to="/products" class="btn-primary">
                        Browse the store
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </router-link>
                    <router-link to="/products?sort=popular" class="btn-outline">
                        What's trending
                    </router-link>
                </div>
                <div class="hero__stats">
                    <div class="stat">
                        <span class="stat__num">12k+</span>
                        <span class="stat__label">Customers</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat">
                        <span class="stat__num">4.9</span>
                        <span class="stat__label">Avg rating</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat">
                        <span class="stat__num">99%</span>
                        <span class="stat__label">Satisfaction</span>
                    </div>
                </div>
            </div>

            <div class="hero__visual">
                <div class="hero__img-wrap">
                    <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80&auto=format"
                        alt="Shopping" class="hero__img" />
                    <!-- Floating card -->
                    <div class="hero__card hero__card--top">
                        <div class="hcard__icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <p class="hcard__title">Secure checkout</p>
                            <p class="hcard__sub">SSL encrypted</p>
                        </div>
                    </div>
                    <div class="hero__card hero__card--bottom">
                        <div class="hcard__icon hcard__icon--green">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div>
                            <p class="hcard__title">Free delivery</p>
                            <p class="hcard__sub">Orders over ৳500</p>
                        </div>
                    </div>
                </div>
                <!-- Trust pills -->
                <div class="hero__trust">
                    <span class="trust-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Easy returns
                    </span>
                    <span class="trust-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        24/7 support
                    </span>
                    <span class="trust-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Best prices
                    </span>
                </div>
            </div>
        </section>

        <!-- ░░ CATEGORIES ░░ -->
        <section class="section">
            <div class="section__head">
                <div class="section__titles">
                    <p class="section__kicker">Browse</p>
                    <h2 class="section__title">Shop by Category</h2>
                </div>
                <router-link to="/products" class="link-arrow">
                    View all
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </router-link>
            </div>

            <div v-if="categoriesLoading" class="cats-row">
                <div v-for="n in 6" :key="n" class="skel skel--cat"></div>
            </div>
            <div v-else class="cats-row">
                <router-link v-for="(cat, i) in categories" :key="cat.id" :to="`/products?category=${cat.id}`"
                    class="cat-tile" :style="{ '--i': i }">
                    <div class="cat-tile__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.6">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                    </div>
                    <span class="cat-tile__name">{{ cat.name }}</span>
                    <span class="cat-tile__count">{{ cat.products_count || 0 }} items</span>
                </router-link>
            </div>
        </section>

        <!-- ░░ FEATURED ░░ -->
        <section class="section">
            <div class="section__head">
                <div class="section__titles">
                    <p class="section__kicker">Handpicked</p>
                    <h2 class="section__title">Featured Products</h2>
                </div>
                <router-link to="/products?featured=1" class="link-arrow">
                    See all
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </router-link>
            </div>
            <div v-if="featuredLoading" class="products-grid">
                <div v-for="n in 4" :key="n" class="skel skel--card"></div>
            </div>
            <p v-else-if="featuredProducts.length === 0" class="empty">No featured products yet.</p>
            <div v-else class="products-grid">
                <ProductCard v-for="(p, i) in featuredProducts" :key="p.id" :product="p" class="card-reveal"
                    :style="{ '--i': i }" />
            </div>
        </section>

        <!-- ░░ LATEST ░░ -->
        <section class="section section--alt">
            <div class="section__head">
                <div class="section__titles">
                    <p class="section__kicker">Just in</p>
                    <h2 class="section__title">Latest Arrivals</h2>
                </div>
                <router-link to="/products?sort=latest" class="link-arrow">
                    See all
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </router-link>
            </div>
            <div v-if="latestLoading" class="products-grid">
                <div v-for="n in 4" :key="n" class="skel skel--card"></div>
            </div>
            <p v-else-if="latestProducts.length === 0" class="empty">No new arrivals yet.</p>
            <div v-else class="products-grid">
                <ProductCard v-for="(p, i) in latestProducts" :key="p.id" :product="p" class="card-reveal"
                    :style="{ '--i': i }" />
            </div>
        </section>

        <!-- ░░ POPULAR ░░ -->
        <section class="section">
            <div class="section__head">
                <div class="section__titles">
                    <p class="section__kicker">Trending now</p>
                    <h2 class="section__title">Most Popular</h2>
                </div>
                <router-link to="/products?sort=popular" class="link-arrow">
                    See all
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </router-link>
            </div>
            <div v-if="popularLoading" class="products-grid">
                <div v-for="n in 4" :key="n" class="skel skel--card"></div>
            </div>
            <p v-else-if="popularProducts.length === 0" class="empty">Nothing trending yet.</p>
            <div v-else class="products-grid">
                <ProductCard v-for="(p, i) in popularProducts" :key="p.id" :product="p" class="card-reveal"
                    :style="{ '--i': i }" />
            </div>
        </section>

        <!-- ░░ NEWSLETTER ░░ -->
        <section class="newsletter">
            <div class="newsletter__bg-grid"></div>
            <div class="newsletter__content">
                <div class="newsletter__copy">
                    <p class="nl-kicker">Stay updated</p>
                    <h2 class="nl-title">Get the latest drops<br>straight to your inbox.</h2>
                    <p class="nl-sub">New arrivals, exclusive deals, and member-only offers. No spam, ever.</p>
                </div>
                <form class="nl-form" @submit.prevent="subscribeNewsletter">
                    <div class="nl-input-wrap">
                        <svg class="nl-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input v-model="newsletterEmail" type="email" placeholder="your@email.com" required
                            class="nl-input" />
                    </div>
                    <button type="submit" class="nl-btn" :disabled="newsletterLoading">
                        {{ newsletterLoading ? 'Subscribing…' : 'Subscribe' }}
                    </button>
                </form>
                <Transition name="t-msg">
                    <p v-if="newsletterMessage" class="nl-msg" :class="newsletterError ? 'nl-msg--err' : 'nl-msg--ok'">
                        {{ newsletterMessage }}
                    </p>
                </Transition>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import ProductCard from '@/components/customer/ProductCard.vue'

const currentYear = new Date().getFullYear()

const categories = ref([])
const categoriesLoading = ref(true)
const featuredProducts = ref([])
const featuredLoading = ref(true)
const latestProducts = ref([])
const latestLoading = ref(true)
const popularProducts = ref([])
const popularLoading = ref(true)
const newsletterEmail = ref('')
const newsletterLoading = ref(false)
const newsletterMessage = ref('')
const newsletterError = ref(false)

const fetchCategories = async () => {
    try { const r = await api.get('categories'); categories.value = r.data.data || [] }
    catch (e) { console.error(e) }
    finally { categoriesLoading.value = false }
}
const fetchFeatured = async () => {
    try { const r = await api.get('products/featured'); featuredProducts.value = r.data.data || [] }
    catch (e) { console.error(e) }
    finally { featuredLoading.value = false }
}
const fetchLatest = async () => {
    try { const r = await api.get('products/latest'); latestProducts.value = r.data.data || [] }
    catch (e) { console.error(e) }
    finally { latestLoading.value = false }
}
const fetchPopular = async () => {
    try { const r = await api.get('products/popular'); popularProducts.value = r.data.data || [] }
    catch (e) { console.error(e) }
    finally { popularLoading.value = false }
}

const subscribeNewsletter = async () => {
    newsletterLoading.value = true
    newsletterMessage.value = ''
    newsletterError.value = false
    try {
        await api.post('newsletter/subscribe', { email: newsletterEmail.value })
        newsletterMessage.value = '✓ Subscribed! Welcome aboard.'
        newsletterEmail.value = ''
        setTimeout(() => { newsletterMessage.value = '' }, 4000)
    } catch (e) {
        newsletterError.value = true
        newsletterMessage.value = e.response?.data?.message || 'Something went wrong. Try again.'
    } finally {
        newsletterLoading.value = false
    }
}

onMounted(() => {
    fetchCategories()
    fetchFeatured()
    fetchLatest()
    fetchPopular()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap');

/* Light mode (default) – matches other pages */
.home {
    --bg-page: #F5F7FA;
    --bg-card: #FFFFFF;
    --bg-card-soft: #F8FAFC;
    --text-primary: #1A2A3A;
    --text-secondary: #5A6A7A;
    --text-muted: #7A8A9A;
    --border-light: #E8ECF0;
    --border-input: #CCD4DC;
    --accent: #0066FF;
    --accent-soft: #F0F7FF;
    --accent-dim: rgba(0, 102, 255, 0.08);
    --accent-mid: rgba(0, 102, 255, 0.14);
    --success: #10B981;
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.02);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.04);
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Dark mode – triggered by parent .dark class */
.home.dark {
    --bg-page: #0F1218;
    --bg-card: #1A1E26;
    --bg-card-soft: #2A2F3A;
    --text-primary: #E8EDF2;
    --text-secondary: #9AA8B8;
    --text-muted: #6B7A8A;
    --border-light: #2A2F3A;
    --border-input: #3A4050;
    --accent: #3B82F6;
    --accent-soft: #1E2A3A;
    --accent-dim: rgba(59, 130, 246, 0.08);
    --accent-mid: rgba(59, 130, 246, 0.14);
}

.home {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg-page);
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Buttons */
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.72rem 1.4rem;
    border-radius: 40px;
    background: var(--accent);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s, transform 0.15s;
    white-space: nowrap;
}

.btn-primary:hover {
    opacity: 0.87;
    transform: translateY(-1px);
}

.btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.72rem 1.35rem;
    border-radius: 40px;
    border: 1.5px solid var(--border-input);
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.btn-outline:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
}

/* Section shell */
.section {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 20px;
    padding: clamp(1.4rem, 3vw, 2rem);
    animation: reveal 0.5s var(--ease) both;
}

.section--alt {
    background: var(--bg-card-soft);
}

.section__head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 1.4rem;
    gap: 1rem;
}

.section__titles {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.section__kicker {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    margin: 0;
}

.section__title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.15rem, 2.2vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.15;
}

.link-arrow {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    padding: 0.38rem 0.85rem;
    border-radius: 40px;
    border: 1px solid var(--accent-mid);
    background: var(--accent-dim);
    transition: background 0.14s, transform 0.14s;
}

.link-arrow:hover {
    background: var(--accent-mid);
    transform: translateX(2px);
}

/* Hero */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    align-items: center;
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.75rem);
    position: relative;
    overflow: hidden;
    animation: reveal 0.55s var(--ease) both;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--accent);
    border-radius: 2px 2px 0 0;
}

.hero__label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
    margin-bottom: 1.1rem;
}

.label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: blink 2s ease-in-out infinite;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: .4;
        transform: scale(.7);
    }
}

.hero__heading {
    font-family: 'Sora', sans-serif;
    font-size: clamp(2rem, 4.5vw, 3.4rem);
    font-weight: 700;
    line-height: 1.07;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    margin: 0 0 1.1rem;
}

.hero__heading-accent {
    color: var(--accent);
}

.hero__sub {
    font-size: 0.975rem;
    line-height: 1.72;
    color: var(--text-secondary);
    margin: 0 0 1.65rem;
    max-width: 42ch;
}

.hero__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
}

.hero__stats {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.stat {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.stat__num {
    font-family: 'Sora', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.stat__label {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.stat-divider {
    width: 1px;
    height: 28px;
    background: var(--border-light);
}

.hero__visual {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.hero__img-wrap {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border-light);
}

.hero__img {
    width: 100%;
    height: 380px;
    object-fit: cover;
    display: block;
    transition: transform 0.55s ease;
}

.hero__img-wrap:hover .hero__img {
    transform: scale(1.03);
}

.hero__card {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 0.65rem 0.9rem;
    box-shadow: var(--shadow-md);
}

.hero__card--top {
    top: 1rem;
    left: 1rem;
    animation: floatUp 4s ease-in-out infinite;
}

.hero__card--bottom {
    bottom: 1rem;
    right: 1rem;
    animation: floatUp 4s ease-in-out infinite 2s;
}

@keyframes floatUp {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-6px);
    }
}

.hcard__icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--accent-dim);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.hcard__icon--green {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
}

.hcard__title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
}

.hcard__sub {
    font-size: 0.68rem;
    color: var(--text-muted);
    margin: 0.1rem 0 0;
}

.hero__trust {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.trust-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding: 0.35rem 0.75rem;
    border-radius: 40px;
    border: 1px solid var(--border-light);
    background: var(--bg-card-soft);
}

.trust-pill svg {
    color: var(--success);
    flex-shrink: 0;
}

/* Categories */
.cats-row {
    display: flex;
    gap: 0.85rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding: 0.25rem 0.25rem 0.5rem;
}

.cats-row::-webkit-scrollbar {
    display: none;
}

.cat-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
    scroll-snap-align: start;
    width: 120px;
    padding: 1.2rem 0.75rem;
    border-radius: 16px;
    border: 1px solid var(--border-light);
    background: var(--bg-card-soft);
    text-decoration: none;
    color: var(--text-primary);
    transition: transform 0.2s var(--ease), border-color 0.2s, background 0.2s;
    animation: reveal 0.4s var(--ease) both;
    animation-delay: calc(var(--i, 0) * 55ms);
}

.cat-tile:hover {
    transform: translateY(-3px);
    border-color: var(--accent);
    background: var(--accent-dim);
}

.cat-tile__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    transition: background 0.18s, border-color 0.18s;
}

.cat-tile:hover .cat-tile__icon {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
}

.cat-tile__name {
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
    color: var(--text-primary);
    line-height: 1.3;
}

.cat-tile__count {
    font-size: 0.67rem;
    color: var(--text-muted);
    font-weight: 500;
}

/* Products grid */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 1rem;
}

.card-reveal {
    animation: reveal 0.4s var(--ease) both;
    animation-delay: calc(var(--i, 0) * 65ms);
}

/* Skeletons */
.skel {
    background: linear-gradient(90deg, var(--bg-card-soft) 25%, var(--border-light) 50%, var(--bg-card-soft) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 16px;
}

.skel--cat {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.skel--card {
    height: 260px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.empty {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
    font-size: 0.875rem;
}

/* Newsletter */
.newsletter {
    position: relative;
    border-radius: 24px;
    background: var(--text-primary);
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.5rem);
    overflow: hidden;
    animation: reveal 0.5s var(--ease) both;
}

.home.dark .newsletter {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
}

.newsletter__bg-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255, 255, 255, .04) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
}

.newsletter::before {
    content: '';
    position: absolute;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-dim), transparent 70%);
    top: -120px;
    right: -60px;
    pointer-events: none;
}

.newsletter::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-dim), transparent 70%);
    bottom: -60px;
    left: -30px;
    pointer-events: none;
}

.newsletter__content {
    position: relative;
    z-index: 1;
    max-width: 520px;
    margin: 0 auto;
    text-align: center;
}

.nl-kicker {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    margin: 0 0 0.6rem;
}

.nl-title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #FAFAFA;
    margin: 0 0 0.75rem;
    line-height: 1.12;
}

.home.dark .nl-title {
    color: var(--text-primary);
}

.nl-sub {
    font-size: 0.9rem;
    line-height: 1.7;
    color: rgba(250, 250, 250, 0.55);
    margin: 0 0 1.75rem;
}

.home.dark .nl-sub {
    color: var(--text-secondary);
}

.nl-form {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
}

.nl-input-wrap {
    flex: 1;
    min-width: 220px;
    position: relative;
    display: flex;
    align-items: center;
}

.nl-input-icon {
    position: absolute;
    left: 1rem;
    color: rgba(250, 250, 250, .35);
    pointer-events: none;
}

.home.dark .nl-input-icon {
    color: var(--text-muted);
}

.nl-input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.65rem;
    border-radius: 40px;
    border: 1.5px solid rgba(255, 255, 255, .12);
    background: rgba(255, 255, 255, .07);
    color: #FAFAFA;
    font-family: inherit;
    font-size: 0.875rem;
    transition: border-color 0.18s, background 0.18s;
}

.home.dark .nl-input {
    border-color: var(--border-input);
    background: var(--bg-card-soft);
    color: var(--text-primary);
}

.nl-input::placeholder {
    color: rgba(250, 250, 250, .3);
}

.home.dark .nl-input::placeholder {
    color: var(--text-muted);
}

.nl-input:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, .1);
}

.home.dark .nl-input:focus {
    background: var(--bg-card);
}

.nl-btn {
    padding: 0.8rem 1.5rem;
    border-radius: 40px;
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
}

.nl-btn:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
}

.nl-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.nl-msg {
    margin-top: 0.9rem;
    font-size: 0.85rem;
    font-weight: 500;
}

.nl-msg--ok {
    color: #86EFAC;
}

.nl-msg--err {
    color: #FCA5A5;
}

.home.dark .nl-msg--ok {
    color: #34D399;
}

.home.dark .nl-msg--err {
    color: #F87171;
}

/* Animations */
@keyframes reveal {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.t-msg-enter-active,
.t-msg-leave-active {
    transition: opacity 0.25s;
}

.t-msg-enter-from,
.t-msg-leave-to {
    opacity: 0;
}

/* Responsive */
@media (max-width: 860px) {
    .home {
        padding: 0 1rem 1.5rem;
        gap: 1rem;
    }

    .hero {
        grid-template-columns: 1fr;
        gap: 1.75rem;
    }

    .hero__img {
        height: 280px;
    }

    .hero__card--top {
        top: 0.75rem;
        left: 0.75rem;
    }

    .hero__card--bottom {
        bottom: 0.75rem;
        right: 0.75rem;
    }

    .hero__sub {
        max-width: 100%;
    }
}

@media (max-width: 600px) {
    .hero {
        padding: 1.4rem;
        border-radius: 20px;
    }

    .hero__heading {
        font-size: 1.85rem;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
        gap: 0.75rem;
    }

    .section__head {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.6rem;
    }

    .newsletter {
        border-radius: 20px;
    }

    .nl-form {
        flex-direction: column;
    }

    .nl-btn {
        width: 100%;
    }
}
</style>