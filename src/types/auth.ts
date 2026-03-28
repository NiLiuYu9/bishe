export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  isAdmin?: number
  createTime?: string
  status?: number
  freezeReason?: string
  tags?: string[]
}

export interface LoginResult {
  id: number
  username: string
  isAdmin?: number
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  phone: string
}
