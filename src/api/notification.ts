import { request } from '@/utils/request'

export const notificationApi = {
  getUnreadList(params: any) {
    return request.get('/notification/unread', params)
  },
  getAllList(params: any) {
    return request.get('/notification/list', params)
  },
  getUnreadCount() {
    return request.get('/notification/unread/count')
  },
  markAsRead(id: number) {
    return request.post(`/notification/read/${id}`)
  },
  markAllAsRead(type?: string) {
    return request.post('/notification/read/all', null, { params: { type } })
  }
}
