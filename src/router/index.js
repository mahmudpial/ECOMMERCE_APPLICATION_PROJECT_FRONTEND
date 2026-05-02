import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/admin/Login.vue'
import DashboardView from '@/views/admin/Dashboard.vue'
import ProductIndex from '@/components/admin/ProductIndex.vue'
import CategoriesIndex from '@/components/admin/CategoriesIndex.vue'
import BrandsIndex from '@/components/admin/BrandsIndex.vue'
import OrdersIndex from '@/components/admin/OrdersIndex.vue'
import UsersIndex from '@/components/admin/UsersIndex.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/admin/login',
    name: 'admin.login',
    component: LoginView,
    meta: { requireGuest: true },
  },
  {
    path: '/admin/dashboard',
    name: 'admin.dashboard',
    component: DashboardView,
    meta: { requireAuth: true },
  },
  {
    path: '/admin/product-manage',
    name: 'admin.product-manage',
    component: ProductIndex,
    meta: { requireAuth: true },
  },
  {
    path: '/admin/categories',
    name: 'admin.categories',
    component: CategoriesIndex,
    meta: { requireAuth: true },
  },
  {
    path: '/admin/brands',
    name: 'admin.brands',
    component: BrandsIndex,
    meta: { requireAuth: true },
  },
  {
    path: '/admin/orders',
    name: 'admin.orders',
    component: OrdersIndex,
    meta: { requireAuth: true },
  },
  {
    path: '/admin/users',
    name: 'admin.users',
    component: UsersIndex,
    meta: { requireAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requireAuth && !isAuthenticated) {
    return '/admin/login'
  }
  if (to.meta.requireGuest && isAuthenticated) {
    return '/admin/dashboard'
  }

  return true
})

export default router
