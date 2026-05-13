/**
 * =====================================================
 * WebSocket 客户端封装 —— 相当于后端的 WebSocket 客户端
 * =====================================================
 *
 * 【核心概念：WebSocket 是什么？】
 *   - HTTP：客户端主动请求 → 服务器响应（一问一答，像打电话要按拨号键）
 *   - WebSocket：建立连接后，服务器可以主动推送消息给客户端（像打电话保持通话，双方随时说话）
 *   - 【后端类比】本项目后端有 WebSocketServer.java，前端这里就是对应的客户端
 *
 * 【本项目的 WebSocket 用途】
 *   - 实时通知推送：新消息、订单状态变更、需求状态变更等
 *   - 不用 WebSocket 的话，前端只能定时轮询后端（每 5 秒问一次"有新消息吗？"），效率低
 *   - 用 WebSocket 后，后端有新消息时主动推送给前端，实时性更好
 *
 * 【本客户端的核心功能】
 *   1. 自动重连：连接断开后自动重试，最多 5 次，采用指数退避策略
 *   2. 心跳检测：定期发送 ping 消息，检测连接是否存活
 *   3. 消息回调：收到消息时触发 onMessage 回调
 */

/**
 * WebSocketOptions —— WebSocket 连接配置
 * 【后端类比】相当于后端的 WebSocket 配置类
 *
 * 【回调函数说明】
 *   回调函数就是"当某件事发生时自动调用的函数"
 *   【后端类比】相当于后端的事件监听器 / Observer 模式
 *   - onMessage：收到消息时调用（相当于后端的 @OnMessage）
 *   - onOpen：连接建立时调用（相当于后端的 @OnOpen）
 *   - onClose：连接关闭时调用（相当于后端的 @OnClose）
 *   - onError：连接出错时调用（相当于后端的 @OnError）
 *   - onReconnect：正在重连时调用（通知 UI 层显示"正在重连..."）
 */
interface WebSocketOptions {
  /** WebSocket 服务器地址，如 ws://localhost:8080/ws */
  url: string
  /** 收到消息时的回调函数 */
  onMessage?: (data: any) => void
  /** 连接建立成功时的回调函数 */
  onOpen?: () => void
  /** 连接关闭时的回调函数 */
  onClose?: () => void
  /** 连接出错时的回调函数 */
  onError?: (error: Event) => void
  /** 正在重连时的回调函数，参数为当前重连次数 */
  onReconnect?: (attempt: number) => void
}

/**
 * WebSocketClient —— WebSocket 客户端类
 * 【后端类比】相当于后端封装一个 WebSocket 客户端工具类
 *
 * 【TypeScript 类的访问修饰符】
 *   - private：私有，只有类内部能访问（相当于 Java 的 private）
 *   - 无修饰符：默认公开（相当于 Java 的 public）
 *   TypeScript 和 Java 的访问修饰符含义相同
 */
class WebSocketClient {
  /** WebSocket 实例，null 表示未连接 */
  private ws: WebSocket | null = null
  /** WebSocket 服务器地址 */
  private url: string = ''
  /** 连接配置（包含回调函数） */
  private options: WebSocketOptions | null = null
  /** 当前重连次数 */
  private reconnectAttempts: number = 0
  /** 最大重连次数（5次后放弃） */
  private maxReconnectAttempts: number = 5
  /** 重连基础延迟（毫秒），实际延迟会指数增长 */
  private reconnectDelay: number = 3000
  /** 心跳定时器 ID，用于清除定时器 */
  private heartbeatInterval: number | null = null
  /** 心跳发送间隔（毫秒），每 30 秒发一次 ping */
  private heartbeatTimeout: number = 30000
  /** 是否正在连接中（防止重复连接） */
  private isConnecting: boolean = false
  /** 是否应该重连（断开后为 true，主动断开为 false） */
  private shouldReconnect: boolean = true
  /** 重连定时器 ID */
  private reconnectTimer: number | null = null

  /**
   * connect —— 建立 WebSocket 连接
   * 【后端类比】相当于后端的 WebSocketContainer.connectToServer()
   *
   * @param options 连接配置（包含 URL 和回调函数）
   */
  connect(options: WebSocketOptions) {
    /**
     * 防止重复连接
     * ws?.readyState === WebSocket.OPEN —— 已连接（?. 是可选链，ws 为 null 时不报错）
     * isConnecting —— 正在连接中
     * 两种情况都跳过，避免创建多个连接
     */
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('[WebSocketClient] Already connected or connecting, skipping')
      return
    }

    this.options = options
    this.url = options.url
    this.isConnecting = true
    this.shouldReconnect = true

    console.log('[WebSocketClient] Attempting to connect to:', this.url)
    try {
      /**
       * new WebSocket(url) —— 创建 WebSocket 连接
       * 【后端类比】相当于后端的 WebSocketContainer.connectToServer(endpoint, config)
       * URL 格式：ws://host:port/path（WebSocket 协议）
       *         wss://host:port/path（WebSocket 安全协议，类似 HTTPS）
       */
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('[WebSocketClient] Connection error:', error)
      this.isConnecting = false
      this.handleReconnect()
    }
  }

  /**
   * setupEventListeners —— 注册 WebSocket 事件监听器
   * 【后端类比】相当于后端的 @OnOpen/@OnClose/@OnError/@OnMessage 注解
   */
  private setupEventListeners() {
    if (!this.ws) return

    /**
     * onopen —— 连接建立成功时触发
     * 【后端类比】相当于后端的 @OnOpen 注解方法
     */
    this.ws.onopen = () => {
      this.isConnecting = false
      this.reconnectAttempts = 0  // 重置重连次数
      this.startHeartbeat()       // 开始心跳检测
      this.options?.onOpen?.()    // 调用用户的 onOpen 回调（?. 可选链，函数不存在时不调用）
    }

    /**
     * onclose —— 连接关闭时触发
     * 【后端类比】相当于后端的 @OnClose 注解方法
     */
    this.ws.onclose = () => {
      this.isConnecting = false
      this.stopHeartbeat()        // 停止心跳检测
      this.options?.onClose?.()   // 调用用户的 onClose 回调
      if (this.shouldReconnect) {
        this.handleReconnect()    // 如果不是主动断开，尝试重连
      }
    }

    /**
     * onerror —— 连接出错时触发
     * 【后端类比】相当于后端的 @OnError 注解方法
     */
    this.ws.onerror = (error) => {
      this.isConnecting = false
      this.options?.onError?.(error)
    }

    /**
     * onmessage —— 收到消息时触发
     * 【后端类比】相当于后端的 @OnMessage 注解方法
     *
     * 【消息格式】
     *   后端推送的消息是 JSON 字符串，如：{ type: "notification", data: {...} }
     *   需要用 JSON.parse() 解析为 JavaScript 对象
     *   【后端类比】相当于后端的 ObjectMapper.readValue(json, clazz)
     *
     * 【心跳 pong 消息过滤】
     *   如果消息的 type 是 'pong'，说明这是心跳响应，不需要通知业务层
     *   只处理业务消息（type 不是 'pong' 的）
     */
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pong') {
          // 心跳响应，忽略
          return
        }
        this.options?.onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  /**
   * handleReconnect —— 处理重连逻辑
   * 【后端类比】相当于后端的断线重连机制
   *
   * 【指数退避策略】
   *   重连延迟 = 基础延迟 × 2^(重连次数-1)
   *   第1次重连：3秒后
   *   第2次重连：6秒后
   *   第3次重连：12秒后
   *   第4次重连：24秒后
   *   最大不超过 30 秒
   *   【后端类比】相当于后端的 RetryTemplate 的指数退避策略
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached, giving up')
      return
    }

    this.reconnectAttempts++
    /**
     * Math.min(a, b) —— 取较小值，确保延迟不超过 30 秒
     * Math.pow(2, n) —— 2 的 n 次方，实现指数增长
     */
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms, attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    this.options?.onReconnect?.(this.reconnectAttempts)

    /**
     * setTimeout —— 延迟执行（相当于 Java 的 ScheduledExecutorService.schedule()）
     * window.setTimeout 返回一个定时器 ID，可用于取消定时器
     */
    this.reconnectTimer = window.setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect(this.options!)
      }
    }, delay)
  }

  /**
   * startHeartbeat —— 开始心跳检测
   * 【后端类比】相当于后端的心跳机制，定期发送 ping 检测连接是否存活
   *
   * 【心跳原理】
   *   每 30 秒发送一个 { type: "ping" } 消息给服务器
   *   如果连接已断开，发送会失败，触发 onclose 事件，进而触发重连
   *   【后端类比】相当于 TCP 的 Keep-Alive 机制
   */
  private startHeartbeat() {
    this.stopHeartbeat()
    /**
     * setInterval —— 定时执行（相当于 Java 的 ScheduledExecutorService.scheduleAtFixedRate()）
     * 每 heartbeatTimeout 毫秒执行一次回调函数
     */
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        /**
         * ws.send() —— 发送 WebSocket 消息
         * JSON.stringify() —— 将 JavaScript 对象转为 JSON 字符串
         *   【后端类比】相当于后端的 ObjectMapper.writeValueAsString()
         */
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.heartbeatTimeout)
  }

  /**
   * stopHeartbeat —— 停止心跳检测
   * clearInterval —— 取消定时器（相当于 Java 的 future.cancel()）
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * send —— 发送消息
   * 【后端类比】相当于后端的 Session.getBasicRemote().sendText()
   * @param data 要发送的数据（任意类型，会自动序列化为 JSON）
   * @returns true=发送成功，false=连接未建立
   */
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

  /**
   * disconnect —— 主动断开连接
   * 【后端类比】相当于后端的 Session.close()
   * 设置 shouldReconnect = false 防止断开后自动重连
   */
  disconnect() {
    this.shouldReconnect = false
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  /**
   * isConnected —— 检查是否已连接
   * 【后端类比】相当于后端的 Session.isOpen()
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

/**
 * 导出 WebSocket 客户端单例
 * 【后端类比】相当于后端的 @Bean 单例注入
 * 整个应用只创建一个 WebSocketClient 实例，所有组件共享
 */
export const wsClient = new WebSocketClient()
