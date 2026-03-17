import { request, apiEndpoints } from '@/utils/request'
import type { TestRecord, TestCallParams } from '@/types/test'

export const testApi = {
  testCall(data: TestCallParams) {
    return request.post<{ result: any; success: boolean }>(apiEndpoints.test.testCall, data)
  },

  getRecordCount(apiId: string | number) {
    return request.get<number>(apiEndpoints.test.recordCount, { apiId })
  },

  saveRecord(data: TestRecord) {
    return request.post<TestRecord>(apiEndpoints.test.saveRecord, data)
  },

  getRecords(apiId: string | number) {
    return request.get<TestRecord[]>(apiEndpoints.test.records, { apiId })
  },

  deleteRecord(id: number) {
    return request.delete<void>(`${apiEndpoints.test.deleteRecord}/${id}`)
  }
}
