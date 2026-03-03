import { request, apiEndpoints } from '@/utils/request'
import type { TestRecord, TestCallParams } from '@/types/test'

export const testApi = {
  testCall(data: TestCallParams) {
    return request.post<{ result: any; success: boolean }>(apiEndpoints.test.testCall, data)
  },

  saveRecord(data: TestRecord) {
    return request.post(apiEndpoints.test.saveRecord, data)
  },

  getRecords(params: { apiId: string | number; page: number; pageSize: number }) {
    return request.get<{ list: TestRecord[]; total: number }>(apiEndpoints.test.records, params)
  }
}
