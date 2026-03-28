export * from './auth'
export * from './api'
export * from './trade'
export * from './test'
export * from './requirement'

export interface User {
  id: number
  username: string
  email: string
  phone: string
  isAdmin: number
  status: number
  freezeReason: string
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
    invokeCount: number
  }[]
  dailyStats: {
    date: string
    activeUsers: number
    pageViews: number
    newUsers: number
    newOrders: number
    invokeCount: number
    successCount: number
    failCount: number
    successRate: number
  }[]
  prevTotalApis: number
  prevTotalUsers: number
  prevTotalOrders: number
  prevTotalRevenue: number
  prevDailyActiveUsers: number
  prevDailyPageViews: number
}
