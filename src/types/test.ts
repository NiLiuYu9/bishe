/**
 * API 测试相关类型定义
 * 【后端类比】对应后端的 ApiTestRecordVO / ApiTestRecord 实体
 */
export interface TestRecord {
  id: number
  apiId: number
  apiName: string
  userId: number
  /** 测试参数，Record<string, any> 相当于 Java 的 Map<String, Object> */
  params: Record<string, any>
  /** 测试结果（任意类型） */
  result: any
  /** 是否调用成功 */
  success: boolean
  /** 错误信息（调用失败时有值） */
  errorMsg?: string
  /** 响应时间（毫秒） */
  responseTime?: number
  /** HTTP 状态码 */
  statusCode?: number
  createTime: string
}

/** 测试调用请求参数，对应后端 TestCallRequestDTO */
export interface TestCallParams {
  apiId: number
  /** 调用参数，键值对形式 */
  params: Record<string, any>
}
