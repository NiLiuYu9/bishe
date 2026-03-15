import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'api',
        name: 'ApiList',
        component: () => import('@/views/api/list.vue'),
        meta: { title: 'API市场' }
      },
      {
        path: 'api/:id',
        name: 'ApiDetail',
        component: () => import('@/views/api/detail.vue'),
        meta: { title: 'API详情' }
      },
      {
        path: 'api/test/:id',
        name: 'ApiTest',
        component: () => import('@/views/api/test.vue'),
        meta: { title: 'API测试', requiresAuth: true }
      },
      {
        path: 'requirement',
        name: 'RequirementList',
        component: () => import('@/views/requirement/list.vue'),
        meta: { title: '需求广场' }
      },
      {
        path: 'requirement/:id',
        name: 'RequirementDetail',
        component: () => import('@/views/requirement/detail.vue'),
        meta: { title: '需求详情' }
      },
      {
        path: 'user',
        name: 'UserCenter',
        component: () => import('@/layouts/UserLayout.vue'),
        meta: { title: '用户中心', requiresAuth: true },
        children: [
          {
            path: 'my-apis',
            name: 'MyApis',
            component: () => import('@/views/user/my-apis.vue'),
            meta: { title: '我的API' }
          },
          {
            path: 'favorites',
            name: 'MyFavorites',
            component: () => import('@/views/user/favorites.vue'),
            meta: { title: '我的收藏' }
          },
          {
            path: 'orders',
            name: 'MyOrders',
            component: () => import('@/views/user/orders.vue'),
            meta: { title: '我的订单' }
          },
          {
            path: 'quota',
            name: 'MyQuota',
            component: () => import('@/views/user/quota.vue'),
            meta: { title: '我的调用次数' }
          },
          {
            path: 'my-requirements',
            name: 'MyRequirements',
            component: () => import('@/views/user/my-requirements.vue'),
            meta: { title: '我的需求' }
          },
          {
            path: 'statistics',
            name: 'MyStatistics',
            component: () => import('@/views/user/statistics.vue'),
            meta: { title: '统计分析' }
          },
          {
            path: 'profile',
            name: 'Profile',
            component: () => import('@/views/user/profile.vue'),
            meta: { title: '个人资料' }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'apis',
        name: 'AdminApis',
        component: () => import('@/views/admin/apis.vue'),
        meta: { title: 'API管理' }
      },
      {
        path: 'api-types',
        name: 'AdminApiTypes',
        component: () => import('@/views/admin/api-types.vue'),
        meta: { title: 'API分类管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'requirements',
        name: 'AdminRequirements',
        component: () => import('@/views/admin/requirements.vue'),
        meta: { title: '需求管理' }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/statistics.vue'),
        meta: { title: '平台统计' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title || 'API交易平台'} - API Market`
  
  const userStore = useUserStore()
  
  if (userStore.isLoggedIn) {
    if (to.name === 'Login' || to.name === 'Register') {
      next({ name: 'Home' })
      return
    }
  } else {
    const stored = localStorage.getItem('userInfo')
    if (stored && to.meta.requiresAuth) {
      const isValid = await userStore.validateSession()
      if (!isValid) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
    }
  }
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  if (to.meta.requiresAdmin) {
    if (!userStore.userInfo || userStore.userInfo.isAdmin !== 1) {
      next({ name: 'Home' })
      return
    }
  }
  
  next()
})

export default router
