import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wsClient } from '@/utils/websocket'
import { notificationApi } from '@/api/notification'
import type { Notification, NotificationQuery } from '@/types/notification'
import config from '@/config'

export const useNotificationStore = defineStore('notification', () => {
  const isConnected = ref(false)
  const unreadCount = ref(0)
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const wsUrl = config.baseURL.replace('/api', '').replace('http', 'ws') + '/ws'

  function connect() {
    if (isConnected.value) {
      console.log('[WebSocket] Already connected, skipping')
      return
    }

    console.log('[WebSocket] Connecting to:', wsUrl)
    wsClient.connect({
      url: wsUrl,
      onOpen: () => {
        console.log('[WebSocket] Connected successfully')
        isConnected.value = true
        fetchUnreadCount()
      },
      onClose: () => {
        console.log('[WebSocket] Connection closed')
        isConnected.value = false
      },
      onError: (error) => {
        console.error('[WebSocket] Connection error:', error)
      },
      onMessage: (data) => {
        console.log('[WebSocket] Message received:', data)
        if (data.type === 'notification' && data.data) {
          handleNewNotification(data.data, data.unreadCount)
        }
      },
      onReconnect: (attempt) => {
        console.log(`[WebSocket] Reconnecting, attempt: ${attempt}`)
      }
    })
  }

  function disconnect() {
    wsClient.disconnect()
    isConnected.value = false
  }

  function handleNewNotification(notification: Notification, serverUnreadCount?: number) {
    if (serverUnreadCount !== undefined) {
      unreadCount.value = serverUnreadCount
    } else {
      unreadCount.value++
    }
    notifications.value.unshift(notification)
    if (notifications.value.length > 50) {
      notifications.value.pop()
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await notificationApi.getUnreadCount()
      unreadCount.value = res.data || 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  async function fetchNotifications(params: NotificationQuery) {
    loading.value = true
    try {
      const res = await notificationApi.getUnreadList(params)
      notifications.value = res.data?.list || []
      return res.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchAllNotifications(params: NotificationQuery) {
    loading.value = true
    try {
      const res = await notificationApi.getAllList(params)
      return res.data
    } catch (error) {
      console.error('Failed to fetch all notifications:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    try {
      await notificationApi.markAsRead(id)
      const notification = notifications.value.find(n => n.id === id)
      if (notification && notification.isRead === 0) {
        notification.isRead = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  async function markAllAsRead(type?: string) {
    try {
      await notificationApi.markAllAsRead(type)
      notifications.value.forEach(n => {
        if (!type || n.type === type) {
          n.isRead = 1
        }
      })
      if (!type) {
        unreadCount.value = 0
      } else {
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return {
    isConnected,
    unreadCount,
    notifications,
    loading,
    connect,
    disconnect,
    fetchUnreadCount,
    fetchNotifications,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead
  }
})
