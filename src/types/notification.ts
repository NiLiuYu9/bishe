export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string
  relatedId: number
  relatedType: string
  isRead: number
  createTime: string
}

export interface NotificationQuery {
  pageNum: number
  pageSize: number
  type?: string
}

export const NotificationTypeLabels: Record<string, string> = {
  requirement_new_message: '需求消息',
  requirement_status_update: '需求状态',
  after_sale_new_message: '售后消息',
  after_sale_status_update: '售后状态',
  api_review_reply: '评价回复',
  api_new_review: '新评价'
}

export const NotificationTypeColors: Record<string, string> = {
  requirement_new_message: '#409EFF',
  requirement_status_update: '#67C23A',
  after_sale_new_message: '#E6A23C',
  after_sale_status_update: '#F56C6C',
  api_review_reply: '#909399',
  api_new_review: '#409EFF'
}
