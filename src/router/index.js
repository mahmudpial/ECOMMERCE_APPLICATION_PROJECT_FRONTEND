import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/admin/Login.vue'
import AdminMaster from '@/components/admin/AdminMaster.vue' // My layout

// Page components (without layout wrapper)
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
    path: '/admin',
    component: AdminMaster,
    meta: { requireAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin.dashboard',
        component: DashboardView,
      },
      {
        path: 'product-manage',
        name: 'admin.product-manage',
        component: ProductIndex,
      },
      {
        path: 'categories',
        name: 'admin.categories',
        component: CategoriesIndex,
      },
      {
        path: 'brands',
        name: 'admin.brands',
        component: BrandsIndex,
      },
      {
        path: 'orders',
        name: 'admin.orders',
        component: OrdersIndex,
      },
      {
        path: 'Users',
        name: 'admin.users',
        component: UsersIndex,
      },
      { path: '', redirect: 'dashboard' }, // /admin redirects to dashboard
    ],
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
