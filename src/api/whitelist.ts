/**
 * API白名单管理请求模块
 * 
 * 对应后端 ApiWhitelistController（/whitelist），提供白名单增删、启停等接口
 * 白名单模式：API启用白名单后，只有白名单中的用户才能调用
 * 【后端类比】相当于后端 ApiWhitelistController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'

/** 白名单用户信息 */
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
