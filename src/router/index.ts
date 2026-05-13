/**
 * =====================================================
 * 路由配置 —— 相当于后端的 DispatcherServlet + @RequestMapping
 * =====================================================
 *
 * 【核心概念：前端路由 vs 后端路由】
 *   - 后端路由：浏览器请求 /api/list → 服务器返回 JSON 数据（每次请求都刷新页面）
 *   - 前端路由：浏览器访问 /api → 浏览器本地切换页面组件（不刷新页面，体验更流畅）
 *   - 前端路由是"单页应用"(SPA)的核心：整个应用只有一个 HTML 页面，通过 JS 切换显示内容
 *
 * 【后端类比】
 *   - 路由配置表 routes[] 相当于后端的 @RequestMapping 注解集合
 *   - 路由守卫 beforeEach 相当于后端的 Filter/Interceptor（如 SessionInterceptor）
 *   - 路由的 children 相当于后端的嵌套路径 @RequestMapping("/user") + @GetMapping("/orders")
 *
 * 【路由嵌套结构】
 *   本项目有3层嵌套：
 *   1. 顶层路由：决定使用哪个布局（MainLayout / AdminLayout / 无布局）
 *   2. 第二层路由：布局内的具体页面（如首页、API市场、用户中心）
 *   3. 第三层路由：用户中心内的子页面（如我的API、我的订单）
 *   这就像后端的 Controller 嵌套：@RequestMapping("/user") → @GetMapping("/orders")
 *
 * 【懒加载 () => import()】
 *   所有页面组件都使用懒加载，即"访问到这个路由时才下载对应的 JS 代码"
 *   【后端类比】相当于后端的懒加载/按需加载，不用一次性加载所有页面
 *   好处：首页加载更快（只下载首页的代码，其他页面的代码用到时再下载）
 */

/**
 * createRouter —— 创建路由实例的工厂函数
 * 【后端类比】相当于注册 DispatcherServlet
 */
import { createRouter, createWebHistory } from 'vue-router'

/**
 * RouteRecordRaw —— 路由记录的类型定义（TypeScript 类型）
 * 【后端类比】相当于后端的 RequestMappingInfo 类，定义路由的元数据
 * type 关键字表示"只导入类型，不导入值"（编译后会被删除，不影响运行时）
 */
import type { RouteRecordRaw } from 'vue-router'

/**
 * useUserStore —— 用户状态管理
 * 【后端类比】相当于后端注入 UserService，用于在路由守卫中检查用户登录状态
 * 路由守卫中需要判断"用户是否登录"、"是否是管理员"，这些信息存在 userStore 中
 */
import { useUserStore } from '@/stores/user'

// ==================== 路由配置表 ====================

/**
 * routes —— 路由配置数组
 * 【后端类比】相当于所有 @RequestMapping 注解的集合
 *
 * 每个路由对象的核心字段：
 *   path    —— URL 路径（相当于 @RequestMapping 的 value）
 *   name    —— 路由名称，用于编程式导航（相当于后端给接口起个名字）
 *   component —— 对应的 Vue 组件（相当于后端的 Controller 方法）
 *   meta    —— 元数据（自定义字段，如 requiresAuth、requiresAdmin）
 *             相当于后端的自定义注解，路由守卫通过读取 meta 判断是否需要权限
 *   children —— 子路由（相当于后端的嵌套路径）
 */
const routes: RouteRecordRaw[] = [
  /**
   * ==================== 主布局路由（公开页面） ====================
   * 所有使用 MainLayout 布局的页面都嵌套在这个路由下
   * MainLayout 包含顶部导航栏 + 主内容区域
   * 【后端类比】相当于后端的公共父路径，如 @RequestMapping("/") 下面的子路径
   */
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      /**
       * 首页 —— path: '' 表示根路径 /
       * 【后端类比】相当于 @GetMapping("/") 或 @GetMapping("")
       */
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' }
      },
      /**
       * API市场 —— path: 'api' 表示 /api
       * 【后端类比】相当于 @GetMapping("/api")
       * 注意：这里没有 requiresAuth，表示未登录用户也能访问
       */
      {
        path: 'api',
        name: 'ApiList',
        component: () => import('@/views/api/list.vue'),
        meta: { title: 'API市场' }
      },
      /**
       * API详情 —— path: 'api/:id' 中的 :id 是动态参数
       * 【后端类比】相当于 @GetMapping("/api/{id}")，:id 相当于 @PathVariable
       * 访问 /api/123 时，id 的值就是 "123"
       * 在组件中通过 route.params.id 获取（相当于后端的 @PathVariable Long id）
       */
      {
        path: 'api/:id',
        name: 'ApiDetail',
        component: () => import('@/views/api/detail.vue'),
        meta: { title: 'API详情' }
      },
      /**
       * API测试 —— requiresAuth: true 表示需要登录才能访问
       * 【后端类比】相当于后端的 @RequiresAuth 或 SessionInterceptor 检查
       * 路由守卫会检查这个字段，未登录用户会被重定向到登录页
       */
      {
        path: 'api/test/:id',
        name: 'ApiTest',
        component: () => import('@/views/api/test.vue'),
        meta: { title: 'API测试', requiresAuth: true }
      },
      {
        path: 'api/doc/:id',
        name: 'ApiDoc',
        component: () => import('@/views/api/doc.vue'),
        meta: { title: '技术文档' }
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
      /**
       * 用户中心 —— 嵌套路由的第二层
       * 【后端类比】相当于 @RequestMapping("/user") 下面的子路径
       * 使用 UserLayout 布局（左侧边栏 + 右内容区）
       * requiresAuth: true 表示整个用户中心都需要登录
       */
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

  /**
   * ==================== 登录页（无布局） ====================
   * 登录页不使用任何布局组件（没有导航栏、侧边栏）
   * 【后端类比】相当于后端的 /auth/login 接口，不需要 Session 校验
   */
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: { title: '登录' }
  },

  /**
   * ==================== 注册页（无布局） ====================
   */
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: { title: '注册' }
  },

  /**
   * ==================== 管理后台路由 ====================
   * 使用 AdminLayout 布局（左侧管理菜单 + 右内容区）
   * requiresAuth: true + requiresAdmin: true 表示需要管理员登录
   * 【后端类比】相当于后端的 @RequestMapping("/admin") + 权限校验
   */
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
        path: 'after-sales',
        name: 'AdminAfterSales',
        component: () => import('@/views/admin/after-sales.vue'),
        meta: { title: '售后管理' }
      },
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/statistics.vue'),
        meta: { title: '平台统计' }
      }
    ]
  },

  /**
   * ==================== 404 页面（兜底路由） ====================
   * path: '/:pathMatch(.*)*' 是 Vue Router 的通配符语法
   * 匹配所有未定义的路径，显示 404 页面
   * 【后端类比】相当于后端的 @ExceptionHandler(NoHandlerFoundException.class)
   *   或者 web.xml 中的 <error-page> 配置
   * 必须放在路由数组的最后，因为路由匹配是按顺序的
   */
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

// ==================== 创建路由实例 ====================

/**
 * createRouter —— 创建路由实例
 * 【后端类比】相当于注册 DispatcherServlet
 *
 * 参数说明：
 *   history: createWebHistory() —— 使用 HTML5 History 模式
 *     【后端类比】相当于后端的 URL 映射模式
 *     - History 模式：URL 没有 # 号，如 http://localhost:3000/api（更美观）
 *     - Hash 模式：URL 有 # 号，如 http://localhost:3000/#/api（兼容性更好）
 *     本项目使用 History 模式，URL 更像传统网站
 *
 *   routes —— 路由配置表
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==================== 路由守卫（全局前置守卫） ====================

/**
 * router.beforeEach —— 全局前置守卫
 * 【后端类比】相当于后端的 HandlerInterceptor.preHandle() 或 Filter.doFilter()
 *   - 后端：每个请求到达 Controller 之前，先经过拦截器检查
 *   - 前端：每次路由跳转之前，先经过守卫检查
 *
 * 【参数说明】
 *   to   —— 即将进入的目标路由（相当于后端的 HttpServletRequest）
 *   _from —— 当前导航正要离开的路由（下划线前缀表示未使用，相当于后端的忽略参数）
 *   next  —— 放行函数，调用 next() 允许跳转，调用 next({ name: 'Login' }) 重定向
 *            【后端类比】相当于 FilterChain.doFilter()，调用才继续执行，不调用就拦截
 *
 * 【守卫逻辑流程】
 *   1. 设置页面标题（document.title）
 *   2. 已登录用户访问登录/注册页 → 重定向到首页（避免重复登录）
 *   3. 未登录用户访问需要登录的页面 → 尝试从 localStorage 恢复登录态
 *   4. 恢复失败 → 重定向到登录页（携带 redirect 参数，登录后跳回原页面）
 *   5. 需要管理员权限的页面 → 检查 isAdmin === 1
 *   6. 以上检查都通过 → next() 放行
 */
router.beforeEach(async (to, _from, next) => {
  /**
   * 设置浏览器标签页标题
   * 【后端类比】相当于后端设置响应头，不过前端是直接操作 DOM
   * to.meta.title 是路由配置中定义的标题，如 '首页'、'API市场'
   * 模板字符串 `${title} - API Market` 生成如 "首页 - API Market"
   */
  document.title = `${to.meta.title || 'API交易平台'} - API Market`
  
  /**
   * 获取用户 Store 实例
   * 【后端类比】相当于注入 UserService
   * 注意：useUserStore() 不能在组件外部调用，但可以在路由守卫中调用
   * （因为路由守卫执行时，Pinia 已经在 main.ts 中注册过了）
   */
  const userStore = useUserStore()
  
  /**
   * 分支1：已登录用户的处理
   * 【后端类比】相当于后端检查 session 中是否有用户信息
   */
  if (userStore.isLoggedIn) {
    /**
     * 已登录用户访问登录/注册页 → 重定向到首页
     * 【后端类比】相当于后端判断"用户已登录，无需再登录，重定向到首页"
     * next({ name: 'Login' }) 会中断当前导航，发起一个新的导航到 Login 路由
     * return 防止后续代码执行（不调用 next() 就不会放行）
     */
    if (to.name === 'Login' || to.name === 'Register') {
      next({ name: 'Home' })
      return
    }
  } else {
    /**
     * 分支2：未登录用户的处理
     * 【场景】用户刷新页面后，Pinia 的内存状态会丢失，但 localStorage 中还有 userInfo
     * 此时需要验证 Session 是否仍然有效
     */
    const stored = localStorage.getItem('userInfo')
    if (stored && to.meta.requiresAuth) {
      /**
       * validateSession() —— 向后端发送请求验证 Session 是否有效
       * 【后端类比】相当于后端的 Session 校验：检查 Redis 中的 Session 是否过期
       * 如果有效 → 恢复 Pinia 中的用户状态
       * 如果无效 → 清除 localStorage，返回 false
       */
      const isValid = await userStore.validateSession()
      if (!isValid) {
        /**
         * Session 失效 → 重定向到登录页
         * query: { redirect: to.fullPath } —— 记录用户原本想访问的页面
         * 登录成功后可以跳回这个页面，而不是默认跳首页
         * 【后端类比】相当于后端重定向到登录页时携带 originalUrl 参数
         */
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
    }
  }
  
  /**
   * 检查是否需要登录
   * 【后端类比】相当于后端的 SessionInterceptor 检查 request.getSession().getAttribute("user")
   * to.meta.requiresAuth 是路由配置中定义的元数据
   * 如果页面需要登录但用户未登录 → 重定向到登录页
   */
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  /**
   * 检查是否需要管理员权限
   * 【后端类比】相当于后端的权限拦截器检查 isAdmin 字段
   * to.meta.requiresAdmin 是路由配置中定义的元数据
   * userInfo.isAdmin !== 1 —— 后端返回 number 类型 0/1，前端可能同时存在 boolean 类型
   * 用 !== 1 兼容两种类型（isAdmin=0 普通用户，isAdmin=1 管理员）
   * 非管理员访问管理页面 → 重定向到首页
   */
  if (to.meta.requiresAdmin) {
    if (!userStore.userInfo || userStore.userInfo.isAdmin !== 1) {
      next({ name: 'Home' })
      return
    }
  }
  
  /**
   * 所有检查通过 → 放行
   * 【后端类比】相当于 FilterChain.doFilter(request, response)
   * 调用 next() 后，路由跳转继续执行，渲染目标页面组件
   */
  next()
})

/**
 * 导出路由实例，供 main.ts 中的 app.use(router) 使用
 * 【后端类比】相当于后端的 @Bean 注册 DispatcherServlet
 */
export default router
