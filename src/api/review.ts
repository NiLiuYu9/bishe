/**
 * API评价相关请求模块
 * 
 * 对应后端 ApiReviewController（/review），提供评价创建、回复、查询等接口
 * 评价支持嵌套回复：replyType 0=主评价, 1=用户回复, 2=发布者回复
 * 【后端类比】相当于后端 ApiReviewController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'

/** API评价信息 */
export interface ApiReview {
  id: number
  orderId: number
  apiId: number
  apiName: string
  userId: number
  username: string
  rating: number
  content: string
  parentId: number
  replyType: number
  createTime: string
  replies?: ApiReview[]
}

export const reviewApi = {
  create(data: { orderId: number; rating: number; content?: string }) {
    return request.post<ApiReview>(apiEndpoints.review.create, data)
  },

  publisherReply(reviewId: number, content: string) {
    return request.post<void>(apiEndpoints.review.publisherReply, { reviewId, content })
  },

  update(reviewId: number, content: string) {
    return request.post<void>(apiEndpoints.review.update, { reviewId, content })
  },

  delete(reviewId: number) {
    return request.post<void>(`${apiEndpoints.review.delete}/${reviewId}`)
  },

  userReply(replyId: number, content: string) {
    return request.post<void>(apiEndpoints.review.userReply, { replyId, content })
  },

  getList(apiId: number, pageNum = 1, pageSize = 10, includeReplies = true) {
    return request.get<{ list: ApiReview[]; total: number }>(`${apiEndpoints.review.list}/${apiId}`, {
      pageNum,
      pageSize,
      includeReplies
    })
  },

  getMyReviews(pageNum = 1, pageSize = 10) {
    return request.get<{ list: ApiReview[]; total: number }>(apiEndpoints.review.myReviews, {
      pageNum,
      pageSize
    })
  },

  getDetail(reviewId: number) {
    return request.get<ApiReview>(`${apiEndpoints.review.detail}/${reviewId}`)
  }
}
