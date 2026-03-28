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
            <StatusTag :status="req.status" type="requirement" />
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
              <el-button v-if="activeTab === 'published' && req.status !== 'in_progress' && req.status !== 'delivered'" text type="danger" @click="deleteRequirement(req)">删除</el-button>
              <el-button v-if="activeTab === 'published' && req.status === 'in_progress'" text type="success" @click="completeRequirement(req)">完成</el-button>
              <el-button v-if="activeTab === 'published' && (req.status === 'open' || req.status === 'in_progress' || req.status === 'delivered')" text type="warning" @click="cancelRequirement(req)">取消</el-button>
              <el-button v-if="activeTab === 'published' && (req.status === 'in_progress' || req.status === 'completed' || req.status === 'delivered')" text type="warning" @click="openAfterSaleDialog(req)">申请售后</el-button>
              <el-button v-if="activeTab === 'published' && req.status === 'delivered'" text type="success" @click="confirmDeliveryRequirement(req)">确认交付</el-button>
              <el-button v-if="activeTab === 'applied' && req.status === 'in_progress'" text type="primary" @click="deliverRequirement(req)">交付</el-button>
              <el-button v-if="req.status === 'after_sale'" text type="info" @click="viewAfterSaleDetail(req)">售后详情</el-button>
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
        
        <el-form-item label="技术标签">
          <TagInput v-model="reqForm.tags" placeholder="输入技术标签，如：Java、Vue、MySQL" />
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

    <el-dialog v-model="showAfterSaleDialog" title="申请售后" width="500px">
      <el-form :model="afterSaleForm" label-width="100px">
        <el-form-item label="需求标题">
          <span>{{ currentReq?.title }}</span>
        </el-form-item>
        <el-form-item label="售后原因" required>
          <el-input v-model="afterSaleForm.reason" type="textarea" :rows="3" placeholder="请输入售后原因" />
        </el-form-item>
        <el-form-item label="未实现功能">
          <el-input v-model="afterSaleForm.unimplementedFeatures" type="textarea" :rows="3" placeholder="请描述未实现的功能点（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAfterSaleDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAfterSale">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAfterSaleDetailDialog" title="售后详情" width="700px">
      <el-descriptions :column="1" border style="margin-bottom: 16px;">
        <el-descriptions-item label="需求标题">{{ currentAfterSale?.requirementTitle }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentAfterSale?.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="开发者">{{ currentAfterSale?.developerName }}</el-descriptions-item>
        <el-descriptions-item label="售后原因">{{ currentAfterSale?.reason }}</el-descriptions-item>
        <el-descriptions-item label="未实现功能">{{ currentAfterSale?.unimplementedFeatures || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getAfterSaleStatusType(currentAfterSale?.status)">{{ getAfterSaleStatusText(currentAfterSale?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentAfterSale?.result" label="处理结果">
          <el-tag :type="currentAfterSale?.result === 'completed' ? 'success' : 'warning'">
            {{ currentAfterSale?.result === 'completed' ? '项目完成' : '已退款' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div v-for="msg in afterSaleMessages" :key="msg.id"
               :class="['chat-message', { self: msg.senderId === userStore.userInfo?.id }]">
            <div class="message-avatar" :class="msg.senderType">
              {{ msg.senderName?.charAt(0).toUpperCase() }}
            </div>
            <div class="message-body">
              <div class="message-info">
                <span class="sender-name">{{ msg.senderName }}</span>
                <span class="sender-type">{{ getSenderTypeText(msg.senderType) }}</span>
                <span class="message-time">{{ msg.createTime }}</span>
              </div>
              <div class="message-bubble">
                <div class="bubble-content">{{ msg.content }}</div>
              </div>
            </div>
          </div>
          <div v-if="afterSaleMessages.length === 0" class="no-messages">
            暂无对话记录
          </div>
        </div>
        <div class="chat-input" v-if="currentAfterSale?.status === 'pending'">
          <el-input 
            v-model="newMessage" 
            type="textarea" 
            :rows="2" 
            placeholder="输入消息内容..."
            @keyup.enter.ctrl="sendAfterSaleMessage"
          />
          <el-button type="primary" @click="sendAfterSaleMessage" :loading="sendingMessage">
            发送
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showAfterSaleDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDeliverDialog" title="交付需求" width="500px">
      <el-form :model="deliverForm" label-width="100px">
        <el-form-item label="需求标题">
          <span>{{ currentReq?.title }}</span>
        </el-form-item>
        <el-form-item label="交付网址" required>
          <el-input v-model="deliverForm.deliveryUrl" placeholder="请输入交付网址（如：https://example.com）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDeliverDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDeliver">确认交付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Money, Calendar, Delete } from '@element-plus/icons-vue'
import { requirementApi } from '@/api/requirement'
import { afterSaleApi, type AfterSale, type AfterSaleMessage } from '@/api/afterSale'
import type { Requirement, RequirementCreateParams } from '@/types/requirement'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'
import { getStatusInfo, REQUIREMENT_STATUS } from '@/utils/status'
import StatusTag from '@/components/StatusTag.vue'
import TagInput from '@/components/TagInput.vue'

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
  deadline: '',
  tags: []
})

const showAfterSaleDialog = ref(false)
const showAfterSaleDetailDialog = ref(false)
const showDeliverDialog = ref(false)
const currentReq = ref<Requirement | null>(null)
const currentAfterSale = ref<AfterSale | null>(null)
const afterSaleMessages = ref<AfterSaleMessage[]>([])
const newMessage = ref('')
const sendingMessage = ref(false)
const chatMessagesRef = ref<HTMLElement | null>(null)

const userStore = useUserStore()

const afterSaleForm = reactive({
  reason: '',
  unimplementedFeatures: ''
})

const deliverForm = reactive({
  deliveryUrl: ''
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
    deadline: req.deadline,
    tags: req.tags || []
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

const deliverRequirement = (req: Requirement) => {
  currentReq.value = req
  deliverForm.deliveryUrl = ''
  showDeliverDialog.value = true
}

const submitDeliver = async () => {
  if (!currentReq.value || !deliverForm.deliveryUrl.trim()) {
    ElMessage.warning('请输入交付网址')
    return
  }
  try {
    await requirementApi.deliver(currentReq.value.id, { deliveryUrl: deliverForm.deliveryUrl.trim() })
    ElMessage.success('已交付')
    showDeliverDialog.value = false
    fetchRequirements()
  } catch (error) {
    console.error('交付失败:', error)
  }
}

const confirmDeliveryRequirement = async (req: Requirement) => {
  try {
    await ElMessageBox.confirm('确定要确认交付吗？', '提示', { type: 'info' })
    await requirementApi.confirmDelivery(req.id)
    ElMessage.success('已确认交付')
    fetchRequirements()
  } catch (error) {
    console.error('确认交付失败:', error)
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
  reqForm.tags = []
}

const openAfterSaleDialog = (req: Requirement) => {
  currentReq.value = req
  afterSaleForm.reason = ''
  afterSaleForm.unimplementedFeatures = ''
  showAfterSaleDialog.value = true
}

const submitAfterSale = async () => {
  if (!currentReq.value || !afterSaleForm.reason.trim()) {
    ElMessage.warning('请填写售后原因')
    return
  }
  try {
    await afterSaleApi.create({
      requirementId: currentReq.value.id,
      reason: afterSaleForm.reason.trim(),
      unimplementedFeatures: afterSaleForm.unimplementedFeatures.trim()
    })
    ElMessage.success('售后申请已提交')
    showAfterSaleDialog.value = false
    fetchRequirements()
  } catch (error) {
    console.error('提交售后申请失败:', error)
  }
}

const viewAfterSaleDetail = async (req: Requirement) => {
  try {
    let afterSale: AfterSale | undefined
    if (activeTab.value === 'published') {
      const res = await afterSaleApi.getMyAfterSales({ pageNum: 1, pageSize: 10 })
      afterSale = res.data.list?.find(a => a.requirementId === req.id)
    } else {
      const res = await afterSaleApi.getDeveloperAfterSales({ pageNum: 1, pageSize: 10 })
      afterSale = res.data.list?.find(a => a.requirementId === req.id)
    }
    if (afterSale) {
      currentAfterSale.value = afterSale
      showAfterSaleDetailDialog.value = true
      await loadAfterSaleMessages(afterSale.id)
    }
  } catch (error) {
    console.error('获取售后详情失败:', error)
  }
}

const loadAfterSaleMessages = async (afterSaleId: number) => {
  try {
    const res = await afterSaleApi.getMessages(afterSaleId)
    afterSaleMessages.value = res.data || []
    scrollToBottom()
  } catch (error) {
    console.error('获取对话记录失败:', error)
    afterSaleMessages.value = []
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

const sendAfterSaleMessage = async () => {
  if (!currentAfterSale.value || !newMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  sendingMessage.value = true
  try {
    await afterSaleApi.sendMessage(currentAfterSale.value.id, newMessage.value.trim())
    newMessage.value = ''
    await loadAfterSaleMessages(currentAfterSale.value.id)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sendingMessage.value = false
  }
}

const getSenderTypeText = (type: string) => {
  const texts: Record<string, string> = {
    applicant: '需求方',
    developer: '开发者',
    admin: '管理员'
  }
  return texts[type] || type
}

const getAfterSaleStatusType = (status?: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    resolved: 'success',
    rejected: 'danger'
  }
  return types[status || ''] || 'info'
}

const getAfterSaleStatusText = (status?: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    resolved: '已解决',
    rejected: '已拒绝'
  }
  return texts[status || ''] || status || ''
}

onMounted(() => {
  fetchRequirements()
})
</script>

<style scoped>
.my-requirements-page {
  padding: 20px;
}

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

.chat-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chat-message.self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.message-avatar.applicant {
  background: #409eff;
}

.message-avatar.developer {
  background: #67c23a;
}

.message-avatar.admin {
  background: #e6a23c;
}

.message-body {
  max-width: 60%;
  margin: 0 10px;
}

.chat-message.self .message-body {
  text-align: right;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 12px;
}

.chat-message.self .message-info {
  flex-direction: row-reverse;
}

.sender-name {
  font-weight: 600;
  color: #303133;
}

.sender-type {
  color: #909399;
  font-size: 11px;
}

.message-time {
  color: #c0c4cc;
}

.message-bubble {
  display: inline-block;
  text-align: left;
}

.chat-message.self .message-bubble {
  text-align: right;
}

.bubble-content {
  background: #fff;
  padding: 10px 14px;
  border-radius: 4px;
  position: relative;
  word-break: break-word;
  line-height: 1.5;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-message.self .bubble-content {
  background: #95ec69;
}

.bubble-content::before {
  content: '';
  position: absolute;
  top: 10px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.chat-message:not(.self) .bubble-content::before {
  left: -10px;
  border-right-color: #fff;
}

.chat-message.self .bubble-content::before {
  right: -10px;
  border-left-color: #95ec69;
}

.no-messages {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.chat-input .el-textarea {
  flex: 1;
}

.admin-decision {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
