import { request, apiEndpoints } from '@/utils/request'

export const tagApi = {
  getUserTags() {
    return request.get<string[]>(apiEndpoints.userTag.list)
  },

  saveUserTags(tags: string[]) {
    return request.post(apiEndpoints.userTag.save, tags)
  },

  addUserTag(tagName: string) {
    return request.post(apiEndpoints.userTag.add, { tagName })
  },

  removeUserTag(tagName: string) {
    return request.delete(apiEndpoints.userTag.remove, { tagName })
  },

  getRecommendedRequirements(params: { pageNum: number; pageSize: number }) {
    return request.get<{ list: any[]; total: number }>(apiEndpoints.matching.recommend, params)
  }
}
