<template>
  <div class="user-layout">
    <el-container>
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="route.path"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/user/my-apis">
            <el-icon><Box /></el-icon>
            <span>我的API</span>
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
      
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Box, List, Odometer, Document, DataLine, User } from '@element-plus/icons-vue'

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
