/**
 * 密钥管理 API 请求模块
 * 
 * 对应后端 AccessKeyController（/user/accessKey），提供AK/SK获取和重新生成
 * AK/SK用于API调用时的身份鉴权，签名算法为 SHA256(body + "." + secretKey)
 * 【后端类比】相当于后端 AccessKeyController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'

/** 密钥信息 */
export interface AccessKeyInfo {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 访问密钥（AK），标识调用者身份 */
  accessKey: string
  /** 密钥（SK），用于生成签名，不可泄露 */
  secretKey: string
}

export const accessKeyApi = {
  /** 获取当前用户的AK/SK密钥 */
  getAccessKey() {
    return request.get<AccessKeyInfo>(apiEndpoints.accessKey.info)
  },

  /** 重新生成AK/SK密钥（旧密钥将立即失效） */
  regenerateAccessKey() {
    return request.post<AccessKeyInfo>(apiEndpoints.accessKey.regenerate)
  }
}
