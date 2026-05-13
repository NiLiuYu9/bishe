/**
 * 通知消息相关类型定义
 * 【后端类比】对应后端的 NotificationMessageVO / NotificationMessage 实体
 */
export interface Notification {
  id: number
  userId: number
  /** 通知类型，如 requirement_new_message / api_review_reply 等 */
  type: string
  title: string
  content: string
  /** 关联业务ID（如需求ID、评价ID） */
  relatedId: number
  /** 关联业务类型（如 requirement / review） */
  relatedType: string
  /** 是否已读：0=未读, 1=已读 */
  isRead: number
  createTime: string
}

/** 通知查询参数 */
export interface NotificationQuery {
  pageNum: number
  pageSize: number
  /** 按类型筛选 */
  type?: string
}

/**
 * NotificationTypeLabels —— 通知类型的中文标签映射
 * 【后端类比】相当于后端的枚举映射，将英文类型键转为中文显示
 * Record<string, string> 相当于 Java 的 Map<String, String>
 */
export const NotificationTypeLabels: Record<string, string> = {
  requirement_new_message: '需求消息',
  requirement_status_update: '需求状态',
  after_sale_new_message: '售后消息',
  after_sale_status_update: '售后状态',
  api_review_reply: '评价回复',
  api_new_review: '新评价'
}

/** 通知类型的颜色映射（用于不同类型消息的视觉区分） */
export const NotificationTypeColors: Record<string, string> = {
  requirement_new_message: '#409EFF',
  requirement_status_update: '#67C23A',
  after_sale_new_message: '#E6A23C',
  after_sale_status_update: '#F56C6C',
  api_review_reply: '#909399',
  api_new_review: '#409EFF'
}
