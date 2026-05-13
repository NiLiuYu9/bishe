/**
 * =====================================================
 * 格式化工具函数 —— 相当于后端的工具类（如 Hutool 的 DateUtil）
 * =====================================================
 *
 * 【后端类比】
 *   - 后端用 SimpleDateFormat / DateTimeFormatter 格式化日期
 *   - 前端用 JavaScript 的 Date 对象和 toLocaleDateString/toLocaleString 方法
 *   - 本文件封装了常用的格式化方法，避免每个页面都重复写格式化逻辑
 *
 * 【JavaScript 日期处理】
 *   - 后端：java.util.Date / java.time.LocalDateTime
 *   - 前端：new Date() / Date 对象
 *   - 后端返回的日期是字符串（如 "2024-01-15T10:30:00"），前端需要转为 Date 对象才能格式化
 */

/**
 * formatDistanceToNow —— 将日期格式化为相对时间
 * 【后端类比】相当于后端的"3分钟前"、"2小时前"这种友好时间显示
 *
 * 【逻辑】
 *   计算当前时间与目标时间的时间差，根据差值大小返回不同格式：
 *   - < 60秒 → "刚刚"
 *   - < 60分钟 → "X分钟前"
 *   - < 24小时 → "X小时前"
 *   - < 7天 → "X天前"
 *   - >= 7天 → 具体日期（如 "2024/1/15"）
 *
 * @param date 目标日期
 * @returns 格式化后的相对时间字符串
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  /** 计算时间差（毫秒） */
  const diff = now.getTime() - date.getTime()
  
  /** 将毫秒转换为秒、分钟、小时、天 */
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    /**
     * toLocaleDateString('zh-CN') —— 使用中文格式显示日期
     * 【后端类比】相当于 SimpleDateFormat("yyyy/M/d")
     */
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * formatDate —— 格式化为日期（不含时间）
 * 【后端类比】相当于 SimpleDateFormat("yyyy/MM/dd")
 *
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期字符串，如 "2024/01/15"
 */
export function formatDate(date: Date | string): string {
  /**
   * typeof date === 'string' —— 判断参数类型
   * 如果是字符串，先用 new Date(date) 转为 Date 对象
   * 【后端类比】相当于后端的重载方法，接受 String 和 Date 两种参数类型
   */
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',    // 年份：4位数字
    month: '2-digit',   // 月份：2位数字（补零）
    day: '2-digit'      // 日期：2位数字（补零）
  })
}

/**
 * formatDateTime —— 格式化为日期+时间
 * 【后端类比】相当于 SimpleDateFormat("yyyy/MM/dd HH:mm")
 *
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期时间字符串，如 "2024/01/15 10:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',    // 小时：2位数字（补零）
    minute: '2-digit'   // 分钟：2位数字（补零）
  })
}

/**
 * getPriceUnit —— 将英文计费单位转为中文
 * 【后端类比】相当于后端的枚举映射工具方法
 *
 * 【Record<string, string> 是什么？】
 *   TypeScript 的工具类型，表示"键为 string、值为 string 的对象"
 *   【后端类比】相当于 Java 的 Map<String, String>
 *
 * @param unit 英文计费单位（call/day/month/year）
 * @returns 中文计费单位（次/天/月/年）
 */
export function getPriceUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    call: '次',
    day: '天',
    month: '月',
    year: '年'
  }
  /** 如果 unit 在映射表中存在，返回对应中文；否则原样返回 */
  return unitMap[unit] || unit
}
