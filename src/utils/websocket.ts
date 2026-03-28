interface WebSocketOptions {
  url: string
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onReconnect?: (attempt: number) => void
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string = ''
  private options: WebSocketOptions | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000
  private heartbeatInterval: number | null = null
  private heartbeatTimeout: number = 30000
  private isConnecting: boolean = false
  private shouldReconnect: boolean = true
  private reconnectTimer: number | null = null

  connect(options: WebSocketOptions) {
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
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('[WebSocketClient] Connection error:', error)
      this.isConnecting = false
      this.handleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.options?.onOpen?.()
    }

    this.ws.onclose = () => {
      this.isConnecting = false
      this.stopHeartbeat()
      this.options?.onClose?.()
      if (this.shouldReconnect) {
        this.handleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      this.isConnecting = false
      this.options?.onError?.(error)
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pong') {
          return
        }
        this.options?.onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketClient] Max reconnect attempts reached, giving up')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    console.log(`[WebSocketClient] Reconnecting in ${delay}ms, attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    this.options?.onReconnect?.(this.reconnectAttempts)

    this.reconnectTimer = window.setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect(this.options!)
      }
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.heartbeatTimeout)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

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

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient()
