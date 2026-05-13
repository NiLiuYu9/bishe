/**
 * API管理相关请求模块
 * 
 * 对应后端 ApiController（/api），提供API列表、详情、创建、更新、统计等接口
 * 同时包含收藏相关接口（对应 ApiFavoriteController）
 * 【后端类比】相当于后端 ApiController + ApiFavoriteController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'
import type { ApiItem, ApiCreateParams, ApiListParams, ApiStatistics, ApiType } from '@/types/api'

export const apiManagement = {
  /**
   * 获取API列表（分页）
   * 支持按关键词、分类、状态筛选，支持排序
   */
  getList(params: ApiListParams) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.api.list, params)
  },

  /**
   * 获取API详情
   * @param id API的ID
   */
  getDetail(id: string | number) {
    return request.get<ApiItem>(`${apiEndpoints.api.detail}/${id}`)
  },

  /**
   * 创建API
   * 创建后状态为 pending（待审核），需管理员审核通过后才能被调用
   */
  create(data: ApiCreateParams) {
    return request.post<ApiItem>(apiEndpoints.api.create, data)
  },

  /**
   * 更新API信息
   * @param id API的ID
   * @param data 需要更新的字段（部分更新）
   */
  update(id: string | number, data: Partial<ApiCreateParams>) {
    return request.put<ApiItem>(`${apiEndpoints.api.update}/${id}`, data)
  },

  /**
   * 更新API状态
   * 用于审核（approved/rejected）或上下架（offline）操作
   * @param id API的ID
   * @param data.status 目标状态（pending/approved/rejected/offline）
   */
  updateStatus(id: string | number, data: { status: string }) {
    return request.put(`${apiEndpoints.api.updateStatus}/${id}`, data)
  },

  /**
   * 获取当前用户创建的API列表
   * 仅返回当前登录用户作为提供方发布的API
   */
  getMyApis(params: ApiListParams) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.api.myApis, params)
  },

  /**
   * 获取指定API的调用统计
   * @param id API的ID
   * @param params 日期范围筛选参数
   */
  getStatistics(id: string | number, params: { startDate?: string; endDate?: string }) {
    return request.get<ApiStatistics>(`${apiEndpoints.api.statistics}/${id}`, params)
  },

  /**
   * 获取"我调用的API"的调用统计（作为调用方）
   * 统计当前用户购买并调用他人API的统计数据
   * 与 getMyApiInvokeStatistics 区别：本方法统计的是"我调用了别人的API"
   */
  getMyInvokeStatistics(params: { 
    userId: number
    startDate?: string
    endDate?: string
    apiName?: string
    typeId?: number
    status?: string
    timeRange?: string
  }) {
    return request.get<ApiStatistics>(apiEndpoints.api.myInvokeStatistics, params)
  },

  /**
   * 获取"我的API被调用"的统计（作为提供方）
   * 统计当前用户发布的API被他人调用的统计数据
   * 与 getMyInvokeStatistics 区别：本方法统计的是"别人调用了我发布的API"
   */
  getMyApiInvokeStatistics(params: { 
    userId: number
    startDate?: string
    endDate?: string
    apiName?: string
    typeId?: number
    status?: string
    timeRange?: string
  }) {
    return request.get<ApiStatistics>(apiEndpoints.api.myApiInvokeStatistics, params)
  },

  /**
   * 获取API分类列表（简单列表）
   * 默认获取最多100条分类，不含每个分类下的API数量
   * 与 getApiTypes 区别：本方法用于简单下拉选择场景，固定pageSize=100
   */
  getTypes() {
    return request.get<{ list: ApiType[]; total: number }>(apiEndpoints.api.apiTypes, { pageSize: 100 })
  },

  /**
   * 获取API分类列表（含每个分类下的API数量）
   * 支持分页，返回的 ApiType 中包含 apiCount 字段
   * 与 getTypes 区别：本方法支持分页且返回分类下的API数量，用于分类管理页面
   */
  getApiTypes(params?: { pageNum?: number; pageSize?: number }) {
    return request.get<{ list: ApiType[]; total: number }>(apiEndpoints.api.apiTypes, params)
  }
}

export const apiFavorite = {
  /**
   * 收藏API
   * @param apiId API的ID
   */
  add(apiId: number) {
    return request.post(`${apiEndpoints.favorite.add}/${apiId}`)
  },

  /**
   * 取消收藏API
   * @param apiId API的ID
   */
  remove(apiId: number) {
    return request.delete(`${apiEndpoints.favorite.remove}/${apiId}`)
  },

  /**
   * 检查当前用户是否已收藏指定API
   * @param apiId API的ID
   * @returns 返回 boolean，true=已收藏，false=未收藏
   */
  check(apiId: number) {
    return request.get<boolean>(`${apiEndpoints.favorite.check}/${apiId}`)
  },

  /**
   * 获取当前用户收藏的API列表
   * 支持分页
   */
  getList(params?: { pageNum?: number; pageSize?: number }) {
    return request.get<{ list: ApiItem[]; total: number }>(apiEndpoints.favorite.list, params)
  }
}
