export interface Order {
  id: number
  orderNo: string
  apiId: number
  apiName: string
  buyerId: number
  buyerName: string
  sellerId: number
  sellerName: string
  packageType: 'basic' | 'standard' | 'premium' | 'unlimited'
  callCount: number
  price: number
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled'
  createTime: string
  payTime: string
  completeTime: string
}

export interface OrderCreateParams {
  apiId: number
  packageType: 'basic' | 'standard' | 'premium' | 'unlimited'
  callCount: number
}

export interface EvaluateParams {
  orderId: number
  apiId: number
  rating: number
  content: string
}

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
