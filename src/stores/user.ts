/**
 * =====================================================
 * 用户状态管理 Store —— 相当于后端的 Session + UserService
 * =====================================================
 *
 * 【核心概念：Pinia Store 是什么？】
 *   - Pinia 是 Vue 的官方状态管理库（前身是 Vuex）
 *   - Store 相当于后端的"全局共享数据 + 操作方法"
 *   - 【后端类比】
 *     - 后端：用户信息存在 Redis Session 中，所有 Controller 都能读取
 *     - 前端：用户信息存在 Pinia Store 中，所有组件都能读取
 *     - Store = 后端的 Redis（存数据） + Service（操作数据） 的结合体
 *
 * 【Setup Store 语法】
 *   本文件使用 Setup Store（函数式定义），这是 Pinia 推荐的写法：
 *   - ref() 定义响应式数据 → 相当于后端的成员变量
 *   - computed() 定义计算属性 → 相当于后端的 getter 方法
 *   - function 定义方法 → 相当于后端的 Service 方法
 *   - 最后 return 暴露给外部使用 → 相当于后端的 public 访问修饰符
 *
 * 【数据持久化策略】
 *   - Pinia 的数据存在内存中，页面刷新就丢失
 *   - 本项目用 localStorage 做持久化（浏览器本地存储，关闭浏览器也不丢失）
 *   - 【后端类比】相当于后端用 Redis 持久化 Session，重启服务器也能恢复
 *   - 流程：
 *     1. 登录成功 → userInfo 存入 Pinia + localStorage
 *     2. 页面刷新 → Pinia 丢失 → 从 localStorage 恢复
 *     3. 登出 → 清除 Pinia + localStorage
 */

/**
 * defineStore —— Pinia 的 Store 定义函数
 * 【后端类比】相当于后端的 @Service 注解，标记这是一个服务类
 * 第一个参数 'user' 是 Store 的唯一 ID（相当于 Bean 名称）
 */
import { defineStore } from 'pinia'

/**
 * ref —— Vue 3 的响应式引用
 * 【后端类比】相当于后端的成员变量，但有一个特殊能力：
 *   当 ref 的值变化时，所有使用这个值的组件会自动更新
 *   就像后端的观察者模式：数据变化 → 通知所有监听者
 *
 * computed —— Vue 3 的计算属性
 * 【后端类比】相当于后端的 getter 方法，基于其他数据计算得出
 *   当依赖的数据变化时，计算属性会自动重新计算
 *   例如：isLoggedIn 依赖于 userInfo，userInfo 变了 isLoggedIn 自动更新
 */
import { ref, computed } from 'vue'

/**
 * 导入类型定义和 API 方法
 * 【后端类比】相当于后端 import DTO 类和 Service 接口
 */
import type { UserInfo, LoginParams, RegisterParams } from '@/types/auth'
import { authApi } from '@/api/auth'

/**
 * useUserStore —— 用户 Store 的 Hook 函数
 * 【后端类比】相当于后端的 @Autowired UserService userService
 * 任何组件调用 useUserStore() 就能获取同一个 Store 实例（单例模式）
 */
export const useUserStore = defineStore('user', () => {
  // ==================== 响应式数据（相当于成员变量） ====================

  /**
   * userInfo —— 当前登录用户信息
   * ref<UserInfo | null>(null) —— 初始值为 null（未登录状态）
   * 【后端类比】相当于后端的 Session 中存储的用户对象
   *   - null 表示未登录
   *   - 有值表示已登录，包含用户ID、用户名、管理员标识等
   *
   * 【ref() 的特殊性】
   *   在 JS 中访问 ref 的值需要 .value（如 userInfo.value）
   *   但在 <template> 中会自动解包，直接用 userInfo 即可
   */
  const userInfo = ref<UserInfo | null>(null)

  // ==================== 计算属性（相当于 getter 方法） ====================

  /**
   * isLoggedIn —— 是否已登录
   * computed(() => !!userInfo.value) —— 双重取反将值转为布尔类型
   *   - userInfo 为 null → !!null = false（未登录）
   *   - userInfo 有值 → !!{...} = true（已登录）
   * 【后端类比】相当于后端的 isLoggedIn() 方法
   */
  const isLoggedIn = computed(() => !!userInfo.value)

  // ==================== 方法（相当于 Service 方法） ====================

  /**
   * login —— 用户登录
   * 【后端类比】相当于后端的 AuthService.login()
   *
   * 【async/await 是什么？】
   *   async 标记函数为异步函数，await 等待异步操作完成
   *   【后端类比】相当于 Java 的 CompletableFuture.get()，但不会阻塞线程
   *   - Java: Result result = authService.login(params).get();
   *   - JS:    const res = await authApi.login(params);
   *
   * 【登录流程】
   *   1. 调用后端登录接口 → authApi.login(params)
   *   2. 登录成功后获取用户信息 → getUserInfo()
   *   3. getUserInfo() 内部会存入 Pinia + localStorage
   */
  async function login(params: LoginParams) {
    const res = await authApi.login(params)
    await getUserInfo()
    return res
  }

  /**
   * register —— 用户注册
   * 【后端类比】相当于后端的 AuthService.register()
   * 注册成功后自动获取用户信息（相当于自动登录）
   */
  async function register(params: RegisterParams) {
    const res = await authApi.register(params)
    await getUserInfo()
    return res
  }

  /**
   * logout —— 用户登出
   * 【后端类比】相当于后端的 AuthService.logout()
   *
   * 【try/catch 包裹登出 API】
   * 即使后端登出接口报错，前端也要清除本地状态
   * 就像后端即使 Redis 删除 Session 失败，也要返回成功给用户
   */
  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    /** 清除 Pinia 中的用户信息 */
    userInfo.value = null
    /** 清除 localStorage 中的用户信息 */
    clearStorage()
  }

  /**
   * getUserInfo —— 获取当前登录用户信息
   * 【后端类比】相当于后端的 SessionUtils.getLoginUser()
   * 获取后存入 Pinia + localStorage
   */
  async function getUserInfo() {
    const res = await authApi.getUserInfo()
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

  /**
   * updateUserInfo —— 更新用户信息
   * 【后端类比】相当于后端的 UserService.updateUser()
   * Partial<UserInfo> 表示 UserInfo 的部分字段（相当于后端的 @RequestBody 只传需要更新的字段）
   */
  async function updateUserInfo(data: Partial<UserInfo>) {
    const res = await authApi.updateUserInfo(data)
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

  /**
   * validateSession —— 验证 Session 是否有效
   * 【后端类比】相当于后端检查 Redis 中的 Session 是否过期
   *
   * 【使用场景】
   *   用户刷新页面后，Pinia 状态丢失，但 localStorage 中还有 userInfo
   *   此时需要向后端验证 Session 是否仍然有效
   *   - 有效 → 恢复 Pinia 状态，返回 true
   *   - 无效 → 清除 localStorage，返回 false
   */
  async function validateSession(): Promise<boolean> {
    try {
      const res = await authApi.getUserInfo()
      if (res.data) {
        userInfo.value = res.data as UserInfo
        saveToStorage()
        return true
      }
      return false
    } catch (error) {
      /** 后端返回 401 或其他错误 → Session 已过期 */
      userInfo.value = null
      clearStorage()
      return false
    }
  }

  // ==================== 持久化方法（相当于 Redis 读写） ====================

  /**
   * saveToStorage —— 将用户信息存入 localStorage
   * 【后端类比】相当于后端将 Session 存入 Redis
   *
   * localStorage.setItem(key, value) —— 浏览器本地存储
   *   - key: 'userInfo'
   *   - value: JSON 字符串（localStorage 只能存字符串）
   *   - 【后端类比】相当于 redisTemplate.opsForValue().set(key, value)
   *   - localStorage 的数据关闭浏览器后仍然存在，除非手动清除
   */
  function saveToStorage() {
    if (userInfo.value) {
      /**
       * JSON.stringify() —— 将 JavaScript 对象转为 JSON 字符串
       * 【后端类比】相当于后端的 ObjectMapper.writeValueAsString()
       */
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  /**
   * clearStorage —— 清除 localStorage 中的用户信息
   * 【后端类比】相当于后端删除 Redis 中的 Session
   */
  function clearStorage() {
    localStorage.removeItem('userInfo')
  }

  /**
   * loadFromStorage —— 从 localStorage 恢复用户信息
   * 【后端类比】相当于后端从 Redis 恢复 Session
   *
   * 【JSON.parse() 可能失败】
   *   如果 localStorage 中的数据被篡改或损坏，JSON.parse() 会抛异常
   *   所以用 try/catch 包裹，失败时清除无效数据
   */
  function loadFromStorage() {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      try {
        /**
         * JSON.parse() —— 将 JSON 字符串转为 JavaScript 对象
         * 【后端类比】相当于后端的 ObjectMapper.readValue(json, clazz)
         */
        userInfo.value = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse stored user info:', error)
        clearStorage()
      }
    }
  }

  /**
   * Store 初始化时自动从 localStorage 恢复状态
   * 【后端类比】相当于后端的 @PostConstruct 初始化方法
   * 这样页面刷新后，Pinia 的状态能从 localStorage 恢复
   */
  loadFromStorage()

  // ==================== 暴露给外部使用（相当于 public） ====================

  /**
   * return —— 暴露 Store 的数据和方法
   * 【后端类比】相当于后端的 public 访问修饰符
   * 只有 return 出来的数据和方法，其他组件才能使用
   * 没有 return 的就是"私有"的（相当于 private）
   */
  return {
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo,
    updateUserInfo,
    loadFromStorage,
    validateSession
  }
})
