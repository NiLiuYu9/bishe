/**
 * =====================================================
 * 状态映射工具 —— 相当于后端的枚举映射类
 * =====================================================
 *
 * 【核心概念：为什么需要状态映射？】
 *   后端数据库存储的状态是英文枚举值（如 "pending"、"approved"）
 *   但页面上需要显示中文（如"待审核"、"已通过"）和不同颜色
 *   本文件就是"英文状态 → {中文文本, 标签颜色}"的映射表
 *
 * 【后端类比】
 *   - 后端的 OrderStatusEnum、ApiStatusEnum 等枚举类
 *   - 后端用 @EnumValue 注解映射数据库值，前端用对象映射显示值
 *   - Element Plus 的 Tag 组件 type 属性决定标签颜色：
 *     success=绿色, warning=橙色, danger=红色, primary=蓝色, info=灰色
 *
 * 【as const 是什么？】
 *   TypeScript 的 const 断言，让编译器把值当作常量类型
 *   【后端类比】相当于 Java 的 final 修饰符，表示这些值不会被修改
 *   好处：TypeScript 能精确推断每个字段的类型，而不是宽泛的 string
 */

/**
 * ORDER_STATUS —— 订单状态映射
 * 【后端类比】对应后端的 order_info.status 字段和 OrderStatusEnum
 * 键 = 后端数据库存储的英文状态值
 * 值 = { type: Element Plus Tag 颜色类型, text: 中文显示文本 }
 */
export const ORDER_STATUS = {
  pending: { type: 'warning', text: '待支付' },    // warning=橙色
  paid: { type: 'primary', text: '已支付' },        // primary=蓝色
  completed: { type: 'success', text: '已完成' },   // success=绿色
  refunded: { type: 'info', text: '已退款' },        // info=灰色
  cancelled: { type: 'danger', text: '已取消' }      // danger=红色
} as const

/**
 * API_STATUS —— API 状态映射
 * 【后端类比】对应后端的 api_info.status 字段
 */
export const API_STATUS = {
  pending: { type: 'warning', text: '待审核' },
  approved: { type: 'success', text: '已通过' },
  rejected: { type: 'danger', text: '已拒绝' },
  offline: { type: 'info', text: '已下线' }
} as const

/**
 * REQUIREMENT_STATUS —— 需求状态映射
 * 【后端类比】对应后端的 requirement.status 字段
 */
export const REQUIREMENT_STATUS = {
  open: { type: 'primary', text: '开放中' },
  in_progress: { type: 'warning', text: '进行中' },
  delivered: { type: 'info', text: '已交付' },
  completed: { type: 'success', text: '已完成' },
  cancelled: { type: 'danger', text: '已取消' },
  after_sale: { type: 'warning', text: '售后中' },
  refunded: { type: 'info', text: '已退款' }
} as const

/**
 * AFTER_SALE_STATUS —— 售后状态映射
 * 【后端类比】对应后端的 requirement_after_sale.status 字段
 */
export const AFTER_SALE_STATUS = {
  pending: { type: 'warning', text: '待处理' },
  resolved: { type: 'success', text: '已解决' },
  rejected: { type: 'danger', text: '已拒绝' }
} as const

/**
 * METHOD_TYPES —— HTTP 请求方法映射
 * 【后端类比】对应后端的 api_info.method 字段（GET/POST/PUT/DELETE）
 * 不同方法用不同颜色区分，方便用户一眼看出请求类型
 */
export const METHOD_TYPES = {
  GET: { type: 'success', text: 'GET' },       // 绿色
  POST: { type: 'primary', text: 'POST' },     // 蓝色
  PUT: { type: 'warning', text: 'PUT' },       // 橙色
  DELETE: { type: 'danger', text: 'DELETE' }   // 红色
} as const

/**
 * getStatusInfo —— 根据状态值获取对应的显示信息
 * 【后端类比】相当于后端枚举类的 fromValue() 静态方法
 *
 * @param status 状态字符串（如 "pending"）
 * @param statusMap 状态映射表（如 ORDER_STATUS）
 * @returns { type: 标签颜色, text: 中文文本 }，未找到时返回默认灰色
 */
export function getStatusInfo(status: string, statusMap: Record<string, { type: string; text: string }>) {
  const info = statusMap[status]
  if (info) {
    return { type: info.type, text: info.text }
  }
  /** 状态值不在映射表中 → 显示原始值，灰色标签 */
  return { type: 'info', text: status }
}

/**
 * getMethodType —— 根据 HTTP 方法名获取 Element Plus Tag 的颜色类型
 * 【后端类比】相当于后端的 ApiInfo.getMethod() → 颜色映射
 *
 * @param method HTTP 方法名（如 "GET"、"POST"）
 * @returns Element Plus Tag 的 type 值（如 "success"、"primary"）
 */
export function getMethodType(method: string) {
  /** method?.toUpperCase() —— 先转大写（?. 可选链，method 为 null 时不报错） */
  const methodUpper = method?.toUpperCase()
  /**
   * keyof typeof METHOD_TYPES —— 获取 METHOD_TYPES 的所有键类型
   *   即 "GET" | "POST" | "PUT" | "DELETE"
   * 【后端类比】相当于 Java 的枚举值列表
   * as 关键字进行类型断言，告诉 TypeScript "我确定 methodUpper 是这个类型"
   */
  const info = METHOD_TYPES[methodUpper as keyof typeof METHOD_TYPES]
  if (info) {
    return info.type
  }
  return 'info'
}
