<!--
  =====================================================
  管理后台布局 AdminLayout —— 相当于后端的管理后台页面模板
  =====================================================
  
  【布局结构】
    ┌────────────┬────────────────────────────────────┐
    │            │  ☰ 首页 / 仪表盘       管理员 ▼     │  ← 顶部栏
    │  管理后台   ├────────────────────────────────────┤
    │            │                                    │
    │  仪表盘     │         <router-view />            │  ← 主内容区
    │  用户管理   │    （仪表盘/用户管理/API管理等）      │
    │  API管理   │                                    │
    │  ...       │                                    │
    └────────────┴────────────────────────────────────┘
    
  【与 MainLayout 的区别】
    - MainLayout：顶部导航 + 侧边分类，面向普通用户
    - AdminLayout：左侧菜单 + 顶部面包屑，面向管理员
    - 侧边栏支持折叠（点击 ☰ 按钮切换）
-->
<template>
  <div class="admin-layout">
    <el-container>
      <!--
        el-aside —— 侧边栏
        :width —— 动态绑定宽度
          折叠时 64px（只显示图标），展开时 220px（显示图标+文字）
          【后端类比】相当于后端的动态配置，根据状态切换布局
      -->
      <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <!-- v-if 控制折叠时不显示文字 -->
          <span v-if="!appStore.sidebarCollapsed" class="logo-text">管理后台</span>
        </div>
        
        <!--
          el-menu —— Element Plus 的菜单组件
          :default-active="route.path" —— 默认激活的菜单项（根据当前 URL 高亮）
          :collapse="appStore.sidebarCollapsed" —— 是否折叠
          router —— 启用 vue-router 模式，点击菜单项自动跳转
          【后端类比】相当于后端的导航菜单，每个菜单项对应一个页面
        -->
        <el-menu
          :default-active="route.path"
          :collapse="appStore.sidebarCollapsed"
          router
          class="sidebar-menu"
        >
          <!--
            el-menu-item —— 菜单项
            index="/admin" —— 菜单项标识，也是跳转路径（router 模式下）
            【后端类比】相当于后端的菜单项 URL
          -->
          <el-menu-item index="/admin">
            <el-icon><DataBoard /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/apis">
            <el-icon><Box /></el-icon>
            <span>API管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/api-types">
            <el-icon><Grid /></el-icon>
            <span>API分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/requirements">
            <el-icon><Document /></el-icon>
            <span>需求管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/after-sales">
            <el-icon><ChatDotRound /></el-icon>
            <span>售后管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/statistics">
            <el-icon><DataLine /></el-icon>
            <span>平台统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <!--
          顶部栏 —— 包含折叠按钮、面包屑、用户信息
        -->
        <el-header class="header">
          <div class="header-left">
            <!--
              折叠/展开按钮
              appStore.toggleSidebar() —— 切换侧边栏折叠状态
              Fold/Expand 图标根据状态切换
            -->
            <el-button text @click="appStore.toggleSidebar">
              <el-icon :size="20">
                <Fold v-if="!appStore.sidebarCollapsed" />
                <Expand v-else />
              </el-icon>
            </el-button>
            <!--
              el-breadcrumb —— 面包屑导航
              【后端类比】相当于后端页面的"当前位置"提示
              显示：首页 / 当前页面标题
            -->
            <el-breadcrumb separator="/">
              <el-breadcrumb-item @click="router.push('/')" class="breadcrumb-home">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 用户下拉菜单 -->
            <el-dropdown trigger="click">
              <div class="user-info">
                <!--
                  el-avatar —— 头像组件
                  取用户名首字母大写作为头像文字
                -->
                <el-avatar :size="32">{{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}</el-avatar>
                <span>{{ userStore.userInfo?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { 
  DataBoard, User, Box, Grid, List, DataLine, Document,
  Fold, Expand, SwitchButton, ChatDotRound
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

/** 退出登录 */
const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.sidebar {
  background: #1E3A8A;
  transition: width 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  background: transparent;
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu-item) {
  color: #93C5FD;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.breadcrumb-home {
  cursor: pointer;
}

.breadcrumb-home:hover {
  color: #1E40AF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.main-content {
  background: #EFF6FF;
  padding: 24px;
}
</style>
