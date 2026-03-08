<template>
  <div class="profile-page">
    <h2 class="page-title">个人资料</h2>
    
    <div class="profile-content">
      <div class="avatar-section card">
        <el-avatar :size="100" :src="userInfo.avatar">
          {{ userInfo.username?.charAt(0).toUpperCase() }}
        </el-avatar>
        <el-button class="change-avatar-btn" size="small">更换头像</el-button>
      </div>
      
      <div class="info-section card">
        <h3 class="section-title">基本信息</h3>
        <el-form :model="userInfo" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userInfo.email" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="userInfo.phone" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="security-section card">
        <h3 class="section-title">安全设置</h3>
        <div class="security-item">
          <div class="security-info">
            <span class="label">登录密码</span>
            <span class="value">已设置</span>
          </div>
          <el-button text type="primary" @click="showPasswordDialog = true">修改密码</el-button>
        </div>
        <div class="security-item">
          <div class="security-info">
            <span class="label">AccessKey</span>
            <span class="value">{{ accessKey }}</span>
          </div>
          <el-button text type="primary" @click="copyAccessKey">复制</el-button>
        </div>
        <div class="security-item">
          <div class="security-info">
            <span class="label">SecretKey</span>
            <span class="value">{{ secretKey }}</span>
          </div>
          <el-button text type="primary" @click="copySecretKey">复制</el-button>
        </div>
        <div class="security-item">
          <div class="security-info">
            <span class="label">重新生成密钥</span>
            <span class="value warning-text">重新生成后原密钥将失效</span>
          </div>
          <el-button text type="danger" @click="showRegenerateDialog = true">重新生成</el-button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRegenerateDialog" title="重新生成密钥" width="400px">
      <div class="regenerate-warning">
        <el-icon :size="48" color="#E6A23C"><WarningFilled /></el-icon>
        <p>确定要重新生成 AccessKey 和 SecretKey 吗？</p>
        <p class="warning-detail">重新生成后，原密钥将立即失效，使用原密钥的应用将无法继续调用API。</p>
      </div>
      <template #footer>
        <el-button @click="showRegenerateDialog = false">取消</el-button>
        <el-button type="danger" @click="regenerateKeys">确认重新生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { accessKeyApi } from '@/api/accessKey'

const userStore = useUserStore()

const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: ''
})

onMounted(async () => {
  try {
    await userStore.getUserInfo()
    userInfo.username = userStore.userInfo?.username || ''
    userInfo.email = userStore.userInfo?.email || ''
    userInfo.phone = userStore.userInfo?.phone || ''
    userInfo.avatar = userStore.userInfo?.avatar || ''
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
  try {
    const res = await accessKeyApi.getAccessKey()
    accessKey.value = res.data.accessKey
    secretKey.value = res.data.secretKey
  } catch (error) {
    console.error('获取AccessKey失败', error)
  }
})

const accessKey = ref('')
const secretKey = ref('')

const showPasswordDialog = ref(false)
const showRegenerateDialog = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saveProfile = async () => {
  try {
    await userStore.updateUserInfo({
      username: userInfo.username,
      email: userInfo.email,
      phone: userInfo.phone
    })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败', error)
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword) {
    ElMessage.error('请输入原密码')
    return
  }
  if (!passwordForm.newPassword) {
    ElMessage.error('请输入新密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }
  try {
    await authApi.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('密码修改失败', error)
  }
}

const copyAccessKey = () => {
  navigator.clipboard.writeText(accessKey.value)
  ElMessage.success('已复制到剪贴板')
}

const copySecretKey = () => {
  navigator.clipboard.writeText(secretKey.value)
  ElMessage.success('已复制到剪贴板')
}

const regenerateKeys = async () => {
  try {
    const res = await accessKeyApi.regenerateAccessKey()
    accessKey.value = res.data.accessKey
    secretKey.value = res.data.secretKey
    ElMessage.success('密钥已重新生成')
    showRegenerateDialog.value = false
  } catch (error) {
    console.error('重新生成密钥失败', error)
  }
}
</script>

<style scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
}

.change-avatar-btn {
  margin-top: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #E2E8F0;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-info .label {
  font-size: 14px;
  color: #1E3A8A;
  font-weight: 500;
}

.security-info .value {
  font-size: 13px;
  color: #64748B;
}

.security-info .warning-text {
  color: #E6A23C;
}

.regenerate-warning {
  text-align: center;
  padding: 20px 0;
}

.regenerate-warning p {
  margin: 12px 0 0;
  font-size: 16px;
  color: #303133;
}

.regenerate-warning .warning-detail {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}
</style>
