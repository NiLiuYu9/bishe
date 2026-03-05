export interface ApiItem {
  id: number
  name: string
  description: string
  category: string
  categoryId: number
  userId: number
  username: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  requestParams: ApiParam[]
  responseParams: ApiParam[]
  price: number
  priceUnit: 'per_call' | 'per_month' | 'per_year'
  callLimit: number
  status: 'pending' | 'approved' | 'rejected' | 'offline'
  createTime: string
  updateTime: string
  docUrl: string
  rating: number
  invokeCount: number
  successCount: number
  failCount: number
}

export interface ApiParam {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

export interface ApiCreateParams {
  name: string
  description: string
  categoryId: number
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  requestParams: ApiParam[]
  responseParams: ApiParam[]
  price: number
  priceUnit: 'per_call' | 'per_month' | 'per_year'
  callLimit: number
  docUrl?: string
}

export interface ApiListParams {
  page: number
  pageSize: number
  keyword?: string
  categoryId?: number
  status?: string
  sortBy?: 'price' | 'rating' | 'invokeCount'
  sortOrder?: 'asc' | 'desc'
}

export interface ApiStatistics {
  invokeCount: number
  successCount: number
  failCount: number
  dailyStats: {
    date: string
    invokeCount: number
    successCount: number
    failCount: number
  }[]
}
