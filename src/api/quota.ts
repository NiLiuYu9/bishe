/**
 * 配额管理 API 请求模块
 * 
 * 对应后端 QuotaController（/quota），查询用户购买API后的调用配额
 * 配额 = 总购买次数(totalCount) - 已使用次数(usedCount)
 * 【后端类比】相当于后端 QuotaController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'

/** 用户API配额信息 */
export interface UserQuota {
  id: number
  /** API ID */
  apiId: number
  /** API名称 */
  apiName: string
  /** 总购买调用次数 */
  totalCount: number
  /** 已使用调用次数 */
  usedCount: number
  /** 剩余调用次数 */
  remainingCount: number
  createTime: string
  updateTime: string
}

/** 配额查询参数 */
export interface QuotaQueryParams {
  pageNum?: number
  pageSize?: number
  /** 按API名称模糊搜索 */
  apiName?: string
}

export const quotaApi = {
  /** 查询当前用户的API调用配额列表 */
  getQuotaList(params: QuotaQueryParams) {
    return request.get<{ list: UserQuota[]; total: number }>(apiEndpoints.quota.list, params)
  }
}
