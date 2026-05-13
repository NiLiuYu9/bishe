/**
 * =====================================================
 * Axios 请求封装 —— 相当于后端的 HTTP 客户端工具类
 * =====================================================
 *
 * 【核心概念：前端如何调用后端接口？】
 *   - 后端调用外部接口：用 RestTemplate / HttpClient / OkHttp
 *   - 前端调用后端接口：用 Axios（最流行的 HTTP 客户端库）
 *   - 【后端类比】Axios 相当于后端的 RestTemplate
 *
 * 【为什么要封装？】
 *   - 统一处理 baseURL、超时、请求头（不用每个请求都写一遍）
 *   - 统一处理响应（自动判断业务成功/失败，失败自动弹错误提示）
 *   - 统一处理 HTTP 错误码（401 跳登录、403 无权限、500 服务器错误）
 *   - 【后端类比】就像后端封装 Result<T> 统一响应格式、GlobalExceptionHandler 统一异常处理
 *
 * 【拦截器机制】
 *   - 请求拦截器：在请求发出前执行（相当于后端的 Filter/Interceptor 的 preHandle）
 *   - 响应拦截器：在收到响应后执行（相当于后端的 Filter/Interceptor 的 afterCompletion）
 *   - 本项目的拦截器做了：
 *     1. 响应拦截器：判断业务 code，非 0/200 自动弹 ElMessage.error
 *     2. 响应拦截器：HTTP 401 自动跳登录页
 */

/**
 * axios —— HTTP 客户端库
 * 【后端类比】相当于后端的 RestTemplate
 */
import axios from 'axios'

/**
 * Axios 类型定义
 * 【后端类比】相当于后端的泛型，提供类型安全
 *   - AxiosInstance —— Axios 实例类型（相当于 RestTemplate 类型）
 *   - AxiosRequestConfig —— 请求配置类型（相当于 RequestConfig）
 *   - AxiosResponse —— 响应类型（相当于 ResponseEntity<T>）
 *   - InternalAxiosRequestConfig —— 内部请求配置（拦截器中使用的类型）
 */
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * 导入全局配置和 API 端点
 * config 提供 baseURL、timeout 等基础配置
 * apiEndpoints 提供所有后端接口路径
 */
import config, { apiEndpoints } from '@/config'

/**
 * ElMessage —— Element Plus 的消息提示组件
 * 【后端类比】相当于后端的日志输出，但这个是给用户看的弹窗提示
 *   - ElMessage.error('xxx') → 页面右上角弹出红色错误提示
 *   - ElMessage.success('xxx') → 页面右上角弹出绿色成功提示
 *   - 类似于手机 App 的 Toast 提示
 */
import { ElMessage } from 'element-plus'

// ==================== 创建 Axios 实例 ====================

/**
 * axios.create() —— 创建自定义的 Axios 实例
 * 【后端类比】相当于 new RestTemplate()，然后设置超时、拦截器等配置
 *
 * 【参数说明】
 *   baseURL —— 基础 URL，所有请求的 URL 都会自动加上这个前缀
 *     例如：instance.get('/auth/login') 实际请求 http://localhost:8080/api/auth/login
 *     【后端类比】相当于后端的 server.servlet.context-path
 *
 *   timeout —— 超时时间（毫秒），超过 30 秒自动取消请求
 *     【后端类比】相当于后端的 spring.mvc.async.request-timeout
 *
 *   headers —— 默认请求头
 *     Content-Type: application/json 表示请求体是 JSON 格式
 *     【后端类比】相当于后端 @RequestBody 要求请求体为 JSON
 *
 *   withCredentials: true —— 跨域请求时携带 Cookie
 *     【后端类比】相当于后端的 CORS 配置允许携带凭证
 *     本项目使用 Spring Session + Redis，Session ID 通过 Cookie 传递
 *     如果不设置 withCredentials: true，浏览器不会发送 Cookie，后端就无法识别用户
 *     【重要】这是前后端分离项目中 Session 认证的关键配置
 */
const instance: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers,
  withCredentials: true
})

// ==================== 请求拦截器 ====================

/**
 * instance.interceptors.request.use() —— 注册请求拦截器
 * 【后端类比】相当于 HandlerInterceptor.preHandle()
 *   - 在每个请求发出之前执行
 *   - 可以修改请求配置（如添加请求头）
 *   - 本项目目前没有在请求拦截器中做额外处理，只是透传
 *
 * 【参数】
 *   第一个函数：成功回调（请求发出前执行）
 *     config 参数是请求配置对象，可以修改（如添加 Authorization 头）
 *     必须返回 config，否则请求不会发出
 *   第二个函数：错误回调（请求发出失败时执行）
 *     Promise.reject(error) 将错误传递给调用方
 */
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== 响应拦截器 ====================

/**
 * instance.interceptors.response.use() —— 注册响应拦截器
 * 【后端类比】相当于 HandlerInterceptor.afterCompletion() + GlobalExceptionHandler
 *   - 在收到响应后执行
 *   - 统一处理业务错误和 HTTP 错误
 *
 * 【参数】
 *   第一个函数：成功回调（HTTP 状态码 2xx 时执行）
 *   第二个函数：失败回调（HTTP 状态码非 2xx 时执行）
 */
instance.interceptors.response.use(
  /**
   * 成功回调 —— HTTP 状态码 2xx
   * 【后端类比】相当于后端 Controller 正常返回 Result<T>
   *
   * 【业务码判断逻辑】
   *   后端统一返回格式：{ code: number, data: T, message: string }
   *   - code === 0：业务成功（后端 ResultCode.SUCCESS.getCode() = 0）
   *   - code === 200：兼容部分旧接口（HTTP 200 也视为成功）
   *   - 其他值：业务失败，弹出错误提示
   *
   *   【后端类比】就像后端的 Result<T> 封装：
   *     if (result.getCode() == 0) { return result.getData(); }
   *     else { throw new BusinessException(result.getMessage()); }
   */
  (response: AxiosResponse) => {
    const { data } = response
    // 0为后端统一成功码，200为兼容部分旧接口返回的HTTP状态码
    if (data.code === 0 || data.code === 200) {
      return data
    }
    /**
     * 业务失败 → 弹出错误提示
     * ElMessage.error() 在页面右上角显示红色错误提示
     * data.message 是后端返回的错误信息（如"用户名已存在"）
     * Promise.reject(data) 将错误传递给调用方的 catch 块
     */
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(data)
  },
  /**
   * 失败回调 —— HTTP 状态码非 2xx（如 401、403、500）
   * 【后端类比】相当于后端的 GlobalExceptionHandler 处理各种异常
   *
   * 【错误码处理逻辑】
   *   401 Unauthorized → 登录过期，清除本地用户信息，跳转登录页
   *     【后端类比】相当于后端的 SessionInterceptor 检测到未登录，返回 401
   *   403 Forbidden → 无权限访问
   *     【后端类比】相当于后端的管理员权限校验失败
   *   404 Not Found → 请求资源不存在
   *   500 Internal Server Error → 服务器内部错误
   *     【后端类比】相当于后端抛出了未捕获的异常
   *   其他 → 显示后端返回的错误信息
   *   无响应（网络断开）→ 显示"网络连接失败"
   */
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          /**
           * 401 未授权 → 清除本地用户信息并跳转登录页
           * 【后端类比】相当于后端 SessionInterceptor 返回 401 状态码
           * localStorage.removeItem('userInfo') —— 清除本地缓存的用户信息
           * window.location.href = '/login' —— 跳转到登录页
           *   注意：这里用 window.location.href 而非 router.push，
           *   因为此时可能处于非 Vue 上下文中，直接修改浏览器地址更可靠
           */
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      /**
       * error.response 不存在 → 网络错误（如断网、跨域被拒绝）
       * 【后端类比】相当于后端的 ConnectException / SocketTimeoutException
       */
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)

// ==================== 响应数据类型定义 ====================

/**
 * ApiResponse<T> —— 后端统一响应格式
 * 【后端类比】完全对应后端的 Result<T> 类
 *   - code：业务状态码（0=成功，其他=失败）
 *   - data：业务数据（泛型，类型由调用方指定）
 *   - message：提示信息（成功时可能为空，失败时包含错误描述）
 *
 * 【泛型 T 的作用】
 *   TypeScript 的泛型和 Java 的泛型一样，用于指定 data 的具体类型
 *   例如：ApiResponse<UserInfo> 表示 data 是 UserInfo 类型
 *   【后端类比】相当于 Result<UserInfo>
 */
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// ==================== 导出请求方法 ====================

/**
 * request —— 封装了 get/post/put/delete 四个泛型方法
 * 【后端类比】相当于封装了 RestTemplate 的 getForObject/postForObject 等方法
 *
 * 【泛型 <T> 的作用】
 *   每个方法都有泛型参数 T，用于指定响应数据的类型
 *   例如：request.get<UserInfo>('/auth/user-info')
 *   返回 Promise<ApiResponse<UserInfo>>，调用方可以明确知道 data 是 UserInfo 类型
 *   【后端类比】相当于 Result<UserInfo> result = restTemplate.getForObject(url, Result.class)
 *
 * 【Promise 是什么？】
 *   Promise 是 JavaScript 的异步编程机制
 *   【后端类比】相当于 Java 的 CompletableFuture
 *     - Java: CompletableFuture<Result> future = ...; Result result = future.get();
 *     - JS:    Promise<ApiResponse<T>> promise = ...; const result = await promise;
 *     - await 关键字等待异步操作完成，就像 future.get() 阻塞等待结果
 */
export const request = {
  /**
   * GET 请求 —— 用于获取数据
   * 【后端类比】相当于 RestTemplate.getForObject()
   * 【HTTP 知识】GET 请求的参数放在 URL 查询参数中（?key=value&key2=value2）
   *
   * @param url 请求路径（不含 baseURL，如 '/auth/user-info'）
   * @param params URL 查询参数对象（如 { pageNum: 1, pageSize: 10 }）
   * @param config 额外请求配置（可选）
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.get(url, { params, ...config })
  },

  /**
   * POST 请求 —— 用于创建数据
   * 【后端类比】相当于 RestTemplate.postForObject()
   * 【HTTP 知识】POST 请求的参数放在请求体中（JSON 格式）
   *
   * @param url 请求路径
   * @param data 请求体数据（会被序列化为 JSON）
   * @param config 额外请求配置（可选）
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.post(url, data, config)
  },

  /**
   * PUT 请求 —— 用于更新数据
   * 【后端类比】相当于 RestTemplate.put()
   * 【HTTP 知识】PUT 请求的参数放在请求体中（JSON 格式）
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.put(url, data, config)
  },

  /**
   * DELETE 请求 —— 用于删除数据
   * 【后端类比】相当于 RestTemplate.delete()
   * 【HTTP 知识】DELETE 请求的参数通常放在 URL 查询参数中
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return instance.delete(url, { params, ...config })
  }
}

/**
 * 导出 apiEndpoints，方便 API 模块直接引用
 * 这样 API 模块只需要 import { request, apiEndpoints } from '@/utils/request'
 */
export { apiEndpoints }

/**
 * 导出 Axios 实例（默认导出）
 * 某些特殊场景（如文件下载）需要直接使用 Axios 实例
 */
export default instance
