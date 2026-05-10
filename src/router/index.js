import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/admin/Login.vue'
import AdminMaster from '@/layout/AdminMaster.vue'
import DashboardView from '@/views/admin/Dashboard.vue'
import ProductIndex from '@/components/admin/ProductIndex.vue'
import CategoriesIndex from '@/components/admin/CategoriesIndex.vue'
import BrandsIndex from '@/components/admin/BrandsIndex.vue'
import OrdersIndex from '@/components/admin/OrdersIndex.vue'
import UsersIndex from '@/components/admin/UsersIndex.vue'
import ReportsIndex from '@/components/admin/ReportsIndex.vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customerAuth'

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
      { path: 'reports', name: 'admin.reports', component: ReportsIndex },
    ],
  },

  // Customer routes
  {
    path: '/',
    component: () => import('@/layout/CustomerLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/customer/Home.vue') },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/customer/Products.vue'),
      },
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

// Combined navigation guard – updated for Vue Router 4 (return values instead of calling next)
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const customerAuth = useCustomerAuthStore()
  const isAdminAuthenticated = authStore.isAuthenticated
  const isCustomerAuthenticated = customerAuth.isAuthenticated

  // Admin guest guard (trying to access login page while already logged in)
  if (to.meta.requireGuest && isAdminAuthenticated) {
    return '/admin/dashboard'
  }

  // Admin auth guard (requires authentication but not logged in)
  if (to.meta.requireAuth && !isAdminAuthenticated) {
    return '/admin/login'
  }

  // Customer auth guard (routes like checkout, profile, orders)
  if (to.meta.requiresAuth && !isCustomerAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // Customer guest guard (login/register pages when already logged in)
  if ((to.path === '/login' || to.path === '/register') && isCustomerAuthenticated) {
    return '/profile'
  }

  // Allow navigation
  return undefined
})

export default router
