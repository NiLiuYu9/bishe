/**
 * =====================================================
 * 通知状态管理 Store —— 相当于后端的通知服务 + WebSocket 管理
 * =====================================================
 *
 * 【核心概念】
 *   - 管理未读消息数和消息列表
 *   - 由 WebSocket 驱动实时更新（后端推送新消息 → 前端自动更新未读数）
 *   - 页面加载时连接 WebSocket，收到新消息时自动更新
 *
 * 【后端类比】
 *   - 后端：NotificationController 提供消息查询接口
 *   - 前端：本 Store 封装了消息查询 + WebSocket 实时推送
 *   - 相当于后端的 NotificationService + WebSocketServer 的前端对应
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { wsClient } from '@/utils/websocket'
import { notificationApi } from '@/api/notification'
import type { Notification, NotificationQuery } from '@/types/notification'
import config from '@/config'

/**
 * useNotificationStore —— 通知 Store 的 Hook 函数
 * 【后端类比】相当于后端的 @Autowired NotificationService
 */
export const useNotificationStore = defineStore('notification', () => {
  /** WebSocket 是否已连接 */
  const isConnected = ref(false)
  /** 未读消息数量（用于导航栏铃铛角标显示） */
  const unreadCount = ref(0)
  /** 消息列表（本地缓存，最多50条） */
  const notifications = ref<Notification[]>([])
  /** 是否正在加载消息列表 */
  const loading = ref(false)

  /**
   * wsUrl —— WebSocket 服务器地址
   * 将 HTTP 基地址转换为 WebSocket 地址：
   *   http://localhost:8080/api → ws://localhost:8080/ws
   * 【转换逻辑】
   *   1. replace('/api', '') → 去掉 /api 后缀，得到 http://localhost:8080
   *   2. replace('http', 'ws') → http 变为 ws，得到 ws://localhost:8080
   *   3. + '/ws' → 加上 WebSocket 端点路径，得到 ws://localhost:8080/ws
   */
  const wsUrl = config.baseURL.replace('/api', '').replace('http', 'ws') + '/ws'

  /**
   * connect —— 连接 WebSocket
   * 【后端类比】相当于后端的 WebSocketContainer.connectToServer()
   * 连接成功后自动获取未读消息数
   */
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
        fetchUnreadCount()  // 连接成功后获取未读数
      },
      onClose: () => {
        console.log('[WebSocket] Connection closed')
        isConnected.value = false
      },
      onError: (error) => {
        console.error('[WebSocket] Connection error:', error)
      },
      /**
       * onMessage —— 收到 WebSocket 消息时的回调
       * 【后端类比】相当于后端的 @OnMessage 注解方法
       * 消息格式：{ type: "notification", data: {...}, unreadCount: 5 }
       */
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

  /**
   * disconnect —— 断开 WebSocket
   * 【后端类比】相当于后端的 Session.close()
   * 通常在用户登出时调用
   */
  function disconnect() {
    wsClient.disconnect()
    isConnected.value = false
  }

  /**
   * handleNewNotification —— 处理收到的新通知
   * 【后端类比】相当于后端收到新消息后的处理逻辑
   *
   * @param notification 新通知对象
   * @param serverUnreadCount 服务器返回的未读数（可选）
   */
  function handleNewNotification(notification: Notification, serverUnreadCount?: number) {
    if (serverUnreadCount !== undefined) {
      /** 服务器返回了准确的未读数 → 直接使用 */
      unreadCount.value = serverUnreadCount
    } else {
      /** 服务器没返回未读数 → 本地 +1 */
      unreadCount.value++
    }
    /**
     * unshift —— 在数组头部插入元素（最新的消息在最前面）
     * 【后端类比】相当于 Java 的 List.add(0, element)
     */
    notifications.value.unshift(notification)
    /** 限制本地缓存最多50条，防止内存占用过大 */
    if (notifications.value.length > 50) {
      /**
       * pop —— 移除数组最后一个元素（最旧的消息）
       * 【后端类比】相当于 Java 的 List.remove(list.size() - 1)
       */
      notifications.value.pop()
    }
  }

  /**
   * fetchUnreadCount —— 获取未读消息数量
   * 【后端类比】相当于后端的 NotificationController.getUnreadCount()
   * 用于 WebSocket 连接成功后同步未读数
   */
  async function fetchUnreadCount() {
    try {
      const res = await notificationApi.getUnreadCount()
      unreadCount.value = res.data || 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  /**
   * fetchNotifications —— 获取未读消息列表
   * 【后端类比】相当于后端的 NotificationController.getUnreadList()
   */
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
      /**
       * finally —— 无论成功还是失败都会执行
       * 【后端类比】相当于 Java 的 try-catch-finally
       * 确保 loading 状态一定会被重置
       */
      loading.value = false
    }
  }

  /**
   * fetchAllNotifications —— 获取所有消息列表（含已读和未读）
   * 【后端类比】相当于后端的 NotificationController.getAllList()
   */
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

  /**
   * markAsRead —— 标记单条消息为已读
   * 【后端类比】相当于后端的 NotificationController.markAsRead()
   * 标记后更新本地状态：消息的 isRead 改为 1，未读数 -1
   */
  async function markAsRead(id: number) {
    try {
      await notificationApi.markAsRead(id)
      /** 在本地列表中找到该消息 */
      const notification = notifications.value.find(n => n.id === id)
      if (notification && notification.isRead === 0) {
        notification.isRead = 1
        /** Math.max(0, ...) 确保未读数不会小于0 */
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  /**
   * markAllAsRead —— 标记所有消息为已读
   * 【后端类比】相当于后端的 NotificationController.markAllAsRead()
   * @param type 可选，按类型标记（如只标记"需求消息"为已读）
   */
  async function markAllAsRead(type?: string) {
    try {
      await notificationApi.markAllAsRead(type)
      /**
       * forEach —— 遍历数组中的每个元素
       * 【后端类比】相当于 Java 的 list.forEach(n -> { ... })
       */
      notifications.value.forEach(n => {
        if (!type || n.type === type) {
          n.isRead = 1
        }
      })
      if (!type) {
        /** 没有指定类型 → 全部标记已读，未读数归零 */
        unreadCount.value = 0
      } else {
        /** 指定了类型 → 重新从后端获取未读数 */
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
