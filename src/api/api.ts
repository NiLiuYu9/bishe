import { request, apiEndpoints } from '@/utils/request'
import type { ApiItem, ApiCreateParams, ApiListParams, ApiStatistics, ApiType } from '@/types/api'

export const apiManagement = {
  getList(params: ApiListParams) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.api.list, params)
  },

  getDetail(id: string | number) {
    return request.get<ApiItem>(`${apiEndpoints.api.detail}/${id}`)
  },

  create(data: ApiCreateParams) {
    return request.post<ApiItem>(apiEndpoints.api.create, data)
  },

  update(id: string | number, data: Partial<ApiCreateParams>) {
    return request.put<ApiItem>(`${apiEndpoints.api.update}/${id}`, data)
  },

  updateStatus(id: string | number, data: { status: string }) {
    return request.put(`${apiEndpoints.api.updateStatus}/${id}`, data)
  },

  delete(id: string | number) {
    return request.delete(`${apiEndpoints.api.delete}/${id}`)
  },

  getMyApis(params: ApiListParams) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.api.myApis, params)
  },

  submitAudit(id: string | number) {
    return request.post(`${apiEndpoints.api.audit}/${id}`)
  },

  getStatistics(id: string | number, params: { startDate?: string; endDate?: string }) {
    return request.get<ApiStatistics>(`${apiEndpoints.api.statistics}/${id}`, params)
  },

  getMyInvokeStatistics(params: { 
    userId: number
    startDate?: string
    endDate?: string
    apiName?: string
    typeId?: number
    status?: string
    timeRange?: string
  }) {
    return request.get<ApiStatistics>(apiEndpoints.api.myInvokeStatistics, params)
  },

  getMyApiInvokeStatistics(params: { 
    userId: number
    startDate?: string
    endDate?: string
    apiName?: string
    typeId?: number
    status?: string
    timeRange?: string
  }) {
    return request.get<ApiStatistics>(apiEndpoints.api.myApiInvokeStatistics, params)
  },

  getTypes() {
    return request.get<ApiType[]>(apiEndpoints.admin.allApiTypes)
  },

  getApiTypes(params?: { pageNum?: number; pageSize?: number }) {
    return request.get<{ list: ApiType[]; total: number }>(apiEndpoints.api.apiTypes, params)
  }
}

export const apiFavorite = {
  add(apiId: number) {
    return request.post(`${apiEndpoints.favorite.add}/${apiId}`)
  },

  remove(apiId: number) {
    return request.delete(`${apiEndpoints.favorite.remove}/${apiId}`)
  },

  check(apiId: number) {
    return request.get<boolean>(`${apiEndpoints.favorite.check}/${apiId}`)
  },

  getList(params?: { pageNum?: number; pageSize?: number }) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.favorite.list, params)
  }
}
