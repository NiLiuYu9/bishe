import { request, apiEndpoints } from '@/utils/request'
import type { User, ApiItem, ApiType, Order, PlatformStatistics, Requirement } from '@/types'

export const adminApi = {
  getUsers(params: { pageNum: number; pageSize: number; username?: string; status?: number }) {
    return request.get<{ list: User[]; total: number }>(apiEndpoints.admin.users, params)
  },

  freezeUser(id: string | number, data: { reason: string }) {
    return request.put(`${apiEndpoints.admin.freezeUser}/${id}/freeze`, data)
  },

  unfreezeUser(id: string | number) {
    return request.put(`${apiEndpoints.admin.unfreezeUser}/${id}/unfreeze`)
  },

  getApis(params: { pageNum: number; pageSize: number; status?: string }) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.admin.apis, params)
  },

  updateApiStatus(id: string | number, data: { status: string; reason?: string }) {
    return request.put(`${apiEndpoints.admin.apis}/${id}/updateStatus`, data)
  },

  getApiTypes(params: { pageNum: number; pageSize: number; status?: string }) {
    return request.get<{ list: ApiType[]; total: number }>(apiEndpoints.admin.apiTypes, params)
  },

  getAllApiTypes() {
    return request.get<ApiType[]>(apiEndpoints.admin.allApiTypes)
  },

  createApiType(data: { name: string; description: string }) {
    return request.post<ApiType>(apiEndpoints.admin.createApiType, data)
  },

  updateApiType(id: string | number, data: Partial<{ name: string; description: string }>) {
    return request.put(`${apiEndpoints.admin.apiTypes}/${id}`, data)
  },

  updateApiTypeStatus(id: string | number, data: { status: string }) {
    return request.put(`${apiEndpoints.admin.apiTypes}/${id}/updateStatus`, data)
  },

  getOrders(params: { page: number; pageSize: number; status?: string; orderNo?: string }) {
    return request.get<{ list: Order[]; total: number }>(apiEndpoints.admin.orders, {
      pageNum: params.page,
      pageSize: params.pageSize,
      status: params.status,
      orderNo: params.orderNo
    })
  },

  getOrderDetail(id: string | number) {
    return request.get<Order>(`${apiEndpoints.admin.orders}/${id}`)
  },

  updateOrderStatus(id: string | number, status: string) {
    return request.put<void>(`${apiEndpoints.admin.orders}/${id}/updateStatus?status=${status}`)
  },

  getStatistics(params: { 
    startDate?: string
    endDate?: string
    apiName?: string
    typeId?: number
    status?: string
    timeRange?: string
  }) {
    return request.get<PlatformStatistics>(apiEndpoints.admin.statistics, params)
  },

  getRequirements(params: { pageNum: number; pageSize: number; status?: string; keyword?: string }) {
    return request.get<{ list: Requirement[]; total: number }>(apiEndpoints.admin.requirements, params)
  },

  getRequirementDetail(id: string | number) {
    return request.get<Requirement>(`${apiEndpoints.admin.requirements}/${id}`)
  },

  updateRequirementStatus(id: string | number, data: { status: string }) {
    return request.put(`${apiEndpoints.admin.requirements}/${id}/updateStatus`, data)
  }
}
