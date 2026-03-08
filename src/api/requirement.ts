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

  getMyRequirements(params: RequirementListParams) {
    return request.get<{ list: Requirement[]; total: number }>(apiEndpoints.requirement.myRequirements, params)
  }
}
