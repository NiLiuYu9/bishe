/**
 * API测试相关请求模块
 * 
 * 对应后端 TestController（/test），提供在线调用测试、测试记录管理等接口
 * 【后端类比】相当于后端 TestController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'
import type { TestRecord, TestCallParams } from '@/types/test'

export const testApi = {
  /** 在线调用测试API，返回调用结果 */
  testCall(data: TestCallParams) {
    return request.post<{ result: any; success: boolean }>(apiEndpoints.test.testCall, data)
  },

  /** 获取今日测试记录数量（用于限制每日测试次数） */
  getRecordCount(apiId: string | number) {
    return request.get<number>(apiEndpoints.test.recordCount, { apiId })
  },

  /** 手动保存测试记录 */
  saveRecord(data: TestRecord) {
    return request.post<TestRecord>(apiEndpoints.test.saveRecord, data)
  },

  /** 获取某API的测试记录列表 */
  getRecords(apiId: string | number) {
    return request.get<TestRecord[]>(apiEndpoints.test.records, { apiId })
  },

  /** 删除测试记录 */
  deleteRecord(id: number) {
    return request.delete<void>(`${apiEndpoints.test.deleteRecord}/${id}`)
  }
}
