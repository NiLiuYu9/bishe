import { request, apiEndpoints } from '@/utils/request'
import type { LoginParams, RegisterParams, UserInfo, LoginResult } from '@/types/auth'

export const authApi = {
  login(params: LoginParams) {
    return request.post<LoginResult>(apiEndpoints.auth.login, params)
  },

  register(params: RegisterParams) {
    return request.post<void>(apiEndpoints.auth.register, params)
  },

  logout() {
    return request.post(apiEndpoints.auth.logout)
  },

  getUserInfo() {
    return request.get<UserInfo>(apiEndpoints.auth.userInfo)
  },

  updateUserInfo(data: Partial<UserInfo>) {
    return request.put<UserInfo>(apiEndpoints.auth.updateUserInfo, data)
  },

  updatePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put(apiEndpoints.auth.updatePassword, data)
  }
}
