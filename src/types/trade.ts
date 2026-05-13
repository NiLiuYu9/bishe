/**
 * 订单/交易相关类型定义
 * 【后端类比】对应后端的 OrderVO / OrderInfo 实体
 * Order 对应后端的 OrderVO；OrderCreateParams 对应 OrderCreateRequestDTO
 */
export interface Order {
  id: number
  orderNo: string
  apiId: number
  apiName: string
  buyerId: number
  buyerName: string
  /** 购买的调用次数，-1 表示无限次 */
  invokeCount: number
  price: number
  /** 订单状态：pending=待支付, paid=已支付, completed=已完成, refunded=已退款, cancelled=已取消 */
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled'
  createTime: string
  payTime: string
  completeTime: string
  /** 订单评分（0.5-5.0，步长0.5） */
  rating?: number
  reviewContent?: string
  reviewId?: number
  /** 以下 _ 前缀字段是前端内部使用的临时状态，不对应后端字段 */
  _reviewInput?: string
  _editingReview?: boolean
}

/** 创建订单的请求参数，对应后端 OrderCreateRequestDTO */
export interface OrderCreateParams {
  apiId: number
  invokeCount: number
}

/** 评价订单的请求参数 */
export interface EvaluateParams {
  orderId: number
  apiId: number
  rating: number
  content: string
}

/** 评价信息（已废弃，现在使用 api/review.ts 中的 ApiReview） */
export interface Evaluation {
  id: number
  apiId: number
  userId: number
  username: string
  rating: number
  content: string
  reply: string
  createTime: string
  replyTime: string
}
