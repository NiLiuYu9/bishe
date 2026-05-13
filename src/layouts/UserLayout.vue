<!--
  =====================================================
  用户中心布局 UserLayout —— 相当于后端的用户中心页面模板
  =====================================================
  
  【布局结构】
    ┌────────────┬────────────────────────────────────┐
    │  我的API   │                                    │
    │  我的收藏   │         <router-view />            │  ← 主内容区
    │  我的订单   │    （我的API/订单/收藏/配额等）       │
    │  我的调用次数│                                    │
    │  我的需求   │                                    │
    │  统计分析   │                                    │
    │  个人资料   │                                    │
    └────────────┴────────────────────────────────────┘
    
  【与 AdminLayout 的区别】
    - AdminLayout：深色侧边栏 + 面包屑，面向管理员
    - UserLayout：浅色侧边栏，面向普通用户
    - UserLayout 没有折叠功能（菜单项较少，不需要折叠）
    
  【嵌套在 MainLayout 中使用】
    UserLayout 是 MainLayout 的子路由组件
    即：MainLayout（顶部导航栏）→ UserLayout（左侧菜单）→ 具体页面
-->
<template>
  <div class="user-layout">
    <el-container>
      <!--
        el-aside —— 侧边栏，固定宽度 220px
        el-menu —— 菜单组件
          :default-active="route.path" —— 根据当前 URL 高亮对应菜单项
          router —— 启用路由模式，点击菜单项自动跳转
      -->
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="route.path"
          router
          class="sidebar-menu"
        >
          <!--
            每个菜单项对应一个用户中心子页面
            index 值就是路由路径，点击后自动跳转
          -->
          <el-menu-item index="/user/my-apis">
            <el-icon><Box /></el-icon>
            <span>我的API</span>
          </el-menu-item>
          <el-menu-item index="/user/favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/user/orders">
            <el-icon><List /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="/user/quota">
            <el-icon><Odometer /></el-icon>
            <span>我的调用次数</span>
          </el-menu-item>
          <el-menu-item index="/user/my-requirements">
            <el-icon><Document /></el-icon>
            <span>我的需求</span>
          </el-menu-item>
          <el-menu-item index="/user/statistics">
            <el-icon><DataLine /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!--
        主内容区域 —— 渲染用户中心的子页面
        <router-view /> 会根据路由渲染对应的组件
        如 /user/orders → MyOrders.vue
      -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
/**
 * useRoute —— 获取当前路由信息
 * 【后端类比】相当于后端的 HttpServletRequest，获取当前请求路径
 */
import { useRoute } from 'vue-router'
import { Box, List, Odometer, Document, DataLine, User, Star } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped>
.user-layout {
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 152px);
}

.sidebar {
  background: #fff;
  border-right: 1px solid #E2E8F0;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.content {
  background: #fff;
  padding: 24px;
}
</style>
