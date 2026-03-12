import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, RegisterParams } from '@/types/auth'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!userInfo.value)

  async function login(params: LoginParams) {
    const res = await authApi.login(params)
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

  async function register(params: RegisterParams) {
    const res = await authApi.register(params)
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    userInfo.value = null
    clearStorage()
  }

  async function getUserInfo() {
    const res = await authApi.getUserInfo()
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

  async function updateUserInfo(data: Partial<UserInfo>) {
    const res = await authApi.updateUserInfo(data)
    userInfo.value = res.data as UserInfo
    saveToStorage()
    return res
  }

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
      userInfo.value = null
      clearStorage()
      return false
    }
  }

  function saveToStorage() {
    if (userInfo.value) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  function clearStorage() {
    localStorage.removeItem('userInfo')
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      try {
        userInfo.value = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse stored user info:', error)
        clearStorage()
      }
    }
  }

  loadFromStorage()

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
