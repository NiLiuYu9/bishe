/**
 * =====================================================
 * 认证相关类型定义 —— 相当于后端的 DTO/VO 类
 * =====================================================
 *
 * 【TypeScript interface vs Java class】
 *   - TypeScript 的 interface 只定义"形状"（有哪些字段），不包含方法实现
 *   - 【后端类比】相当于后端的 DTO/VO 类，只有字段没有方法
 *   - TypeScript 的 interface 编译后会被删除（运行时不存在），只用于编译期类型检查
 *   - 而 Java 的 class 编译后仍然存在
 *
 * 【TypeScript 类型语法速查】
 *   - ? 表示可选字段（相当于后端字段可以为 null）
 *   - | 表示联合类型（相当于后端的 Object 可以是多种类型）
 *   - 'value1' | 'value2' 表示字面量联合类型（相当于后端的枚举）
 */

/**
 * UserInfo —— 用户信息
 * 【后端类比】对应后端的 UserVO / SysUser 实体
 * 用于前端存储和展示当前登录用户的信息
 */
export interface UserInfo {
  /** 用户ID，对应后端 sys_user.id */
  id: number
  /** 用户名，对应后端 sys_user.username */
  username: string
  /** 邮箱（可选，用户可能没填） */
  email?: string
  /** 手机号（可选，用户可能没填） */
  phone?: string
  /** 是否管理员：0=普通用户, 1=管理员，对应后端 sys_user.is_admin */
  isAdmin?: number
  /** 创建时间 */
  createTime?: string
  /** 账号状态：0=禁用, 1=启用，对应后端 sys_user.status */
  status?: number
  /** 冻结原因（仅被冻结时有值） */
  freezeReason?: string
  /** 用户技能标签列表 */
  tags?: string[]
}

/**
 * LoginResult —— 登录接口的返回数据
 * 【后端类比】对应后端 AuthController.login() 返回的 data 部分
 */
export interface LoginResult {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 是否管理员 */
  isAdmin?: number
}

/**
 * LoginParams —— 登录接口的请求参数
 * 【后端类比】对应后端的 LoginRequestDTO
 * 用于前端向后端发送登录请求
 */
export interface LoginParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * RegisterParams —— 注册接口的请求参数
 * 【后端类比】对应后端的 RegisterRequestDTO
 */
export interface RegisterParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
}
