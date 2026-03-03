export * from './auth'
export * from './api'
export * from './trade'
export * from './test'
export * from './requirement'

export interface Category {
  id: number
  name: string
  description: string
  apiCount: number
}

export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  status: 'active' | 'frozen'
  createTime: string
  role: 'user' | 'admin'
}

export interface PlatformStatistics {
  totalApis: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  dailyActiveUsers: number
  dailyPageViews: number
  apiCallRanking: {
    apiId: number
    apiName: string
    callCount: number
  }[]
  dailyStats: {
    date: string
    activeUsers: number
    pageViews: number
    newUsers: number
    newOrders: number
  }[]
}
