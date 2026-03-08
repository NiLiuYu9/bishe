import { request, apiEndpoints } from '@/utils/request'

export interface UserQuota {
  id: number
  apiId: number
  apiName: string
  totalCount: number
  usedCount: number
  remainingCount: number
  createTime: string
  updateTime: string
}

export interface QuotaQueryParams {
  pageNum?: number
  pageSize?: number
  apiName?: string
}

export const quotaApi = {
  getQuotaList(params: QuotaQueryParams) {
    return request.get<{ list: UserQuota[]; total: number }>(apiEndpoints.quota.list, params)
  }
}
