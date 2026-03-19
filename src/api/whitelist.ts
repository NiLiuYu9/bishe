import { request, apiEndpoints } from '@/utils/request'

export interface WhitelistUser {
  id: number
  userId: number
  username: string
  createTime: string
}

export const whitelistApi = {
  add(apiId: number, usernames: string[]) {
    return request.post<void>(`${apiEndpoints.whitelist.add}/${apiId}`, { usernames })
  },

  remove(apiId: number, userId: number) {
    return request.delete<void>(`${apiEndpoints.whitelist.remove}/${apiId}/${userId}`)
  },

  getList(apiId: number, pageNum = 1, pageSize = 10) {
    return request.get<{ list: WhitelistUser[]; total: number }>(`${apiEndpoints.whitelist.list}/${apiId}`, {
      pageNum,
      pageSize
    })
  },

  enable(apiId: number) {
    return request.post<void>(`${apiEndpoints.whitelist.enable}/${apiId}`)
  },

  disable(apiId: number) {
    return request.post<void>(`${apiEndpoints.whitelist.disable}/${apiId}`)
  }
}
