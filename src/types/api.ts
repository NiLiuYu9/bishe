export interface ApiItem {
  id: number
  name: string
  description: string
  typeName: string
  typeId: number
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
  typeId: number
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
  pageNum: number
  pageSize: number
  keyword?: string
  typeId?: number
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
    successRate: number
  }[]
  prevInvokeCount: number
  prevSuccessCount: number
  prevFailCount: number
}

export interface ApiType {
  id: number
  name: string
  description: string
  status: string
  createTime?: string
  updateTime?: string
  apiCount?: number
}
