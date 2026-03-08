import { request, apiEndpoints } from '@/utils/request'
import type { User, ApiItem, ApiType, Order, PlatformStatistics } from '@/types'

export const adminApi = {
  getUsers(params: { pageNum: number; pageSize: number; username?: string; status?: number }) {
    return request.get<{ records: User[]; total: number }>(apiEndpoints.admin.users, params)
  },

  getUserDetail(id: string | number) {
    return request.get<User>(`${apiEndpoints.admin.userDetail}/${id}`)
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
    return request.post(`${apiEndpoints.admin.updateApiStatus}/${id}`, data)
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
    return request.put(`${apiEndpoints.admin.updateApiType}/${id}`, data)
  },

  updateApiTypeStatus(id: string | number, data: { status: string }) {
    return request.post(`${apiEndpoints.admin.updateApiTypeStatus}/${id}`, data)
  },

  getOrders(params: { page: number; pageSize: number; status?: string }) {
    return request.get<{ list: Order[]; total: number }>(apiEndpoints.admin.orders, params)
  },

  getStatistics(params: { startDate: string; endDate: string }) {
    return request.get<PlatformStatistics>(apiEndpoints.admin.statistics, params)
  }
}
