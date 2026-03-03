export interface TestRecord {
  id: number
  apiId: number
  apiName: string
  userId: number
  params: Record<string, any>
  result: any
  success: boolean
  errorMsg?: string
  createTime: string
}

export interface TestCallParams {
  apiId: number
  params: Record<string, any>
}
