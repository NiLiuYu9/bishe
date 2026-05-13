/**
 * 需求管理 API 请求模块
 * 
 * 对应后端 RequirementController（/requirement），提供需求发布、申请、接单、交付等接口
 * 需求状态流转：open → in_progress → delivered → completed / cancelled
 * 【后端类比】相当于后端 RequirementController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'
import type { Requirement, RequirementCreateParams, RequirementListParams } from '@/types/requirement'

export const requirementApi = {
  getList(params: RequirementListParams) {
    return request.get<{ list: Requirement[]; total: number }>(apiEndpoints.requirement.list, params)
  },

  getDetail(id: string | number) {
    return request.get<Requirement>(`${apiEndpoints.requirement.detail}/${id}`)
  },

  create(data: RequirementCreateParams) {
    return request.post<Requirement>(apiEndpoints.requirement.create, data)
  },

  update(id: string | number, data: Partial<RequirementCreateParams>) {
    return request.put<Requirement>(`${apiEndpoints.requirement.update}/${id}`, data)
  },

  delete(id: string | number) {
    return request.delete(`${apiEndpoints.requirement.delete}/${id}`)
  },

  apply(id: string | number, data: { description: string }) {
    return request.post(`${apiEndpoints.requirement.apply}/${id}`, data)
  },

  withdrawApply(id: string | number) {
    return request.post(`${apiEndpoints.requirement.withdrawApply}/${id}`)
  },

  selectApplicant(id: string | number, data: { applicantId: number }) {
    return request.post(`${apiEndpoints.requirement.selectApplicant}/${id}`, data)
  },

  complete(id: string | number) {
    return request.post(`${apiEndpoints.requirement.complete}/${id}`)
  },

  cancel(id: string | number) {
    return request.post(`${apiEndpoints.requirement.cancel}/${id}`)
  },

  deliver(id: string | number, data: { deliveryUrl: string }) {
    return request.post(`${apiEndpoints.requirement.deliver}/${id}`, data)
  },

  confirmDelivery(id: string | number) {
    return request.post(`${apiEndpoints.requirement.confirmDelivery}/${id}`)
  },

  getMyRequirements(params: RequirementListParams) {
    return request.get<{ list: Requirement[]; total: number }>(apiEndpoints.requirement.myRequirements, params)
  }
}
