import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, RegisterParams } from '@/types/auth'

const MOCK_USER = {
  username: 'root',
  password: '123456',
  userInfo: {
    id: 1,
    username: 'root',
    email: 'root@example.com',
    phone: '13800138000',
    avatar: '',
    createTime: '2024-01-01',
    status: 'active' as const,
    role: 'admin'
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(params: LoginParams) {
    if (params.username === MOCK_USER.username && params.password === MOCK_USER.password) {
      const mockToken = 'mock_token_' + Date.now()
      token.value = mockToken
      userInfo.value = MOCK_USER.userInfo as UserInfo
      localStorage.setItem('token', mockToken)
      localStorage.setItem('userInfo', JSON.stringify(MOCK_USER.userInfo))
      return {
        code: 200,
        data: {
          token: mockToken,
          user: MOCK_USER.userInfo
        },
        message: 'success'
      }
    }
    throw new Error('用户名或密码错误')
  }

  async function register(params: RegisterParams) {
    const mockToken = 'mock_token_' + Date.now()
    const newUserInfo = {
      id: Date.now(),
      username: params.username,
      email: params.email,
      phone: params.phone,
      avatar: '',
      createTime: new Date().toISOString(),
      status: 'active' as const,
      role: 'user'
    }
    token.value = mockToken
    userInfo.value = newUserInfo as UserInfo
    localStorage.setItem('token', mockToken)
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    return {
      code: 200,
      data: {
        token: mockToken,
        user: newUserInfo
      },
      message: 'success'
    }
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function getUserInfo() {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    }
    return {
      code: 200,
      data: userInfo.value,
      message: 'success'
    }
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo,
    setToken
  }
})
