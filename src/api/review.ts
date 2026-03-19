import { request, apiEndpoints } from '@/utils/request'

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
