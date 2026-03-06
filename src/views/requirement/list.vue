<template>
  <div class="requirement-list-page">
    <div class="page-header">
      <h1 class="page-title">需求广场</h1>
      <el-button type="primary" @click="router.push('/user/my-requirements')" v-if="userStore.isLoggedIn">
        <el-icon><Plus /></el-icon> 发布需求
      </el-button>
    </div>
    
    <div class="filter-section card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索需求" clearable />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filters.tags" multiple placeholder="选择标签" clearable>
            <el-option label="数据查询" value="数据查询" />
            <el-option label="图像处理" value="图像处理" />
            <el-option label="文本处理" value="文本处理" />
            <el-option label="支付接口" value="支付接口" />
            <el-option label="位置服务" value="位置服务" />
          </el-select>
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
            <el-tag :type="getStatusType(req.status)">{{ getStatusText(req.status) }}</el-tag>
          </div>
          
          <p class="req-desc">{{ req.description }}</p>
          
          <div class="req-tags">
            <el-tag v-for="tag in req.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
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
            <el-button type="primary" @click.stop="applyRequirement(req)">立即接单</el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, User, Money, Calendar } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import { useUserStore } from '@/stores/user'
import type { Requirement } from '@/types/requirement'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const requirements = ref<Requirement[]>([])
const total = ref(0)

const applyDialogVisible = ref(false)
const currentReq = ref<Requirement | null>(null)
const applyForm = reactive({ description: '' })

const filters = reactive({
  keyword: '',
  tags: [] as string[],
  minBudget: undefined as number | undefined,
  maxBudget: undefined as number | undefined
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const mockRequirements: Requirement[] = [
  {
    id: 1,
    title: '需要一个企业信息查询API',
    description: '需要根据企业名称或统一社会信用代码查询企业基本信息，包括注册资本、法人代表、经营范围等。要求接口响应速度快，数据准确。',
    tags: ['数据查询', '企业信息'],
    requestParams: [],
    responseParams: [],
    budget: 500,
    deadline: '2024-02-01',
    userId: 1,
    username: 'user1',
    status: 'open',
    applicants: [],
    createTime: '2024-01-15',
    updateTime: '2024-01-15'
  },
  {
    id: 2,
    title: '图片水印添加API',
    description: '需要给图片添加文字或图片水印，支持批量处理，支持透明度设置和位置调整。',
    tags: ['图像处理'],
    requestParams: [],
    responseParams: [],
    budget: 300,
    deadline: '2024-01-30',
    userId: 2,
    username: 'user2',
    status: 'open',
    applicants: [],
    createTime: '2024-01-10',
    updateTime: '2024-01-10'
  },
  {
    id: 3,
    title: '短信验证码API',
    description: '需要短信验证码发送接口，支持三大运营商，到达率99%以上。',
    tags: ['通信服务'],
    requestParams: [],
    responseParams: [],
    budget: 800,
    deadline: '2024-02-15',
    userId: 3,
    username: 'user3',
    status: 'in_progress',
    applicants: [],
    createTime: '2024-01-08',
    updateTime: '2024-01-12'
  }
]

const fetchRequirements = async () => {
  loading.value = true
  try {
    const res = await requirementApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    })
    requirements.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取需求列表失败', error)
    requirements.value = mockRequirements
    total.value = mockRequirements.length
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRequirements()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.tags = []
  filters.minBudget = undefined
  filters.maxBudget = undefined
  pagination.page = 1
  fetchRequirements()
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
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.success('申请成功（模拟）')
    applyDialogVisible.value = false
  }
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

onMounted(() => {
  fetchRequirements()
})
</script>

<style scoped>
.requirement-list-page {
  max-width: 1200px;
  margin: 0 auto;
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
  margin-bottom: 12px;
  line-height: 1.6;
}

.req-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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
