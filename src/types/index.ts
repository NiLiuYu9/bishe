/**
 * =====================================================
 * 类型定义汇总导出 —— 相当于后端的公共类型包
 * =====================================================
 *
 * 【export * 的作用】
 *   将子模块的所有导出重新导出，这样其他文件只需要 import from '@/types'
 *   而不需要 import from '@/types/auth'、import from '@/types/api' 等
 *   【后端类比】相当于后端的 common 模块汇总了所有 DTO/VO 类
 */
export * from './auth'
export * from './api'
export * from './trade'
export * from './test'
export * from './requirement'

/**
 * User —— 管理后台的用户信息类型
 * 【后端类比】对应后端的 UserVO（管理员视角，比 UserInfo 多了更多字段）
 * 与 auth.ts 中的 UserInfo 不同，这是管理员查看用户列表时使用的数据结构
 */
export interface User {
  id: number
  username: string
  email: string
  phone: string
  /** 是否管理员：0=普通用户, 1=管理员 */
  isAdmin: number
  /** 账号状态：0=禁用, 1=启用 */
  status: number
  /** 冻结原因 */
  freezeReason: string
  createTime: string
  /** 用户角色：user=普通用户, admin=管理员 */
  role: 'user' | 'admin'
}

/**
 * PlatformStatistics —— 平台统计数据
 * 【后端类比】对应后端的 PlatformStatisticsVO
 * 用于管理后台仪表盘和统计页面展示
 */
export interface PlatformStatistics {
  totalApis: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  dailyActiveUsers: number
  dailyPageViews: number
  /** API 调用排行榜 */
  apiCallRanking: {
    apiId: number
    apiName: string
    invokeCount: number
  }[]
  /** 每日统计明细 */
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
  /** 上一周期数据（用于计算环比增长） */
  prevTotalApis: number
  prevTotalUsers: number
  prevTotalOrders: number
  prevTotalRevenue: number
  prevDailyActiveUsers: number
  prevDailyPageViews: number
}
