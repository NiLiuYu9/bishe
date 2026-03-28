<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-left">
        <h2 class="page-title">个人资料</h2>
        <div class="user-info-inline">
          <span class="username">{{ userInfo.username }}</span>
          <el-tag v-if="userInfo.isAdmin === 1" type="danger" size="small">管理员</el-tag>
        </div>
      </div>
    </div>
    
    <div class="profile-content">
      <div class="info-section card">
        <div class="section-header">
          <el-icon><User /></el-icon>
          <h3>基本信息</h3>
        </div>
        <el-form :model="userInfo" label-width="80px" class="info-form">
          <el-form-item label="用户名">
            <el-input v-model="userInfo.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile">保存修改</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="skill-section card">
        <div class="section-header">
          <el-icon><CollectionTag /></el-icon>
          <h3>技能标签</h3>
        </div>
        <div class="skill-content">
          <p class="skill-desc">设置您的技能标签，系统将为您智能推荐匹配的需求</p>
          <TagInput v-model="userTags" placeholder="输入技能标签，如：Java、Vue、Python" />
          <el-button type="primary" @click="saveTags" style="margin-top: 16px;">保存标签</el-button>
        </div>
      </div>
      
      <div class="security-section card">
        <div class="section-header">
          <el-icon><Lock /></el-icon>
          <h3>安全设置</h3>
        </div>
        <div class="security-list">
          <div class="security-item">
            <div class="security-left">
              <span class="label">登录密码</span>
              <span class="desc">定期更换密码可以提高账号安全性</span>
            </div>
            <el-button type="primary" plain size="small" @click="showPasswordDialog = true">修改</el-button>
          </div>
          
          <div class="security-item">
            <div class="security-left">
              <span class="label">AccessKey</span>
              <span class="desc key-value">{{ accessKey || '未获取' }}</span>
            </div>
            <el-button type="primary" plain size="small" @click="copyAccessKey" :disabled="!accessKey">复制</el-button>
          </div>
          
          <div class="security-item">
            <div class="security-left">
              <span class="label">SecretKey</span>
              <span class="desc key-value">{{ showSecretKey ? (secretKey || '未获取') : (secretKey ? '••••••••••••' : '未获取') }}</span>
            </div>
            <div class="security-actions">
              <el-button type="default" plain size="small" @click="showSecretKey = !showSecretKey">
                {{ showSecretKey ? '隐藏' : '显示' }}
              </el-button>
              <el-button type="primary" plain size="small" @click="copySecretKey" :disabled="!secretKey">复制</el-button>
            </div>
          </div>
          
          <div class="security-item warning">
            <div class="security-left">
              <span class="label">重新生成密钥</span>
              <span class="desc">重新生成后原密钥将立即失效</span>
            </div>
            <el-button type="danger" plain size="small" @click="showRegenerateDialog = true">重新生成</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="420px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRegenerateDialog" title="重新生成密钥" width="420px">
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
import { WarningFilled, User, Lock, CollectionTag } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { accessKeyApi } from '@/api/accessKey'
import { tagApi } from '@/api/tag'
import TagInput from '@/components/TagInput.vue'

const userStore = useUserStore()

const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
  isAdmin: 0
})

const userTags = ref<string[]>([])

onMounted(async () => {
  try {
    await userStore.getUserInfo()
    userInfo.username = userStore.userInfo?.username || ''
    userInfo.email = userStore.userInfo?.email || ''
    userInfo.phone = userStore.userInfo?.phone || ''
    userInfo.isAdmin = userStore.userInfo?.isAdmin || 0
    userTags.value = userStore.userInfo?.tags || []
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
  try {
    const res = await tagApi.getUserTags()
    userTags.value = res.data || []
  } catch (error) {
    console.error('获取用户标签失败', error)
  }
})

const accessKey = ref('')
const secretKey = ref('')
const showSecretKey = ref(false)

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

const saveTags = async () => {
  try {
    await tagApi.saveUserTags(userTags.value)
    ElMessage.success('标签保存成功')
  } catch (error) {
    console.error('保存标签失败', error)
    ElMessage.error('保存标签失败')
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
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1E3A8A;
}

.user-info-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 16px;
  color: #64748B;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
}

.section-header .el-icon {
  color: #409EFF;
}

.info-form {
  padding: 0 8px;
}

.skill-content {
  padding: 0 8px;
}

.skill-desc {
  color: #64748B;
  font-size: 14px;
  margin-bottom: 16px;
}

.security-list {
  display: flex;
  flex-direction: column;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px;
  border-bottom: 1px solid #F1F5F9;
}

.security-item:last-child {
  border-bottom: none;
}

.security-item.warning {
  background-color: #FEF3C7;
  margin: 8px -16px -16px -16px;
  padding: 16px;
  border-radius: 0 0 8px 8px;
  border-bottom: none;
}

.security-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.security-left .label {
  font-size: 14px;
  font-weight: 500;
  color: #1E3A8A;
}

.security-left .desc {
  font-size: 12px;
  color: #94A3B8;
}

.security-left .key-value {
  font-family: monospace;
  color: #64748B;
}

.security-actions {
  display: flex;
  gap: 8px;
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

@media (max-width: 900px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}
</style>
