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
