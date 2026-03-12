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
          
          <div class="req-info">
            <span><el-icon><Money /></el-icon> 预算: ¥{{ req.budget }}</span>
            <span><el-icon><Calendar /></el-icon> 截止: {{ req.deadline }}</span>
          </div>
          
          <div class="req-footer">
            <span class="time">发布于: {{ req.createTime }}</span>
            <div class="actions">
              <el-button text type="primary" @click="viewDetail(req)">查看详情</el-button>
              <el-button v-if="activeTab === 'published' && req.status === 'open'" text type="primary" @click="editRequirement(req)">编辑</el-button>
              <el-button v-if="activeTab === 'published' && req.status !== 'in_progress'" text type="danger" @click="deleteRequirement(req)">删除</el-button>
              <el-button v-if="activeTab === 'published' && req.status === 'in_progress'" text type="success" @click="completeRequirement(req)">完成</el-button>
              <el-button v-if="activeTab === 'published' && (req.status === 'open' || req.status === 'in_progress')" text type="warning" @click="cancelRequirement(req)">取消</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <el-dialog v-model="showCreateDialog" :title="editingReq ? '编辑需求' : '发布需求'" width="900px">
      <el-form ref="formRef" :model="reqForm" :rules="rules" label-width="100px">
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="reqForm.title" placeholder="请输入需求标题" />
        </el-form-item>
        
        <el-form-item label="需求描述" prop="description">
          <el-input v-model="reqForm.description" type="textarea" :rows="4" placeholder="详细描述您的需求" />
        </el-form-item>
        
        <el-form-item label="预算金额" prop="budget">
          <el-input v-model.number="reqForm.budget" type="number" placeholder="预算金额">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="交付日期" prop="deadline">
          <el-date-picker v-model="reqForm.deadline" type="date" placeholder="选择交付日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        
        <el-divider content-position="left">请求参数</el-divider>
        <el-form-item label="" prop="requestParams">
          <div class="params-container">
            <div v-for="(param, index) in reqForm.requestParams" :key="index" class="param-item">
              <el-row :gutter="8">
                <el-col :span="4">
                  <el-input v-model="param.name" placeholder="参数名" />
                </el-col>
                <el-col :span="5">
                  <el-select v-model="param.type" placeholder="类型">
                    <el-option label="string" value="string" />
                    <el-option label="number" value="number" />
                    <el-option label="boolean" value="boolean" />
                    <el-option label="object" value="object" />
                    <el-option label="array" value="array" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="param.required" placeholder="必填">
                    <el-option label="必填" :value="true" />
                    <el-option label="选填" :value="false" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-input v-model="param.description" placeholder="描述" />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="param.example" placeholder="示例值" />
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" text @click="removeRequestParam(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" text @click="addRequestParam">
              <el-icon><Plus /></el-icon> 添加请求参数
            </el-button>
          </div>
        </el-form-item>
        
        <el-divider content-position="left">响应参数</el-divider>
        <el-form-item label="" prop="responseParams">
          <div class="params-container">
            <div v-for="(param, index) in reqForm.responseParams" :key="index" class="param-item">
              <el-row :gutter="8">
                <el-col :span="4">
                  <el-input v-model="param.name" placeholder="参数名" />
                </el-col>
                <el-col :span="5">
                  <el-select v-model="param.type" placeholder="类型">
                    <el-option label="string" value="string" />
                    <el-option label="number" value="number" />
                    <el-option label="boolean" value="boolean" />
                    <el-option label="object" value="object" />
                    <el-option label="array" value="array" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="param.required" placeholder="必填">
                    <el-option label="必填" :value="true" />
                    <el-option label="选填" :value="false" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-input v-model="param.description" placeholder="描述" />
                </el-col>
                <el-col :span="4">
                  <el-input v-model="param.example" placeholder="示例值" />
                </el-col>
                <el-col :span="2">
                  <el-button type="danger" text @click="removeResponseParam(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" text @click="addResponseParam">
              <el-icon><Plus /></el-icon> 添加响应参数
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ editingReq ? '保存' : '发布' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Money, Calendar, Delete } from '@element-plus/icons-vue'
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
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const reqForm = reactive<RequirementCreateParams>({
  title: '',
  description: '',
  requestParams: [],
  responseParams: [],
  budget: 0,
  deadline: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入需求描述', trigger: 'blur' }],
  budget: [{ required: true, message: '请输入预算金额', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择交付日期', trigger: 'change' }],
  requestParams: [
    { 
      required: true, 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个请求参数'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  responseParams: [
    { 
      required: true, 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个响应参数'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const createEmptyParam = () => ({
  name: '',
  type: 'string',
  required: true,
  description: '',
  example: ''
})

const addRequestParam = () => {
  reqForm.requestParams.push(createEmptyParam())
}

const removeRequestParam = (index: number) => {
  reqForm.requestParams.splice(index, 1)
}

const addResponseParam = () => {
  reqForm.responseParams.push(createEmptyParam())
}

const removeResponseParam = (index: number) => {
  reqForm.responseParams.splice(index, 1)
}

const fetchRequirements = async () => {
  loading.value = true
  try {
    const res = activeTab.value === 'published' 
      ? await requirementApi.getMyRequirements({ pageNum: pageNum.value, pageSize: pageSize.value })
      : await requirementApi.getMyRequirements({ pageNum: pageNum.value, pageSize: pageSize.value, status: 'applied' })
    requirements.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取需求列表失败:', error)
    requirements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  pageNum.value = 1
  fetchRequirements()
}

const handleCurrentChange = (val: number) => {
  pageNum.value = val
  fetchRequirements()
}

const handleTabChange = () => {
  pageNum.value = 1
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

const completeRequirement = async (req: Requirement) => {
  try {
    await ElMessageBox.confirm('确定要将该需求标记为完成吗？', '提示', { type: 'info' })
    await requirementApi.complete(req.id)
    ElMessage.success('已标记完成')
    fetchRequirements()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const cancelRequirement = async (req: Requirement) => {
  try {
    await ElMessageBox.confirm('确定要取消该需求吗？', '提示', { type: 'warning' })
    await requirementApi.cancel(req.id)
    ElMessage.success('已取消')
    fetchRequirements()
  } catch (error) {
    console.error('操作失败:', error)
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
        ElMessage.error('操作失败')
      }
    }
  })
}

const resetForm = () => {
  editingReq.value = null
  formRef.value?.resetFields()
  reqForm.title = ''
  reqForm.description = ''
  reqForm.requestParams = []
  reqForm.responseParams = []
  reqForm.budget = 0
  reqForm.deadline = ''
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
  margin-bottom: 16px;
  line-height: 1.6;
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

.params-container {
  width: 100%;
}

.param-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
