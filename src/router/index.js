import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/admin/Login.vue'
import AdminMaster from '@/layout/AdminMaster.vue'
import DashboardView from '@/views/admin/Dashboard.vue'
import ProductIndex from '@/components/admin/ProductIndex.vue'
import CategoriesIndex from '@/components/admin/CategoriesIndex.vue'
import BrandsIndex from '@/components/admin/BrandsIndex.vue'
import OrdersIndex from '@/components/admin/OrdersIndex.vue'
import UsersIndex from '@/components/admin/UsersIndex.vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customerAuth' // ✅ added import

const routes = [
  // Admin routes
  {
    path: '/admin/login',
    name: 'admin.login',
    component: LoginView,
    meta: { requireGuest: true },
  },
  {
    path: '/admin',
    component: AdminMaster,
    meta: { requireAuth: true },
    children: [
      { path: 'dashboard', name: 'admin.dashboard', component: DashboardView },
      { path: 'product-manage', name: 'admin.products', component: ProductIndex },
      { path: 'categories', name: 'admin.categories', component: CategoriesIndex },
      { path: 'brands', name: 'admin.brands', component: BrandsIndex },
      { path: 'orders', name: 'admin.orders', component: OrdersIndex },
      { path: 'users', name: 'admin.users', component: UsersIndex },
      // { path: '', redirect: 'dashboard' }, // optional redirect
    ],
  },

  // Customer routes (storefront)
  {
    path: '/',
    component: () => import('@/layout/CustomerLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/customer/Home.vue') },
      {
        path: 'product/:id',
        name: 'product.detail',
        component: () => import('@/views/customer/ProductDetail.vue'),
      },
      { path: 'cart', name: 'cart', component: () => import('@/views/customer/Cart.vue') },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/views/customer/Checkout.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'order/success',
        name: 'order.success',
        component: () => import('@/views/customer/OrderSuccess.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/customer/Login.vue'),
        meta: { requiresGuest: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/customer/Register.vue'),
        meta: { requiresGuest: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/customer/Profile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/customer/OrderHistory.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Combined navigation guard for both admin and customer
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const customerAuth = useCustomerAuthStore()
  const isAdminAuthenticated = authStore.isAuthenticated
  const isCustomerAuthenticated = customerAuth.isAuthenticated

  // Admin guest guard (login page)
  if (to.meta.requireGuest && isAdminAuthenticated) {
    return next('/admin/dashboard')
  }
  // Admin auth guard
  if (to.meta.requireAuth && !isAdminAuthenticated) {
    return next('/admin/login')
  }

  // Customer auth guard (for routes like checkout, profile, orders)
  if (to.meta.requiresAuth && !isCustomerAuthenticated) {
    return next('/login')
  }
  // Customer guest guard (login/register pages)
  if ((to.path === '/login' || to.path === '/register') && isCustomerAuthenticated) {
    return next('/profile')
  }

  next()
})

export default router
