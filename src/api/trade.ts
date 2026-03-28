import { request, apiEndpoints } from '@/utils/request'
import type { Order, OrderCreateParams } from '@/types/trade'

export const tradeApi = {
  purchase(data: OrderCreateParams) {
    return request.post<Order>(apiEndpoints.trade.purchase, data)
  },

  getOrders(params: { page: number; pageSize: number; status?: string }) {
    return request.get<{ list: Order[]; total: number }>(apiEndpoints.trade.orders, {
      pageNum: params.page,
      pageSize: params.pageSize,
      status: params.status
    })
  },

  getOrderDetail(id: string | number) {
    return request.get<Order>(`${apiEndpoints.trade.orderDetail}/${id}`)
  },

  updateOrderStatus(id: string | number, status: string) {
    return request.put<void>(`${apiEndpoints.trade.updateStatus}/${id}?status=${status}`)
  },

  deleteOrder(id: string | number) {
    return request.delete<void>(`${apiEndpoints.trade.delete}/${id}`)
  },

  evaluate(id: string | number, rating: number) {
    return request.post<void>(`${apiEndpoints.trade.evaluate}/${id}`, { rating })
  },

  pay(orderId: number | string) {
    return request.post<string>(`${apiEndpoints.trade.pay}/${orderId}`)
  },

  queryPayStatus(orderId: number | string) {
    return request.get<{ tradeStatus: string; orderStatus: string }>(`${apiEndpoints.trade.queryPayStatus}/${orderId}`)
  }
}
