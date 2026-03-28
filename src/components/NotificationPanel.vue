<template>
  <div class="notification-panel">
    <div class="panel-header">
      <span class="title">消息通知</span>
      <el-button type="primary" link size="small" @click="handleMarkAllRead" :disabled="unreadCount === 0">
        全部已读
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" class="notification-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="需求" name="requirement" />
      <el-tab-pane label="售后" name="after_sale" />
      <el-tab-pane label="评价" name="api_review" />
    </el-tabs>
    
    <div class="notification-list" v-loading="loading">
      <template v-if="notifications.length > 0">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: notification.isRead === 0 }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :style="{ backgroundColor: getTypeColor(notification.type) }">
            <el-icon><component :is="getTypeIcon(notification.type)" /></el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-text">{{ notification.content }}</div>
            <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
          </div>
        </div>
      </template>
      <el-empty v-else description="暂无消息" :image-size="80" />
    </div>
    
    <div class="panel-footer" v-if="notifications.length > 0">
      <el-button type="primary" link @click="handleViewAll">
        查看全部消息
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  ChatDotRound, 
  Star, 
  Warning,
  Finished
} from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import { NotificationTypeLabels, NotificationTypeColors, type Notification } from '@/types/notification'
import { formatDistanceToNow } from '@/utils/format'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const notificationStore = useNotificationStore()

const activeTab = ref('all')
const loading = computed(() => notificationStore.loading)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const getTypeLabel = (type: string) => {
  return NotificationTypeLabels[type] || type
}

const getTypeColor = (type: string) => {
  return NotificationTypeColors[type] || '#909399'
}

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    requirement_new_message: ChatDotRound,
    requirement_status_update: Finished,
    after_sale_new_message: Warning,
    after_sale_status_update: Warning,
    api_review_reply: Star,
    api_new_review: Star
  }
  return iconMap[type] || Document
}

const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time))
}

const handleTabChange = (tab: string) => {
  const params: any = { pageNum: 1, pageSize: 10 }
  if (tab !== 'all') {
    if (tab === 'requirement') {
      params.type = 'requirement_new_message,requirement_status_update'
    } else if (tab === 'after_sale') {
      params.type = 'after_sale_new_message,after_sale_status_update'
    } else if (tab === 'api_review') {
      params.type = 'api_review_reply,api_new_review'
    }
  }
  notificationStore.fetchNotifications(params)
}

const handleNotificationClick = async (notification: Notification) => {
  if (notification.isRead === 0) {
    await notificationStore.markAsRead(notification.id)
  }
  
  emit('close')
  
  const { relatedId, relatedType, type } = notification
  if (relatedType === 'requirement' || type.startsWith('requirement') || type.startsWith('after_sale')) {
    if (type.startsWith('after_sale')) {
      router.push(`/requirement/${relatedId}?tab=afterSale`)
    } else {
      router.push(`/requirement/${relatedId}`)
    }
  } else if (relatedType === 'api_review' || type.startsWith('api_review') || type.startsWith('api_new')) {
    router.push(`/api/${relatedId}`)
  }
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
  ElMessage.success('已全部标记为已读')
}

const handleViewAll = () => {
  emit('close')
  router.push('/user/notifications')
}

onMounted(() => {
  notificationStore.fetchNotifications({ pageNum: 1, pageSize: 10 })
})
</script>

<style scoped>
.notification-panel {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.notification-tabs {
  margin-top: 8px;
}

.notification-tabs :deep(.el-tabs__header) {
  margin-bottom: 8px;
}

.notification-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.notification-item {
  display: flex;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  margin: 4px 0;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notification-item.unread:hover {
  background-color: #d9ecff;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.notification-icon .el-icon {
  font-size: 18px;
}

.notification-content {
  flex: 1;
  margin-left: 12px;
  overflow: hidden;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.panel-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}
</style>
