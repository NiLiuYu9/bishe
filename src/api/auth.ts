/**
 * =====================================================
 * 认证相关 API 请求模块 —— 相当于后端的 AuthController 的前端调用层
 * =====================================================
 *
 * 【API 模块的作用】
 *   每个模块封装了对应后端 Controller 的所有 HTTP 请求
 *   【后端类比】相当于后端的 Feign Client / Dubbo Consumer
 *   - 后端用 @DubboReference 注入远程服务 → 前端用 import { authApi } 引入 API 模块
 *   - 后端调用 userService.login(params) → 前端调用 authApi.login(params)
 *   - 区别：后端是 RPC 调用，前端是 HTTP 请求
 *
 * 【request.post<LoginResult> 是什么意思？】
 *   - request.post —— 发送 POST 请求（相当于后端的 @PostMapping）
 *   - <LoginResult> —— 泛型参数，指定响应 data 的类型
 *   - 相当于后端：Result<LoginResult> result = restTemplate.postForObject(url, params, Result.class)
 *
 * 【apiEndpoints.auth.login 是什么？】
 *   从 config/index.ts 中获取的 API 路径常量 '/auth/login'
 *   【后端类比】相当于后端的 @PostMapping("/login") 中的路径值
 */
import { request, apiEndpoints } from '@/utils/request'
import type { LoginParams, RegisterParams, UserInfo, LoginResult } from '@/types/auth'

/**
 * authApi —— 认证 API 对象
 * 【后端类比】相当于后端的 AuthController 的所有接口方法集合
 * 每个方法对应后端 Controller 中的一个接口
 */
export const authApi = {
  /** 用户登录 → 后端 AuthController.login()，@PostMapping("/login") */
  login(params: LoginParams) {
    return request.post<LoginResult>(apiEndpoints.auth.login, params)
  },

  /** 用户注册 → 后端 AuthController.register()，@PostMapping("/register") */
  register(params: RegisterParams) {
    return request.post<void>(apiEndpoints.auth.register, params)
  },

  /** 用户登出 → 后端 AuthController.logout()，@PostMapping("/logout")，销毁服务端 Session */
  logout() {
    return request.post(apiEndpoints.auth.logout)
  },

  /** 获取当前登录用户信息 → 后端 AuthController.getUserInfo()，@GetMapping("/user-info") */
  getUserInfo() {
    return request.get<UserInfo>(apiEndpoints.auth.userInfo)
  },

  /** 更新用户信息 → 后端 AuthController.updateUserInfo()，@PutMapping("/user-info") */
  updateUserInfo(data: Partial<UserInfo>) {
    return request.put<UserInfo>(apiEndpoints.auth.updateUserInfo, data)
  },

  /** 修改密码 → 后端 AuthController.updatePassword()，@PutMapping("/password") */
  updatePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put(apiEndpoints.auth.updatePassword, data)
  }
}
