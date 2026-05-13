/**
 * 通知消息 API 请求模块
 * 
 * 对应后端 NotificationController（/notification），提供未读消息、消息列表、标记已读等接口
 * 通知通过WebSocket实时推送，此模块用于历史消息查询和已读标记
 * 【后端类比】相当于后端 NotificationController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request } from '@/utils/request'

export const notificationApi = {
  /** 获取未读消息列表 */
  getUnreadList(params: any) {
    return request.get('/notification/unread', params)
  },

  /** 获取所有消息列表（含已读和未读） */
  getAllList(params: any) {
    return request.get('/notification/list', params)
  },

  /** 获取未读消息数量（用于导航栏铃铛角标） */
  getUnreadCount() {
    return request.get('/notification/unread/count')
  },

  /** 标记单条消息为已读 */
  markAsRead(id: number) {
    return request.post(`/notification/read/${id}`)
  },

  /** 标记所有消息为已读（可按类型筛选） */
  markAllAsRead(type?: string) {
    return request.post('/notification/read/all', null, { params: { type } })
  }
}
