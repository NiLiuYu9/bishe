<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h1>API Market</h1>
        </div>
        <p class="slogan">加入我们<br />开启您的API之旅</p>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24"><Upload /></el-icon>
            <span>上架您的API</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><ShoppingCart /></el-icon>
            <span>购买调用次数</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><DataAnalysis /></el-icon>
            <span>查看统计数据</span>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <div class="register-form-container">
          <h2>创建账号</h2>
          <p class="subtitle">填写以下信息完成注册</p>
          
          <el-form ref="formRef" :model="form" :rules="rules" size="large">
            <el-form-item prop="username">
              <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input v-model="form.email" placeholder="邮箱地址" prefix-icon="Message" />
            </el-form-item>
            
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="手机号码" prefix-icon="Phone" />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleRegister"
              />
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="agreeTerms">
                我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
              </el-checkbox>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" :loading="loading" :disabled="!agreeTerms" class="register-btn" @click="handleRegister">
                注册
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-link">
            已有账号？<router-link to="/login">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, ShoppingCart, DataAnalysis } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const agreeTerms = ref(false)

const form = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!agreeTerms.value) {
        ElMessage.warning('请先同意服务条款和隐私政策')
        return
      }
      
      loading.value = true
      try {
        await userStore.register({
          username: form.username,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
        ElMessage.success('注册成功')
        router.push('/')
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
  padding: 24px;
}

.register-container {
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.register-left {
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

.register-right {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form-container {
  width: 100%;
  max-width: 360px;
}

.register-form-container h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.subtitle {
  color: #475569;
  margin-bottom: 24px;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #475569;
}

.login-link a {
  color: #1E40AF;
  font-weight: 500;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  color: #475569;
}

:deep(.el-checkbox__label a) {
  color: #3B82F6;
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }
  
  .register-left {
    padding: 32px;
  }
  
  .register-right {
    padding: 32px;
  }
}
</style>
