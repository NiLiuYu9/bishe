export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  avatar?: string
  createTime?: string
  status?: number
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
