export interface UserInfo {
  id: number
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  createTime?: string
  status?: 'active' | 'frozen'
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
