export const ORDER_STATUS = {
  pending: { type: 'warning', text: '待支付' },
  paid: { type: 'primary', text: '已支付' },
  completed: { type: 'success', text: '已完成' },
  refunded: { type: 'info', text: '已退款' },
  cancelled: { type: 'danger', text: '已取消' }
} as const

export const API_STATUS = {
  pending: { type: 'warning', text: '待审核' },
  approved: { type: 'success', text: '已通过' },
  rejected: { type: 'danger', text: '已拒绝' },
  offline: { type: 'info', text: '已下线' }
} as const

export const REQUIREMENT_STATUS = {
  open: { type: 'primary', text: '开放中' },
  in_progress: { type: 'warning', text: '进行中' },
  delivered: { type: 'info', text: '已交付' },
  completed: { type: 'success', text: '已完成' },
  cancelled: { type: 'danger', text: '已取消' },
  after_sale: { type: 'warning', text: '售后中' },
  refunded: { type: 'info', text: '已退款' }
} as const

export const AFTER_SALE_STATUS = {
  pending: { type: 'warning', text: '待处理' },
  resolved: { type: 'success', text: '已解决' },
  rejected: { type: 'danger', text: '已拒绝' }
} as const

export const METHOD_TYPES = {
  GET: { type: 'success', text: 'GET' },
  POST: { type: 'primary', text: 'POST' },
  PUT: { type: 'warning', text: 'PUT' },
  DELETE: { type: 'danger', text: 'DELETE' }
} as const

export function getStatusInfo(status: string, statusMap: Record<string, { type: string; text: string }>) {
  const info = statusMap[status]
  if (info) {
    return { type: info.type, text: info.text }
  }
  return { type: 'info', text: status }
}

export function getMethodType(method: string) {
  const methodUpper = method?.toUpperCase()
  const info = METHOD_TYPES[methodUpper as keyof typeof METHOD_TYPES]
  if (info) {
    return info.type
  }
  return 'info'
}
