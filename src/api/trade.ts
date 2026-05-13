/**
 * 订单/交易相关 API 请求模块
 * 
 * 对应后端 OrderController（/order），提供下单、支付、订单管理、评价等接口
 * 【后端类比】相当于后端 OrderController 的前端调用层，类似 Feign Client / Dubbo Consumer
 */
import { request, apiEndpoints } from '@/utils/request'
import type { Order, OrderCreateParams } from '@/types/trade'

export const tradeApi = {
  /** 购买API（创建订单），需提供API ID和购买调用次数 */
  purchase(data: OrderCreateParams) {
    return request.post<Order>(apiEndpoints.trade.purchase, data)
  },

  /** 查询我的订单列表（支持按状态筛选） */
  getOrders(params: { page: number; pageSize: number; status?: string }) {
    return request.get<{ list: Order[]; total: number }>(apiEndpoints.trade.orders, {
      pageNum: params.page,
      pageSize: params.pageSize,
      status: params.status
    })
  },

  /** 获取订单详情 */
  getOrderDetail(id: string | number) {
    return request.get<Order>(`${apiEndpoints.trade.orderDetail}/${id}`)
  },

  /** 更新订单状态（如确认完成） */
  updateOrderStatus(id: string | number, status: string) {
    return request.put<void>(`${apiEndpoints.trade.updateStatus}/${id}?status=${status}`)
  },

  /** 删除订单 */
  deleteOrder(id: string | number) {
    return request.delete<void>(`${apiEndpoints.trade.delete}/${id}`)
  },

  /** 评价订单（1-5分） */
  evaluate(id: string | number, rating: number) {
    return request.post<void>(`${apiEndpoints.trade.evaluate}/${id}`, { rating })
  },

  /** 发起支付宝支付，返回支付宝支付页面URL */
  pay(orderId: number | string) {
    return request.post<string>(`${apiEndpoints.trade.pay}/${orderId}`)
  },

  /** 查询支付状态（轮询检查支付是否完成） */
  queryPayStatus(orderId: number | string) {
    return request.get<{ tradeStatus: string; orderStatus: string }>(`${apiEndpoints.trade.queryPayStatus}/${orderId}`)
  }
}
