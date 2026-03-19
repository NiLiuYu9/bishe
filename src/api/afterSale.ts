import { request, apiEndpoints } from '@/utils/request'

export interface AfterSale {
  id: number
  requirementId: number
  requirementTitle: string
  applicantId: number
  applicantName: string
  developerId: number
  developerName: string
  reason: string
  unimplementedFeatures: string
  developerResponse: string
  developerResponseTime: string
  adminId: number
  adminName: string
  adminDecision: string
  adminDecisionTime: string
  status: string
  result: string
  createTime: string
  updateTime: string
}

export interface AfterSaleMessage {
  id: number
  afterSaleId: number
  senderId: number
  senderName: string
  senderType: 'applicant' | 'developer' | 'admin'
  content: string
  createTime: string
}

export const afterSaleApi = {
  create(data: { requirementId: number; reason: string; unimplementedFeatures?: string }) {
    return request.post<AfterSale>(apiEndpoints.afterSale.create, data)
  },

  respond(id: number, developerResponse: string) {
    return request.post<void>(`${apiEndpoints.afterSale.respond}/${id}`, { developerResponse })
  },

  decide(id: number, data: { adminDecision: string; result?: string }) {
    return request.post<void>(`${apiEndpoints.afterSale.decide}/${id}`, data)
  },

  getDetail(id: number) {
    return request.get<AfterSale>(`${apiEndpoints.afterSale.detail}/${id}`)
  },

  getList(params: { pageNum?: number; pageSize?: number; status?: string }) {
    return request.get<{ list: AfterSale[]; total: number }>(apiEndpoints.afterSale.list, params)
  },

  getMyAfterSales(params: { pageNum?: number; pageSize?: number; status?: string }) {
    return request.get<{ list: AfterSale[]; total: number }>(apiEndpoints.afterSale.myAfterSales, params)
  },

  getDeveloperAfterSales(params: { pageNum?: number; pageSize?: number; status?: string }) {
    return request.get<{ list: AfterSale[]; total: number }>(apiEndpoints.afterSale.developerAfterSales, params)
  },

  getMessages(afterSaleId: number) {
    return request.get<AfterSaleMessage[]>(`${apiEndpoints.afterSale.messages}/${afterSaleId}`)
  },

  sendMessage(afterSaleId: number, content: string) {
    return request.post<AfterSaleMessage>(`${apiEndpoints.afterSale.sendMessage}/${afterSaleId}`, { content })
  }
}
