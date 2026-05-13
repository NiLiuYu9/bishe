/**
 * =====================================================
 * 应用入口文件 —— 相当于后端 Spring Boot 的启动类
 * =====================================================
 *
 * 【后端类比】这个文件就相当于你后端的 ApiPlatformApplication.java（含 @SpringBootApplication 的主类）
 *   - 后端：SpringApplication.run() 启动 Spring 容器，扫描 @Component/@Service/@Controller 等注解
 *   - 前端：createApp() 创建 Vue 应用实例，通过 app.use() 注册插件（相当于注册 Bean）
 *
 * 【Vue 应用的启动流程】
 *   1. createApp(App)  —— 创建应用实例（相当于 new SpringApplicationBuilder()）
 *   2. app.use(插件)   —— 注册插件（相当于 @Import 或 @ComponentScan 注册 Bean）
 *   3. app.mount('#app') —— 挂载到 HTML 中的 <div id="app">（相当于 Spring Boot 监听端口）
 *
 * 【本文件注册了3个核心插件】
 *   - Pinia：状态管理（相当于后端的 Redis/Session，用于跨组件共享数据）
 *   - Vue Router：路由（相当于后端的 DispatcherServlet，根据 URL 分发到不同页面组件）
 *   - Element Plus：UI 组件库（相当于后端的第三方依赖，提供现成的按钮/表格/弹窗等组件）
 */

// ==================== 导入依赖 ====================

/**
 * createApp —— Vue 3 的工厂函数，用于创建应用实例
 * 【后端类比】相当于 SpringApplication.run()，是整个应用的起点
 */
import { createApp } from 'vue'

/**
 * createPinia —— 创建 Pinia 状态管理实例
 * 【后端类比】Pinia 相当于后端的"全局缓存/Session管理器"
 *   - 后端用 Redis 存储共享数据（如登录用户信息），所有 Controller 都能读取
 *   - 前端用 Pinia 存储共享数据（如登录用户信息），所有组件都能读取
 *   - Pinia 的 Store 就相当于后端的 Service + Redis 的结合体
 */
import { createPinia } from 'pinia'

/**
 * Element Plus —— Vue 3 的 UI 组件库
 * 【后端类比】相当于你后端引入的 Hutool/Lombok 等工具库
 *   - 不用自己手写 HTML/CSS 做按钮、表格、弹窗，直接用 Element Plus 提供的组件
 *   - 就像后端不用自己手写 JSON 解析，用 Jackson 一样
 */
import ElementPlus from 'element-plus'

/**
 * Element Plus 图标库 —— 提供所有图标组件
 * 【后端类比】相当于引入了额外的图标资源包
 * 图标不是图片，而是 SVG 矢量图形封装成的 Vue 组件，可以像普通组件一样使用
 */
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * Element Plus 的 CSS 样式文件
 * 【重要】前端必须显式导入 CSS 才能生效，不像后端引入 jar 包就自动可用
 * 这行代码的作用：把 Element Plus 的所有默认样式（按钮颜色、表格边框等）加载到页面中
 */
import 'element-plus/dist/index.css'

/**
 * Element Plus 的中文语言包
 * 【为什么需要这个？】Element Plus 默认是英文的（如日期选择器显示 "January" 而非 "一月"）
 * 导入中文语言包后，所有内置文本都会显示中文
 * 【后端类比】相当于后端的 i18n 国际化配置，设置 Locale.CHINA
 */
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// ==================== 导入项目内部模块 ====================

/**
 * App.vue —— 根组件
 * 【后端类比】相当于后端的"最外层容器"，所有页面都在这个容器内渲染
 * Vue 应用的组件树：App.vue → Layout → 具体页面组件
 * 就像后端的请求链：DispatcherServlet → Controller → Service
 */
import App from './App.vue'

/**
 * router —— 路由实例
 * 【后端类比】相当于后端的 DispatcherServlet + @RequestMapping
 *   - 后端：浏览器请求 /api/list → DispatcherServlet 分发到 ApiController.list()
 *   - 前端：浏览器访问 /api → Router 分发到 ApiList.vue 组件渲染
 *   - 路由就是"URL 和 页面组件 的映射关系"
 */
import router from './router'

/**
 * 全局样式文件
 * 【后端类比】相当于后端的 application.yml 中的全局配置
 * 定义了全局颜色变量、字体、间距等，所有组件都能使用
 */
import './style.css'

// ==================== 创建应用实例 ====================

/**
 * createApp(App) —— 创建 Vue 应用实例
 * 【后端类比】相当于 SpringApplication.run(ApiPlatformApplication.class)
 * App 参数是根组件，相当于后端的启动类，是整个组件树的根节点
 */
const app = createApp(App)

// ==================== 全局注册图标组件 ====================

/**
 * 遍历 Element Plus 图标库，将所有图标注册为全局组件
 *
 * 【后端类比】相当于 @ComponentScan 扫描所有 @Component 类，注册到 Spring 容器
 *   - 注册后，任何组件的模板中都可以直接使用 <Edit /> <Delete /> 等图标标签
 *   - 不需要每个组件单独 import 图标
 *
 * 【代码解析】
 *   Object.entries(ElementPlusIconsVue) —— 将图标对象转为 [key, value] 数组
 *     例如：[['Edit', EditComponent], ['Delete', DeleteComponent], ...]
 *   for...of 遍历每个键值对
 *   app.component(key, component) —— 全局注册组件
 *     相当于后端：beanFactory.registerSingleton(key, component)
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ==================== 注册插件 ====================

/**
 * app.use(createPinia()) —— 注册 Pinia 状态管理
 *
 * 【后端类比】相当于配置 Redis 作为 Session 存储
 *   - Pinia 是 Vue 的官方状态管理库，用于在多个组件之间共享数据
 *   - 比如：用户登录后，用户信息存在 Pinia 的 userStore 中，
 *           导航栏、个人中心、订单页面等所有组件都能读取到用户信息
 *   - 就像后端把用户信息存在 Redis Session 中，所有 Controller 都能获取
 *
 * createPinia() 创建 Pinia 实例，app.use() 将其注册到 Vue 应用中
 * 注册后，任何组件都可以通过 useUserStore() 等方法访问 Store
 */
app.use(createPinia())

/**
 * app.use(router) —— 注册路由
 *
 * 【后端类比】相当于注册 DispatcherServlet
 *   - 路由决定了"浏览器访问哪个 URL，就渲染哪个页面组件"
 *   - 后端：@GetMapping("/api/list") → 调用 ApiController.list() → 返回 JSON
 *   - 前端：路由 path: '/api' → 渲染 ApiList.vue 组件 → 显示页面
 *   - 路由还负责"导航守卫"（相当于后端的拦截器/过滤器），如检查登录状态
 */
app.use(router)

/**
 * app.use(ElementPlus, { locale: zhCn }) —— 注册 Element Plus 组件库
 *
 * 【参数说明】
 *   { locale: zhCn } —— 设置语言为中文
 *   不设置的话，日期选择器、分页等组件会显示英文
 *
 * 【后端类比】相当于在 application.yml 中配置 spring.mvc.locale=zh_CN
 * 注册后，所有 Element Plus 组件（<el-button>、<el-table> 等）都可以直接使用
 */
app.use(ElementPlus, { locale: zhCn })

// ==================== 挂载应用 ====================

/**
 * app.mount('#app') —— 将 Vue 应用挂载到 HTML 页面中的 <div id="app">
 *
 * 【后端类比】相当于 Spring Boot 的 server.port=8080，让应用开始对外提供服务
 *   - 这行代码执行后，Vue 开始接管 id="app" 的 DOM 节点
 *   - 浏览器访问 http://localhost:3000 时，Vue 会根据当前 URL 渲染对应的页面组件
 *   - 相当于后端的 Tomcat 启动，开始监听 HTTP 请求
 *
 * 【HTML 中的对应代码】（在 index.html 中）
 *   <div id="app"></div>  ← Vue 会把整个应用渲染到这个 div 里面
 */
app.mount('#app')
