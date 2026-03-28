<template>
  <div class="requirement-list-page">
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">需求广场</h1>
        <div class="header-actions">
          <el-button type="success" @click="showRecommendations" v-if="userStore.isLoggedIn">
            <el-icon><MagicStick /></el-icon> 智能推荐
          </el-button>
          <el-button type="primary" @click="router.push('/user/my-requirements')" v-if="userStore.isLoggedIn">
            <el-icon><Plus /></el-icon> 发布需求
          </el-button>
        </div>
      </div>
      
      <div class="filter-section card">
        <el-form :inline="true" :model="filters">
          <el-form-item label="关键词">
            <el-input v-model="filters.keyword" placeholder="搜索需求" clearable />
          </el-form-item>
          <el-form-item label="预算范围">
            <el-col :span="11">
              <el-input v-model.number="filters.minBudget" placeholder="最低" />
            </el-col>
            <el-col :span="2" style="text-align: center;">-</el-col>
            <el-col :span="11">
              <el-input v-model.number="filters.maxBudget" placeholder="最高" />
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="requirements-list" v-loading="loading">
        <div v-if="requirements.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无需求" />
        </div>
        
        <div v-else class="requirement-cards">
          <div v-for="req in requirements" :key="req.id" class="requirement-card" @click="goToDetail(req.id)">
            <div class="req-header">
              <h3>{{ req.title }}</h3>
              <StatusTag :status="req.status" type="requirement" />
            </div>
            
            <p class="req-desc">{{ req.description }}</p>
            
            <div class="req-tags" v-if="req.tags && req.tags.length > 0">
              <el-tag v-for="tag in req.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
            </div>
            
            <div class="req-match" v-if="req.matchScore !== undefined && req.matchScore !== null">
              <el-progress :percentage="req.matchScore" :stroke-width="8" :show-text="false" />
              <span class="match-text">匹配度: {{ req.matchScore.toFixed(1) }}%</span>
            </div>
            
            <div class="req-meta">
              <div class="req-info">
                <span><el-icon><User /></el-icon> {{ req.username }}</span>
                <span><el-icon><Money /></el-icon> ¥{{ req.budget }}</span>
                <span><el-icon><Calendar /></el-icon> {{ req.deadline }}</span>
              </div>
              <span class="time">{{ req.createTime }}</span>
            </div>
            
            <div class="req-footer" v-if="req.status === 'open' && userStore.isLoggedIn">
              <template v-if="!req.myApplyStatus">
                <el-button type="primary" @click.stop="applyRequirement(req)">立即接单</el-button>
              </template>
              <template v-else>
                <el-tag :type="getApplyStatusType(req.myApplyStatus)">
                  {{ getApplyStatusText(req.myApplyStatus) }}
                </el-tag>
              </template>
            </div>
          </div>
        </div>
        
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
      
      <el-dialog v-model="applyDialogVisible" title="申请接单" width="500px">
        <el-form :model="applyForm" label-width="80px">
          <el-form-item label="自我介绍">
            <el-input
              v-model="applyForm.description"
              type="textarea"
              :rows="4"
              placeholder="请介绍您的技术能力和开发经验"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="applyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApply">提交申请</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, User, Money, Calendar, MagicStick } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import { apiManagement } from '@/api/api'
import { useUserStore } from '@/stores/user'
import { tagApi } from '@/api/tag'
import StatusTag from '@/components/StatusTag.vue'
import type { Requirement } from '@/types/requirement'
import type { ApiType } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const requirements = ref<Requirement[]>([])
const total = ref(0)
const types = ref<ApiType[]>([])
const isRecommendMode = ref(false)

const applyDialogVisible = ref(false)
const currentReq = ref<Requirement | null>(null)
const applyForm = reactive({ description: '' })

const filters = reactive({
  keyword: '',
  minBudget: undefined as number | undefined,
  maxBudget: undefined as number | undefined
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

const fetchTypes = async () => {
  try {
    const res = await apiManagement.getApiTypes({ pageNum: 1, pageSize: 100 })
    types.value = res.data.list
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const fetchRequirements = async () => {
  loading.value = true
  isRecommendMode.value = false
  try {
    const res = await requirementApi.getList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...filters
    })
    requirements.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取需求列表失败', error)
    requirements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const showRecommendations = async () => {
  loading.value = true
  isRecommendMode.value = true
  try {
    const res = await tagApi.getRecommendedRequirements({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    requirements.value = res.data.list
    total.value = res.data.total
    if (requirements.value.length === 0) {
      ElMessage.warning('暂无匹配的需求，请先在个人资料页面设置技能标签')
    }
  } catch (error) {
    console.error('获取推荐需求失败', error)
    ElMessage.error('获取推荐需求失败')
    requirements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  if (isRecommendMode.value) {
    showRecommendations()
  } else {
    fetchRequirements()
  }
}

const handlePageChange = () => {
  if (isRecommendMode.value) {
    showRecommendations()
  } else {
    fetchRequirements()
  }
}

const handleSizeChange = () => {
  pagination.pageNum = 1
  if (isRecommendMode.value) {
    showRecommendations()
  } else {
    fetchRequirements()
  }
}

const resetFilters = () => {
  filters.keyword = ''
  filters.minBudget = undefined
  filters.maxBudget = undefined
  pagination.pageNum = 1
  if (isRecommendMode.value) {
    showRecommendations()
  } else {
    fetchRequirements()
  }
}

const goToDetail = (id: number) => {
  router.push(`/requirement/${id}`)
}

const applyRequirement = (req: Requirement) => {
  currentReq.value = req
  applyForm.description = ''
  applyDialogVisible.value = true
}

const submitApply = async () => {
  if (!currentReq.value) return
  
  try {
    await requirementApi.apply(currentReq.value.id, { description: applyForm.description })
    ElMessage.success('申请成功')
    applyDialogVisible.value = false
    fetchRequirements()
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.error('申请失败')
  }
}

const getApplyStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getApplyStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '申请中',
    accepted: '已接单',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchTypes()
  if (route.query.autoMatch === 'true' && userStore.isLoggedIn) {
    showRecommendations()
  } else {
    fetchRequirements()
  }
})
</script>

<style scoped>
.requirement-list-page {
  display: flex;
  min-height: calc(100vh - 64px - 80px);
}

.page-content {
  flex: 1;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.requirement-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.requirement-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.requirement-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.req-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.req-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
}

.req-desc {
  color: #475569;
  margin-bottom: 16px;
  line-height: 1.6;
}

.req-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-item {
  background: #E0F2FE;
  color: #0369A1;
  border: none;
}

.req-match {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.req-match .el-progress {
  flex: 1;
  max-width: 200px;
}

.match-text {
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}

.req-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.req-info {
  display: flex;
  gap: 24px;
  color: #64748B;
  font-size: 14px;
}

.req-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time {
  font-size: 13px;
  color: #94A3B8;
}

.req-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.empty-state {
  padding: 80px 0;
}
</style>
