<template>
  <div class="requirement-detail-page">
    <div class="back-link">
      <el-button text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
    </div>
    
    <div class="detail-content" v-loading="loading">
      <div class="main-info card">
        <div class="req-header">
          <h1>{{ requirement.title }}</h1>
          <StatusTag :status="requirement.status" type="requirement" size="large" />
        </div>
        
        <div class="req-meta">
          <span><el-icon><User /></el-icon> {{ requirement.username }}</span>
          <span><el-icon><Money /></el-icon> 预算: ¥{{ requirement.budget }}</span>
          <span><el-icon><Calendar /></el-icon> 截止: {{ requirement.deadline }}</span>
          <span><el-icon><Clock /></el-icon> 发布: {{ requirement.createTime }}</span>
        </div>
        
        <div class="req-desc">
          <h3>需求描述</h3>
          <p>{{ requirement.description }}</p>
        </div>
        
        <div class="delivery-url" v-if="requirement.deliveryUrl && (requirement.status === 'delivered' || requirement.status === 'completed')">
          <h3>交付网址</h3>
          <div class="url-container">
            <el-link :href="requirement.deliveryUrl" target="_blank" type="primary" :underline="false">
              {{ requirement.deliveryUrl }}
              <el-icon><Link /></el-icon>
            </el-link>
          </div>
        </div>
        
        <div class="req-params">
          <h3>参数要求</h3>
          <el-row :gutter="24">
            <el-col :span="12">
              <h4>请求参数</h4>
              <el-table :data="requirement.requestParams" border size="small">
                <el-table-column prop="name" label="参数名" width="120" />
                <el-table-column prop="type" label="类型" width="80" />
                <el-table-column prop="required" label="必填" width="60">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                      {{ row.required ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="说明" />
                <el-table-column prop="example" label="示例" width="100" />
              </el-table>
            </el-col>
            <el-col :span="12">
              <h4>返回参数</h4>
              <el-table :data="requirement.responseParams" border size="small">
                <el-table-column prop="name" label="字段名" width="120" />
                <el-table-column prop="type" label="类型" width="80" />
                <el-table-column prop="required" label="必填" width="60">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                      {{ row.required ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="说明" />
                <el-table-column prop="example" label="示例" width="100" />
              </el-table>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <div class="applicants-section card" v-if="requirement.applicants && requirement.applicants.length > 0">
        <h3 class="section-title">申请者列表</h3>
        <el-table :data="requirement.applicants" border>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="description" label="申请说明" />
          <el-table-column prop="applyTime" label="申请时间" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getApplicantStatusType(row.status)">{{ getApplicantStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" v-if="isOwner">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'pending'" 
                type="primary" 
                size="small"
                @click="selectApplicant(row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="action-section" v-if="requirement.status === 'open' && userStore.isLoggedIn && !isOwner">
        <el-button type="primary" size="large" @click="showApplyDialog = true">
          立即接单
        </el-button>
      </div>
    </div>
    
    <el-dialog v-model="showApplyDialog" title="申请接单" width="500px">
      <el-form :model="applyForm" label-width="80px">
        <el-form-item label="申请说明">
          <el-input
            v-model="applyForm.description"
            type="textarea"
            :rows="4"
            placeholder="请介绍您的技术能力和开发计划"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Money, Calendar, Clock, Link } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import { useUserStore } from '@/stores/user'
import type { Requirement, Applicant } from '@/types/requirement'
import { getStatusInfo, REQUIREMENT_STATUS } from '@/utils/status'
import StatusTag from '@/components/StatusTag.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const showApplyDialog = ref(false)

const requirement = ref<Requirement>({
  id: 0,
  title: '',
  description: '',
  requestParams: [],
  responseParams: [],
  budget: 0,
  deadline: '',
  userId: 0,
  username: '',
  status: 'open',
  applicants: [],
  createTime: '',
  updateTime: ''
})

const applyForm = reactive({ description: '' })

const isOwner = computed(() => {
  return requirement.value.userId === userStore.userInfo?.id
})

const fetchRequirement = async () => {
  const id = route.params.id as string
  loading.value = true
  try {
    const res = await requirementApi.getDetail(id)
    requirement.value = res.data
  } catch (error) {
    console.error('获取需求详情失败', error)
    ElMessage.error('获取需求详情失败')
  } finally {
    loading.value = false
  }
}

const submitApply = async () => {
  try {
    await requirementApi.apply(requirement.value.id, applyForm)
    ElMessage.success('申请成功')
    showApplyDialog.value = false
    fetchRequirement()
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.error('申请失败')
  }
}

const selectApplicant = async (applicant: Applicant) => {
  try {
    await requirementApi.selectApplicant(requirement.value.id, { applicantId: applicant.id })
    ElMessage.success('已选择开发者')
    fetchRequirement()
  } catch (error) {
    console.error('选择开发者失败:', error)
    ElMessage.error('选择开发者失败')
  }
}

const getApplicantStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getApplicantStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    accepted: '已选中',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchRequirement()
})
</script>

<style scoped>
.requirement-detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 16px;
}

.main-info {
  margin-bottom: 24px;
}

.req-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.req-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1E3A8A;
}

.req-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  color: #64748B;
  font-size: 14px;
}

.req-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.req-desc,
.req-params {
  margin-bottom: 24px;
}

.delivery-url {
  margin-bottom: 24px;
}

.delivery-url h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
}

.url-container {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
}

.url-container .el-link {
  font-size: 14px;
  color: #0284c7;
  display: flex;
  align-items: center;
  gap: 4px;
  word-break: break-all;
}

.req-desc h3,
.req-params h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
}

.req-desc p {
  color: #475569;
  line-height: 1.6;
}

.req-params h4 {
  font-size: 14px;
  font-weight: 500;
  color: #1E3A8A;
  margin-bottom: 12px;
}

.applicants-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 16px;
}

.action-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}
</style>
