<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h1>API Market</h1>
        </div>
        <p class="slogan">一站式API交易平台<br />连接开发者与创新应用</p>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Box /></el-icon>
            <span>海量API资源</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Lock /></el-icon>
            <span>安全可靠</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><TrendCharts /></el-icon>
            <span>数据可视化</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-form-container">
          <h2>欢迎登录</h2>
          <p class="subtitle">请输入您的账号信息</p>
          
          <el-form ref="formRef" :model="form" :rules="rules" size="large">
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <a href="#" class="forgot-link">忘记密码？</a>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="register-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, Lock, TrendCharts } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(form)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  padding: 24px;
}

.login-container {
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.brand h1 {
  font-size: 28px;
  font-weight: 700;
}

.slogan {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 48px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  opacity: 0.9;
}

.login-right {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
}

.login-form-container h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.subtitle {
  color: #475569;
  margin-bottom: 32px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.forgot-link {
  color: #3B82F6;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  color: #475569;
}

.register-link a {
  color: #1E40AF;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    padding: 32px;
  }
  
  .login-right {
    padding: 32px;
  }
}
</style>
