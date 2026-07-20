import { createRouter, createWebHistory } from 'vue-router'
import LoginLayout from '@/layouts/LoginLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { getToken } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'taskline',
        name: 'TaskLine',
        component: () => import('@/views/TaskLine.vue'),
      },
      {
        path: 'charts',
        name: 'Charts',
        component: () => import('@/views/ChartsView.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const isAuthenticated = () => !!getToken()

router.beforeEach((to, _from, next) => {
  const publicRoutes = ['Login', 'Register', 'abc']

  if (publicRoutes.includes(to.name as string)) {
    if (isAuthenticated()) {
      return next({ name: 'Dashboard' })
    }
    return next()
  }

  if (!isAuthenticated()) {
    return next({ name: 'Login' })
  }

  next()
})

export default router
