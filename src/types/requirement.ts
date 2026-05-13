/**
 * 需求相关类型定义
 * 【后端类比】对应后端的 RequirementVO / Requirement 实体 / RequirementApplicant 实体
 */
export interface Requirement {
  id: number
  title: string
  description: string
  requestParams: ParamDefinition[]
  responseParams: ParamDefinition[]
  budget: number
  deadline: string
  userId: number
  username: string
  /** 需求状态：open=开放中, in_progress=进行中, delivered=已交付, completed=已完成, cancelled=已取消, after_sale=售后中, refunded=已退款 */
  status: 'open' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'after_sale' | 'refunded'
  /** 申请人列表 */
  applicants: Applicant[]
  /** 被选中的开发者 */
  selectedApplicant?: Applicant
  /** 当前用户的申请状态 */
  myApplyStatus?: 'pending' | 'accepted' | 'rejected'
  createTime: string
  updateTime: string
  deliveryUrl?: string
  tags?: string[]
  /** 智能匹配分数（0-100） */
  matchScore?: number
}

/** 参数定义，与 ApiParam 结构相同，用于需求的请求/响应参数 */
export interface ParamDefinition {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

/** 申请人信息，对应后端的 RequirementApplicant 实体 */
export interface Applicant {
  id: number
  userId: number
  username: string
  description: string
  /** 申请状态：pending=待审核, accepted=已接受, rejected=已拒绝 */
  status: 'pending' | 'accepted' | 'rejected'
  applyTime: string
}

/** 创建需求的请求参数，对应后端 RequirementCreateRequestDTO */
export interface RequirementCreateParams {
  title: string
  description: string
  requestParams: ParamDefinition[]
  responseParams: ParamDefinition[]
  budget: number
  deadline: string
  tags?: string[]
}

/** 需求列表查询参数，对应后端 RequirementQueryRequestDTO */
export interface RequirementListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  minBudget?: number
  maxBudget?: number
  status?: string
  sortBy?: 'budget' | 'deadline' | 'createTime'
  sortOrder?: 'asc' | 'desc'
}
