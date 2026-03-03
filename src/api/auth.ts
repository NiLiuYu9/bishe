import { request, apiEndpoints } from '@/utils/request'
import type { LoginParams, RegisterParams, UserInfo } from '@/types/auth'

export const authApi = {
  login(params: LoginParams) {
    return request.post<{ token: string; user: UserInfo }>(apiEndpoints.auth.login, params)
  },

  register(params: RegisterParams) {
    return request.post<{ token: string; user: UserInfo }>(apiEndpoints.auth.register, params)
  },

  logout() {
    return request.post(apiEndpoints.auth.logout)
  },

  getUserInfo() {
    return request.get<UserInfo>(apiEndpoints.auth.userInfo)
  },

  refreshToken() {
    return request.post<{ token: string }>(apiEndpoints.auth.refreshToken)
  }
}
