export interface Requirement {
  id: number
  title: string
  description: string
  tags: string[]
  requestParams: ParamDefinition[]
  responseParams: ParamDefinition[]
  budget: number
  deadline: string
  userId: number
  username: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applicants: Applicant[]
  selectedApplicant?: Applicant
  createTime: string
  updateTime: string
}

export interface ParamDefinition {
  name: string
  type: string
  description: string
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
  tags: string[]
  requestParams: ParamDefinition[]
  responseParams: ParamDefinition[]
  budget: number
  deadline: string
}

export interface RequirementListParams {
  page: number
  pageSize: number
  keyword?: string
  tags?: string[]
  minBudget?: number
  maxBudget?: number
  status?: string
  sortBy?: 'budget' | 'deadline' | 'createTime'
  sortOrder?: 'asc' | 'desc'
}
