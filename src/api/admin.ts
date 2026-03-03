import { request, apiEndpoints } from '@/utils/request'
import type { User, ApiItem, Category, Order, PlatformStatistics } from '@/types'

export const adminApi = {
  getUsers(params: { page: number; pageSize: number; keyword?: string }) {
    return request.get<{ list: User[]; total: number }>(apiEndpoints.admin.users, params)
  },

  getUserDetail(id: string | number) {
    return request.get<User>(`${apiEndpoints.admin.userDetail}/${id}`)
  },

  freezeUser(id: string | number, data: { reason: string }) {
    return request.post(`${apiEndpoints.admin.freezeUser}/${id}`, data)
  },

  getApis(params: { page: number; pageSize: number; status?: string }) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.admin.apis, params)
  },

  auditApi(id: string | number, data: { status: 'approved' | 'rejected'; reason?: string }) {
    return request.post(`${apiEndpoints.admin.auditApi}/${id}`, data)
  },

  getCategories() {
    return request.get<Category[]>(apiEndpoints.admin.categories)
  },

  createCategory(data: { name: string; description: string }) {
    return request.post<Category>(apiEndpoints.admin.categories, data)
  },

  updateCategory(id: string | number, data: Partial<{ name: string; description: string }>) {
    return request.put(`${apiEndpoints.admin.categories}/${id}`, data)
  },

  deleteCategory(id: string | number) {
    return request.delete(`${apiEndpoints.admin.categories}/${id}`)
  },

  getOrders(params: { page: number; pageSize: number; status?: string }) {
    return request.get<{ list: Order[]; total: number }>(apiEndpoints.admin.orders, params)
  },

  getStatistics(params: { startDate: string; endDate: string }) {
    return request.get<PlatformStatistics>(apiEndpoints.admin.statistics, params)
  }
}
