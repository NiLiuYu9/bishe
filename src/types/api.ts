/**
 * =====================================================
 * API 相关类型定义 —— 相当于后端的 DTO/VO/Entity 类
 * =====================================================
 *
 * 【与后端的对应关系】
 *   - ApiItem → 对应后端的 ApiInfoVO / ApiInfo 实体
 *   - ApiParam → 对应后端 api_info.request_params / response_params 的 JSON 结构
 *   - ApiCreateParams → 对应后端的 ApiCreateRequestDTO
 *   - ApiListParams → 对应后端的 ApiQueryRequestDTO（分页查询参数）
 *   - ApiStatistics → 对应后端的 ApiStatisticsVO
 *   - ApiType → 对应后端的 ApiTypeVO / ApiType 实体
 */

/**
 * ApiItem —— API 信息（列表/详情页面使用）
 * 【后端类比】对应后端的 ApiInfoVO，包含 API 的所有展示字段
 */
export interface ApiItem {
  id: number
  name: string
  description: string
  typeName: string
  typeId: number
  userId: number
  username: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  targetUrl?: string
  requestParams: ApiParam[]
  responseParams: ApiParam[]
  price: number
  priceUnit: 'per_call' | 'per_month' | 'per_year'
  callLimit: number
  whitelistEnabled?: number
  status: 'pending' | 'approved' | 'rejected' | 'offline'
  createTime: string
  updateTime: string
  docUrl: string
  rating: number
  invokeCount: number
  successCount: number
  failCount: number
  isFavorited?: boolean
}

/**
 * ApiParam —— API 参数定义
 * 【后端类比】对应后端 api_info 表中 request_params/response_params 的 JSON 元素
 * 存储在数据库中是 JSON 字符串，前端解析后为 ApiParam 数组
 */
export interface ApiParam {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

/**
 * ApiCreateParams —— 创建 API 的请求参数
 * 【后端类比】对应后端的 ApiCreateRequestDTO
 */
export interface ApiCreateParams {
  name: string
  description: string
  typeId: number
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  requestParams: ApiParam[]
  responseParams: ApiParam[]
  price: number
  priceUnit: 'per_call' | 'per_month' | 'per_year'
  callLimit: number
  docUrl?: string
}

/**
 * ApiListParams —— API 列表查询参数
 * 【后端类比】对应后端的 ApiQueryRequestDTO，包含分页、筛选、排序参数
 */
export interface ApiListParams {
  /** 页码（从1开始） */
  pageNum: number
  /** 每页条数 */
  pageSize: number
  /** 搜索关键词（模糊匹配 API 名称） */
  keyword?: string
  /** 按分类 ID 筛选 */
  typeId?: number
  /** 按状态筛选 */
  status?: string
  /** 排序字段 */
  sortBy?: 'price' | 'rating' | 'invokeCount'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * ApiStatistics —— API 调用统计数据
 * 【后端类比】对应后端的 ApiStatisticsVO
 */
export interface ApiStatistics {
  invokeCount: number
  successCount: number
  failCount: number
  dailyStats: {
    date: string
    invokeCount: number
    successCount: number
    failCount: number
    successRate: number
  }[]
  prevInvokeCount: number
  prevSuccessCount: number
  prevFailCount: number
}

/**
 * ApiType —— API 分类信息
 * 【后端类比】对应后端的 ApiTypeVO / ApiType 实体
 */
export interface ApiType {
  id: number
  name: string
  description: string
  status: string
  createTime?: string
  updateTime?: string
  apiCount?: number
}
