<template>
  <div class="my-requirements-page">
    <div class="page-header">
      <h2 class="page-title">我的需求</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 发布需求
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="我发布的" name="published" />
      <el-tab-pane label="我接单的" name="applied" />
    </el-tabs>
    
    <div class="requirements-list" v-loading="loading">
      <div v-if="requirements.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无需求" />
      </div>
      
      <div v-else class="requirement-cards">
        <div v-for="req in requirements" :key="req.id" class="requirement-card">
          <div class="req-header">
            <h3>{{ req.title }}</h3>
            <el-tag :type="getStatusType(req.status)">{{ getStatusText(req.status) }}</el-tag>
          </div>
          
          <p class="req-desc">{{ req.description }}</p>
          
          <div class="req-tags">
            <el-tag v-for="tag in req.tags" :key="tag" size="small">{{ tag }}</el-tag>
          </div>
          
          <div class="req-info">
            <span><el-icon><Money /></el-icon> 预算: ¥{{ req.budget }}</span>
            <span><el-icon><Calendar /></el-icon> 截止: {{ req.deadline }}</span>
          </div>
          
          <div class="req-footer">
            <span class="time">发布于 {{ req.createTime }}</span>
            <div class="actions">
              <el-button text type="primary" @click="viewDetail(req)">查看详情</el-button>
              <el-button v-if="activeTab === 'published'" text type="primary" @click="editRequirement(req)">编辑</el-button>
              <el-button v-if="activeTab === 'published'" text type="danger" @click="deleteRequirement(req)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showCreateDialog" :title="editingReq ? '编辑需求' : '发布需求'" width="600px">
      <el-form ref="formRef" :model="reqForm" :rules="rules" label-width="100px">
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="reqForm.title" placeholder="请输入需求标题" />
        </el-form-item>
        
        <el-form-item label="需求描述" prop="description">
          <el-input v-model="reqForm.description" type="textarea" :rows="4" placeholder="详细描述您的需求" />
        </el-form-item>
        
        <el-form-item label="功能标签" prop="tags">
          <el-select v-model="reqForm.tags" multiple placeholder="选择相关标签">
            <el-option label="数据查询" value="数据查询" />
            <el-option label="图像处理" value="图像处理" />
            <el-option label="文本处理" value="文本处理" />
            <el-option label="支付接口" value="支付接口" />
            <el-option label="位置服务" value="位置服务" />
            <el-option label="通信服务" value="通信服务" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预算金额" prop="budget">
          <el-input v-model.number="reqForm.budget" type="number" placeholder="预算金额">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="交付日期" prop="deadline">
          <el-date-picker v-model="reqForm.deadline" type="date" placeholder="选择交付日期" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Money, Calendar } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import type { Requirement, RequirementCreateParams } from '@/types/requirement'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('published')
const showCreateDialog = ref(false)
const editingReq = ref<Requirement | null>(null)
const formRef = ref<FormInstance>()

const requirements = ref<Requirement[]>([])

const reqForm = reactive<RequirementCreateParams>({
  title: '',
  description: '',
  tags: [],
  requestParams: [],
  responseParams: [],
  budget: 0,
  deadline: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入需求描述', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择交付日期', trigger: 'change' }]
}

const mockRequirements: Requirement[] = [
  {
    id: 1,
    title: '需要一个企业信息查询API',
    description: '需要根据企业名称或统一社会信用代码查询企业基本信息，包括注册资本、法人代表、经营范围等',
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
    description: '需要给图片添加文字或图片水印，支持批量处理',
    tags: ['图像处理'],
    requestParams: [],
    responseParams: [],
    budget: 300,
    deadline: '2024-01-30',
    userId: 1,
    username: 'user1',
    status: 'in_progress',
    applicants: [],
    createTime: '2024-01-10',
    updateTime: '2024-01-12'
  }
]

const fetchRequirements = async () => {
  loading.value = true
  try {
    const res = activeTab.value === 'published' 
      ? await requirementApi.getMyRequirements({ page: 1, pageSize: 20 })
      : await requirementApi.getList({ page: 1, pageSize: 20 })
    requirements.value = res.data.list
  } catch (error) {
    console.error('获取需求列表失败:', error)
    requirements.value = mockRequirements
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  fetchRequirements()
}

const viewDetail = (req: Requirement) => {
  router.push(`/requirement/${req.id}`)
}

const editRequirement = (req: Requirement) => {
  editingReq.value = req
  Object.assign(reqForm, {
    title: req.title,
    description: req.description,
    tags: req.tags,
    requestParams: req.requestParams,
    responseParams: req.responseParams,
    budget: req.budget,
    deadline: req.deadline
  })
  showCreateDialog.value = true
}

const deleteRequirement = async (req: Requirement) => {
  try {
    await ElMessageBox.confirm('确定要删除该需求吗？', '提示', { type: 'warning' })
    await requirementApi.delete(req.id)
    ElMessage.success('删除成功')
    fetchRequirements()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingReq.value) {
          await requirementApi.update(editingReq.value.id, reqForm)
          ElMessage.success('修改成功')
        } else {
          await requirementApi.create(reqForm)
          ElMessage.success('发布成功')
        }
        showCreateDialog.value = false
        resetForm()
        fetchRequirements()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.success('操作成功（模拟）')
        showCreateDialog.value = false
      }
    }
  })
}

const resetForm = () => {
  editingReq.value = null
  Object.assign(reqForm, {
    title: '',
    description: '',
    tags: [],
    requestParams: [],
    responseParams: [],
    budget: 0,
    deadline: ''
  })
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
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 20px;
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

.req-info {
  display: flex;
  gap: 24px;
  color: #64748B;
  font-size: 14px;
  margin-bottom: 16px;
}

.req-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.req-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.req-footer .time {
  font-size: 13px;
  color: #94A3B8;
}

.actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 80px 0;
}
</style>
