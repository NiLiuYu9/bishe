<!--
  =====================================================
  通知铃铛组件 NotificationBell —— 相当于后端的消息提醒图标
  =====================================================
  
  【核心概念】显示在导航栏，点击展开通知面板，角标显示未读数量
  连接 WebSocket 实时接收新消息通知
  
  【后端类比】相当于后端页面的消息提醒图标，类似小红点提示
  
  【Vue 组件核心概念（给后端开发者）】
    - ref —— 响应式数据，相当于后端的成员变量
    - computed —— 计算属性，相当于后端的 getter 方法
    - onMounted/onUnmounted —— 生命周期钩子，相当于后端的 @PostConstruct/@PreDestroy
    - Pinia Store —— 状态管理，相当于后端的 Redis/Session
-->
<template>
  <el-popover
    ref="popoverRef"
    placement="bottom"
    :width="420"
    trigger="click"
    v-model:visible="popoverVisible"
    popper-class="notification-popover"
    :offset="8"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="notification-badge">
        <el-icon class="bell-icon">
          <Bell />
        </el-icon>
      </el-badge>
    </template>
    <NotificationPanel @close="popoverVisible = false" />
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import NotificationPanel from './NotificationPanel.vue'

const notificationStore = useNotificationStore()
const userStore = useUserStore()

const popoverRef = ref()
const popoverVisible = ref(false)

const unreadCount = computed(() => notificationStore.unreadCount)

watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    notificationStore.connect()
  } else {
    notificationStore.disconnect()
  }
}, { immediate: true })

onUnmounted(() => {
  notificationStore.disconnect()
})
</script>

<style scoped>
.notification-badge {
  cursor: pointer;
}

.bell-icon {
  font-size: 20px;
  color: #606266;
  transition: color 0.2s;
}

.bell-icon:hover {
  color: #409EFF;
}
</style>
