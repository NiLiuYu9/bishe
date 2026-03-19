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
  status: 'open' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'after_sale' | 'refunded'
  applicants: Applicant[]
  selectedApplicant?: Applicant
  myApplyStatus?: 'pending' | 'accepted' | 'rejected'
  createTime: string
  updateTime: string
  deliveryUrl?: string
}

export interface ParamDefinition {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

export interface Applicant {
  id: number
  userId: number
  username: string
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  applyTime: string
}

export interface RequirementCreateParams {
  title: string
  description: string
  requestParams: ParamDefinition[]
  responseParams: ParamDefinition[]
  budget: number
  deadline: string
}

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
