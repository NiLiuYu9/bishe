<!--
  =====================================================
  主布局组件 MainLayout —— 相当于后端的公共页面模板
  =====================================================
  
  【核心概念：布局组件是什么？】
    布局组件定义了页面的"骨架"结构，所有使用该布局的页面共享相同的：
    - 顶部导航栏
    - 侧边栏
    - 底部版权信息
    只是中间的 <router-view /> 内容不同
    
    【后端类比】相当于后端的 Thymeleaf 布局模板（layout.html）
    - 后端：<div layout:fragment="content">这里是动态内容</div>
    - 前端：<router-view /> 这里是动态内容
    - 不同页面复用相同的导航栏和页脚，只有主内容区变化
    
  【本布局的结构】
    ┌──────────────────────────────────────────────────┐
    │  Logo  │ 首页 API市场 需求广场 │ 搜索框 │ 登录/用户 │  ← 顶部导航栏
    ├─────────┼────────────────────────────────────────┤
    │         │                                        │
    │  侧边栏  │         <router-view />               │  ← 主内容区（由路由决定）
    │ (API分类) │        （首页/API列表/需求列表等）        │
    │         │                                        │
    ├─────────┴────────────────────────────────────────┤
    │              © 2024 API Market                   │  ← 底部版权
    └──────────────────────────────────────────────────┘
    
  【Element Plus 容器组件】
    <el-container> —— 布局容器（相当于后端的 Div 容器）
    <el-header> —— 顶部区域（固定高度 64px）
    <el-main> —— 主内容区域（自适应高度）
    <el-footer> —— 底部区域
    <el-aside> —— 侧边栏区域
    这些组件只是提供了 flex 布局，没有特殊逻辑
-->

<template>
  <div class="main-layout">
    <!-- el-container 是 Element Plus 的布局容器，内部使用 Flex 布局 -->
    <el-container>
      <!-- ==================== 顶部导航栏 ==================== -->
      <!--
        el-header —— 顶部区域
        class="header" —— 应用自定义 CSS 样式
        【后端类比】相当于后端页面模板中的 <header> 公共部分
      -->
      <el-header class="header">
        <!--
          Logo 区域 —— 点击跳转首页
          @click="router.push('/')" —— 点击事件，跳转到首页
          【后端类比】相当于后端的 <a href="/"> 首页链接 </a>
          router.push('/') 是编程式导航，相当于后端的 redirect:/ 
        -->
        <div class="logo" @click="router.push('/')">
          <!--
            SVG 图标 —— 矢量图形，相当于一个六边形图标
            【后端类比】相当于后端页面中引用的静态资源图片
            SVG 比 PNG 图片更清晰，且可以通过 CSS 改变颜色
          -->
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="logo-text">API Market</span>
        </div>
        
        <!--
          导航菜单 —— 页面间的跳转链接
          <router-link> —— Vue Router 的导航组件，相当于后端的 <a> 标签
            to="/" —— 跳转路径
            exact —— 精确匹配（只有完全匹配 / 时才高亮，否则 /api 也会匹配 /）
          【后端类比】相当于后端页面模板中的导航栏链接
        -->
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" exact>首页</router-link>
          <router-link to="/api" class="nav-item">API市场</router-link>
          <router-link to="/requirement" class="nav-item">需求广场</router-link>
          <!--
            v-if="userStore.isLoggedIn" —— 条件渲染
            【后端类比】相当于后端的 <c:if test="${session.user != null}">
            只有登录用户才能看到"我的收藏"和"管理后台"链接
          -->
          <template v-if="userStore.isLoggedIn">
            <router-link to="/user/favorites" class="nav-item">我的收藏</router-link>
            <!--
              v-if="userStore.userInfo?.isAdmin === 1" —— 管理员才显示
              ?. 可选链：如果 userInfo 为 null，不会报错，而是返回 undefined
              【后端类比】相当于后端的 <c:if test="${session.user.isAdmin == 1}">
            -->
            <router-link v-if="userStore.userInfo?.isAdmin === 1" to="/admin" class="nav-item">管理后台</router-link>
          </template>
        </nav>
        
        <!--
          搜索框 —— 搜索 API
          v-model="searchKeyword" —— 双向绑定
            【后端类比】相当于后端的表单字段绑定
            输入框的值自动同步到 searchKeyword 变量，变量变化也自动更新输入框
          @keyup.enter="handleSearch" —— 按回车键触发搜索
            【后端类比】相当于后端的表单提交事件 onsubmit
          <template #prefix> —— 输入框前缀插槽（放搜索图标）
        -->
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索API..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <!--
          右侧操作区 —— 登录/注册按钮 或 用户信息
          <template v-if> / <template v-else> —— 条件渲染
            【后端类比】相当于后端的 if/else 逻辑
            已登录 → 显示通知铃铛 + 快速使用 + 用户下拉菜单
            未登录 → 显示注册/登录按钮
        -->
        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <!--
              NotificationBell —— 通知铃铛组件（自定义组件）
              显示未读消息数量角标，点击展开通知列表
            -->
            <NotificationBell />
            <!--
              快速使用下拉框 —— 悬停显示 API 调用客户端代码
              @mouseenter / @mouseleave —— 鼠标进入/离开事件
              【后端类比】相当于后端的 hover 效果，但后端页面一般用 CSS :hover 实现
            -->
            <div class="quick-use-wrapper" @mouseenter="showDropdown" @mouseleave="hideDropdown">
              <el-button text class="quick-use-btn">
                <el-icon><Document /></el-icon>
                快速使用
              </el-button>
              <!--
                :class="{ 'show': isDropdownVisible }" —— 动态类名绑定
                【后端类比】相当于后端的条件样式
                当 isDropdownVisible 为 true 时，添加 'show' 类，触发 CSS 过渡动画
              -->
              <div class="quick-use-dropdown" :class="{ 'show': isDropdownVisible }">
                <div class="dropdown-header">
                  <span class="dropdown-title">API调用客户端</span>
                  <el-button text class="copy-btn" :class="{ 'copied': isCopied }" @click="copyCode">
                    <el-icon><component :is="copyButtonIcon" /></el-icon>
                    {{ copyButtonText }}
                  </el-button>
                </div>
                <pre class="code-content"><code>{{ apiClientCode }}</code></pre>
              </div>
            </div>
            <!--
              el-dropdown —— Element Plus 的下拉菜单组件
              trigger="click" —— 点击触发（默认是 hover）
              @command="handleCommand" —— 菜单项点击事件
                command 是每个菜单项的标识（如 "logout"）
                【后端类比】相当于后端的下拉选择事件 onChange
            -->
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-icon :size="18"><User /></el-icon>
                <!--
                  {{ }} —— 模板插值语法，显示变量值
                  【后端类比】相当于 Thymeleaf 的 th:text="${user.username}"
                -->
                <span class="username">{{ userStore.userInfo?.username }}</span>
                <el-tag v-if="userStore.userInfo?.isAdmin === 1" type="danger" size="small" style="margin-left: 4px;">管理员</el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <!--
              router.push('/login') —— 编程式导航到登录页
              【后端类比】相当于后端的 redirect:/login
            -->
            <el-button @click="router.push('/register')">注册</el-button>
            <el-button type="primary" @click="router.push('/login')">登录</el-button>
          </template>
        </div>
      </el-header>
      
      <!-- ==================== 主体内容区域 ==================== -->
      <div class="layout-wrapper">
        <!--
          Sidebar —— 侧边栏组件（自定义组件，显示 API 分类列表）
          v-if="showSidebar" —— 条件渲染，只在首页/API市场/需求广场显示
          :types="apiTypes" —— 传递 API 分类数据给子组件（props 传参）
            【后端类比】相当于后端的方法参数传递
          @type-click / @page-click —— 监听子组件的事件
            【后端类比】相当于后端的事件监听器 / 回调函数
        -->
        <Sidebar 
          v-if="showSidebar"
          :types="apiTypes"
          :active-type-id="activeTypeId"
          @type-click="handleTypeClick"
          @page-click="handlePageClick"
        />
        <div :class="['content-wrapper', { 'content-wrapper-full': !showSidebar }]">
          <!--
            el-main —— 主内容区域
            <router-view /> —— 路由视图占位符
            【后端类比】相当于后端的 <div layout:fragment="content">
            根据当前 URL 渲染对应的页面组件
          -->
          <el-main class="main-content">
            <router-view />
          </el-main>
          
          <el-footer class="footer">
            <div class="footer-content">
              <div class="copyright">
                © 2024 API Market. All rights reserved.
              </div>
            </div>
          </el-footer>
        </div>
      </div>
    </el-container>
  </div>
</template>

<!--
  script setup —— 组件逻辑部分
  【后端类比】相当于后端的 Controller 类
-->
<script setup lang="ts">
/**
 * 导入 Vue 组合式 API
 * 【后端类比】相当于后端的 import 工具类
 *
 * ref —— 响应式引用，用于定义可变数据
 *   【后端类比】相当于后端的成员变量
 * onMounted —— 生命周期钩子，组件挂载后执行
 *   【后端类比】相当于后端的 @PostConstruct
 * watch —— 侦听器，数据变化时执行回调
 *   【后端类比】相当于后端的 Observer 模式 / 属性变更监听器
 * computed —— 计算属性，基于其他数据自动计算
 *   【后端类比】相当于后端的 getter 方法
 */
import { ref, onMounted, watch, computed } from 'vue'

/**
 * useRouter / useRoute —— Vue Router 的组合式 API
 * router —— 路由实例，用于编程式导航（跳转页面）
 *   【后端类比】相当于后端的 redirect:/path
 * route —— 当前路由信息（URL 参数、查询参数等）
 *   【后端类比】相当于后端的 HttpServletRequest（获取请求参数）
 */
import { useRouter, useRoute } from 'vue-router'

/**
 * useUserStore —— 用户状态管理
 * 【后端类比】相当于后端注入 UserService
 */
import { useUserStore } from '@/stores/user'

/**
 * Element Plus 图标组件
 * 【后端类比】相当于后端引入的静态资源
 * 图标在 main.ts 中已全局注册，但这里显式导入可以获得类型提示
 */
import { Search, SwitchButton, User, Document, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiManagement } from '@/api/api'
import type { ApiType } from '@/types/api'
import Sidebar from '@/components/Sidebar.vue'
import NotificationBell from '@/components/NotificationBell.vue'

/** useRouter() —— 获取路由实例，用于页面跳转 */
const router = useRouter()
/** useRoute() —— 获取当前路由信息，用于读取 URL 参数 */
const route = useRoute()
/** useUserStore() —— 获取用户 Store 实例，用于读取登录状态 */
const userStore = useUserStore()

/**
 * apiClientCode —— API 调用客户端的 Java 示例代码
 * 【后端类比】这就是你后端的 ApiClient.java 的代码
 * 用反引号 `` 包裹的是模板字符串，可以跨行
 * 这个代码会在"快速使用"下拉框中展示，用户可以复制使用
 */
const apiClientCode = `import cn.hutool.crypto.digest.DigestAlgorithm;
import cn.hutool.crypto.digest.Digester;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * API调用客户端 - 填入配置即可使用
 */
public class ApiClient {

    // ==================== 配置区域（必填） ====================
    private static final String ACCESS_KEY = "your_access_key";
    private static final String SECRET_KEY = "your_secret_key";
    private static final String GATEWAY_HOST = "http://localhost:8080";
    // =======================================================

    private final String accessKey;
    private final String secretKey;
    private final String gatewayHost;

    // ==================== 使用示例 ====================
    public static void main(String[] args) {
        ApiClient client = new ApiClient(ACCESS_KEY, SECRET_KEY, GATEWAY_HOST);

        // GET请求
        Map<String, Object> getParams = new HashMap<>();
        getParams.put("userId", 123);
        System.out.println(client.get("/api/user/info", getParams));

        // POST请求
        Map<String, Object> postParams = new HashMap<>();
        postParams.put("username", "test");
        System.out.println(client.post("/api/user/create", postParams));
    }

    public ApiClient(String accessKey, String secretKey, String gatewayHost) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.gatewayHost = gatewayHost;
    }

    public String request(String method, String path, Map<String, Object> params) {
        String body = params == null ? "" : JSONUtil.toJsonStr(params);
        String url = gatewayHost + path;

        HttpRequest httpRequest;
        if ("GET".equalsIgnoreCase(method)) {
            httpRequest = HttpRequest.get(url);
            if (params != null) {
                params.forEach((key, value) -> httpRequest.form(key, value));
            }
        } else if ("POST".equalsIgnoreCase(method)) {
            httpRequest = HttpRequest.post(url).body(body);
        } else {
            throw new IllegalArgumentException("不支持的HTTP方法: " + method);
        }

        buildHeaders(body).forEach(httpRequest::header);
        return httpRequest.execute().body();
    }

    public String get(String path, Map<String, Object> params) {
        return request("GET", path, params);
    }

    public String post(String path, Map<String, Object> params) {
        return request("POST", path, params);
    }

    private Map<String, String> buildHeaders(String body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("accessKey", accessKey);
        headers.put("nonce", String.format("%04d", new Random().nextInt(10000)));
        headers.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        headers.put("body", body);
        headers.put("sign", genSign(body, secretKey));
        return headers;
    }

    private String genSign(String body, String secretKey) {
        return new Digester(DigestAlgorithm.SHA256).digestHex(body + "." + secretKey);
    }

}`;

/**
 * 复制按钮相关状态
 * 【后端类比】相当于后端的 UI 状态变量
 */
const copyButtonText = ref('复制')        // 按钮文字
const copyButtonIcon = ref(DocumentCopy)   // 按钮图标
const isCopied = ref(false)                // 是否已复制

/**
 * copyCode —— 复制代码到剪贴板
 * 【后端类比】相当于后端的"复制到剪贴板"功能
 * navigator.clipboard.writeText() —— 浏览器原生 API，写入剪贴板
 * 复制成功后，按钮文字变为"已复制"，2秒后恢复
 */
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(apiClientCode)
    isCopied.value = true
    copyButtonText.value = '已复制'
    copyButtonIcon.value = Document
    
    /**
     * setTimeout —— 延迟执行
     * 【后端类比】相当于后端的 ScheduledExecutorService.schedule()
     * 2秒后将按钮恢复为"复制"状态
     */
    setTimeout(() => {
      isCopied.value = false
      copyButtonText.value = '复制'
      copyButtonIcon.value = DocumentCopy
    }, 2000)
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

/**
 * 下拉框显示/隐藏状态
 * 使用延时隐藏（200ms），避免鼠标从按钮移到下拉框时闪烁
 */
const isDropdownVisible = ref(false)
let hideTimeout: number | null = null

const showDropdown = () => {
  /** 如果有未执行的隐藏定时器，取消它 */
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isDropdownVisible.value = true
}

const hideDropdown = () => {
  /** 延迟200ms隐藏，给用户时间移动鼠标到下拉框 */
  hideTimeout = window.setTimeout(() => {
    isDropdownVisible.value = false
  }, 200)
}

/** 搜索关键词 */
const searchKeyword = ref('')
/** API 分类列表（从后端加载） */
const apiTypes = ref<ApiType[]>([])
/** 当前选中的分类 ID */
const activeTypeId = ref<number | ''>('')

/**
 * showSidebar —— 计算属性，是否显示侧边栏
 * 只在首页、API市场、需求广场页面显示侧边栏
 * 【后端类比】相当于后端的条件判断逻辑
 */
const showSidebar = computed(() => {
  const path = route.path
  return path === '/' || path === '/api' || path === '/requirement' || 
    path.startsWith('/api/') || path.startsWith('/requirement/')
})

/**
 * loadApiTypes —— 加载 API 分类列表
 * 【后端类比】相当于后端调用 ApiTypeService.list() 获取分类数据
 */
const loadApiTypes = async () => {
  try {
    const res = await apiManagement.getApiTypes({ pageNum: 1, pageSize: 100 })
    apiTypes.value = res.data.list
  } catch (error) {
    console.error('加载API分类失败', error)
  }
}

/**
 * handleSearch —— 搜索处理
 * 跳转到 API 市场页面，携带搜索关键词
 * 【后端类比】相当于后端的搜索接口，将关键词作为查询参数传递
 */
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    /** router.push({ path, query }) —— 带查询参数的导航 */
    router.push({ path: '/api', query: { keyword } })
  } else {
    router.push({ path: '/api' })
  }
}

/**
 * handleCommand —— 下拉菜单命令处理
 * 【后端类比】相当于后端的事件处理器
 */
const handleCommand = (command: string) => {
  if (command === 'logout') {
    /** 退出登录：清除用户状态 + 跳转首页 */
    userStore.logout()
    router.push('/')
  } else {
    router.push(command)
  }
}

/**
 * handleTypeClick —— 分类点击处理
 * 跳转到 API 市场页面，携带分类 ID 筛选
 */
const handleTypeClick = (typeId: number) => {
  activeTypeId.value = typeId
  router.push({ path: '/api', query: { typeId: typeId.toString() } })
}

/**
 * handlePageClick —— 侧边栏页面链接点击处理
 */
const handlePageClick = (path: string) => {
  router.push(path)
}

/**
 * watch —— 侦听路由查询参数变化
 * 【后端类比】相当于后端的属性变更监听器
 * 当 URL 中的 typeId 参数变化时，更新 activeTypeId
 * immediate: true 表示初始化时也执行一次
 */
watch(
  () => route.query.typeId,
  (newTypeId) => {
    if (newTypeId) {
      activeTypeId.value = Number(newTypeId)
    } else {
      activeTypeId.value = ''
    }
  },
  { immediate: true }
)

/**
 * 侦听搜索关键词变化（从 URL 同步到输入框）
 */
watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = newKeyword as string || ''
  },
  { immediate: true }
)

/**
 * onMounted —— 组件挂载后执行
 * 【后端类比】相当于后端的 @PostConstruct
 * 页面加载时获取 API 分类列表
 */
onMounted(() => {
  loadApiTypes()
})
</script>

<!--
  style scoped —— 组件的局部样式
  【后端类比】相当于后端的局部变量（只影响当前组件）
  scoped 属性确保样式不会影响其他组件
-->
<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1E40AF;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  height: 64px;
  padding: 0 16px;
  background: #fff;
  z-index: 101;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  gap: 28px;
  flex-wrap: nowrap;
  white-space: nowrap;
  margin-left: 180px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 40px;
}

.search-input {
  width: 420px;
  max-width: 500px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.quick-use-wrapper {
  position: relative;
}

.quick-use-btn {
  font-size: 14px;
  font-weight: 500;
  color: #1E40AF;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.quick-use-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
}

.quick-use-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 750px;
  max-height: 520px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 
              0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-12px) scale(0.98);
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-use-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 32px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #ffffff;
  z-index: 1;
}

.quick-use-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.dropdown-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
}

.dropdown-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #1E40AF, #3b82f6);
  border-radius: 2px;
}

.copy-btn {
  color: #1E40AF;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.copy-btn:active {
  transform: translateY(0);
}

.copy-btn.copied {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #86efac;
  color: #166534;
}

.copy-btn.copied:hover {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  border-color: #4ade80;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
}

.code-content {
  margin: 0;
  padding: 20px;
  max-height: 440px;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  font-size: 12.5px;
  line-height: 1.7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  position: relative;
}

.code-content::-webkit-scrollbar {
  width: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #475569, #64748b);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #64748b, #94a3b8);
}

.code-content code {
  display: block;
  white-space: pre;
  position: relative;
}

.nav-item {
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 17px;
}

.nav-item:hover,
.nav-item.router-link-exact-active {
  color: #1E40AF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #1E3A8A;
  font-weight: 500;
}

.layout-wrapper {
  display: flex;
  flex: 1;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 160px;
}

.content-wrapper-full {
  margin-left: 0;
}

.main-content {
  flex: 1;
  background: #EFF6FF;
  padding: 24px;
}

.footer {
  background: #1E3A8A;
  color: #fff;
  padding: 24px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  color: #93C5FD;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .nav-menu {
    margin-left: 0;
    gap: 16px;
  }
  
  .logo {
    position: static;
    background: transparent;
    padding: 0;
  }
  
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }
  
  .nav-menu {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
  
  .header-center {
    width: 100%;
    margin-top: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }
  
  .layout-wrapper {
    flex-direction: column;
  }
  
  .content-wrapper {
    margin-left: 0;
  }
}
</style>
