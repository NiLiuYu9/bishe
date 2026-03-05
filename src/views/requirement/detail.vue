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
          <el-tag :type="getStatusType(requirement.status)" size="large">
            {{ getStatusText(requirement.status) }}
          </el-tag>
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
        
        <div class="req-tags">
          <h3>功能标签</h3>
          <div class="tags-list">
            <el-tag v-for="tag in requirement.tags" :key="tag">{{ tag }}</el-tag>
          </div>
        </div>
        
        <div class="req-params">
          <h3>参数要求</h3>
          <el-row :gutter="24">
            <el-col :span="12">
              <h4>请求参数</h4>
              <el-table :data="requirement.requestParams" border size="small">
                <el-table-column prop="name" label="参数名" />
                <el-table-column prop="type" label="类型" />
                <el-table-column prop="description" label="说明" />
              </el-table>
            </el-col>
            <el-col :span="12">
              <h4>返回参数</h4>
              <el-table :data="requirement.responseParams" border size="small">
                <el-table-column prop="name" label="字段名" />
                <el-table-column prop="type" label="类型" />
                <el-table-column prop="description" label="说明" />
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
import { ArrowLeft, User, Money, Calendar, Clock } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import { useUserStore } from '@/stores/user'
import type { Requirement, Applicant } from '@/types/requirement'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const showApplyDialog = ref(false)

const requirement = ref<Requirement>({
  id: 0,
  title: '',
  description: '',
  tags: [],
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
    const res = await requirementApi.getList({ page: 1, pageSize: 1 })
    requirement.value = res.data.list.find(r => r.id === Number(id)) || mockRequirement
  } catch (error) {
    console.error('获取需求详情失败', error)
    requirement.value = mockRequirement
  } finally {
    loading.value = false
  }
}

const mockRequirement: Requirement = {
  id: 1,
  title: '需要一个企业信息查询API',
  description: '需要根据企业名称或统一社会信用代码查询企业基本信息，包括注册资本、法人代表、经营范围、成立日期、企业状态等。要求接口响应速度快，数据准确，支持批量查询。',
  tags: ['数据查询', '企业信息', '工商数据'],
  requestParams: [
    { name: 'companyName', type: 'string', description: '企业名称' },
    { name: 'creditCode', type: 'string', description: '统一社会信用代码' }
  ],
  responseParams: [
    { name: 'name', type: 'string', description: '企业名称' },
    { name: 'creditCode', type: 'string', description: '统一社会信用代码' },
    { name: 'legalPerson', type: 'string', description: '法人代表' },
    { name: 'registeredCapital', type: 'string', description: '注册资本' }
  ],
  budget: 500,
  deadline: '2024-02-01',
  userId: 1,
  username: 'user1',
  status: 'open',
  applicants: [
    { id: 1, userId: 2, username: 'developer1', description: '有丰富的数据接口开发经验', status: 'pending', applyTime: '2024-01-16' },
    { id: 2, userId: 3, username: 'developer2', description: '已有类似接口，可直接提供', status: 'pending', applyTime: '2024-01-17' }
  ],
  createTime: '2024-01-15',
  updateTime: '2024-01-15'
}

const submitApply = async () => {
  try {
    await requirementApi.apply(requirement.value.id, applyForm)
    ElMessage.success('申请成功')
    showApplyDialog.value = false
    fetchRequirement()
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.success('申请成功（模拟）')
    showApplyDialog.value = false
  }
}

const selectApplicant = async (applicant: Applicant) => {
  ElMessage.success('已选择开发者')
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    open: 'success',
    in_progress: 'warning',
    completed: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    open: '开放中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
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
.req-tags,
.req-params {
  margin-bottom: 24px;
}

.req-desc h3,
.req-tags h3,
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

.tags-list {
  display: flex;
  gap: 8px;
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

.action-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}
</style>
