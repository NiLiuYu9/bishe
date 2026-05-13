/**
 * 标签与智能匹配 API 请求模块
 * 
 * 对应后端 UserTagController（/user-tag）和 MatchingController（/matching）
 * 提供用户标签管理和基于标签的需求智能推荐
 * 【后端类比】相当于后端 UserTagController + MatchingController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'

export const tagApi = {
  /** 获取当前用户的技能标签列表 */
  getUserTags() {
    return request.get<string[]>(apiEndpoints.userTag.list)
  },

  /** 全量保存用户标签（替换原有标签） */
  saveUserTags(tags: string[]) {
    return request.post(apiEndpoints.userTag.save, tags)
  },

  /** 添加单个用户标签 */
  addUserTag(tagName: string) {
    return request.post(apiEndpoints.userTag.add, { tagName })
  },

  /** 删除单个用户标签 */
  removeUserTag(tagName: string) {
    return request.delete(apiEndpoints.userTag.remove, { tagName })
  },

  /** 获取智能推荐的需求列表（基于用户标签与需求标签的相似度匹配） */
  getRecommendedRequirements(params: { pageNum: number; pageSize: number }) {
    return request.get<{ list: any[]; total: number }>(apiEndpoints.matching.recommend, params)
  }
}
