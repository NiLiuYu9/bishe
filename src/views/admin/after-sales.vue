<template>
  <div class="after-sale-management">
    <div class="page-header">
      <h2>售后管理</h2>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="fetchAfterSales">
        <el-option label="全部" value="" />
        <el-option label="待处理" value="pending" />
        <el-option label="已解决" value="resolved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
    </div>

    <el-table :data="afterSaleList" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="requirementTitle" label="需求标题" min-width="150" />
      <el-table-column prop="applicantName" label="申请人" width="120" />
      <el-table-column prop="developerName" label="开发者" width="120" />
      <el-table-column prop="reason" label="售后原因" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" type="after_sale" />
        </template>
      </el-table-column>
      <el-table-column prop="result" label="处理结果" width="100">
        <template #default="{ row }">
          <span v-if="row.result">{{ row.result === 'completed' ? '项目完成' : '已退款' }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" @click="viewDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchAfterSales"
        @current-change="fetchAfterSales"
      />
    </div>

    <el-dialog v-model="showDetailDialog" title="售后详情" width="700px">
      <el-descriptions :column="1" border style="margin-bottom: 16px;">
        <el-descriptions-item label="需求标题">{{ currentAfterSale?.requirementTitle }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentAfterSale?.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="开发者">{{ currentAfterSale?.developerName }}</el-descriptions-item>
        <el-descriptions-item label="售后原因">{{ currentAfterSale?.reason }}</el-descriptions-item>
        <el-descriptions-item label="未实现功能">{{ currentAfterSale?.unimplementedFeatures || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="currentAfterSale?.status || ''" type="after_sale" />
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
            @keyup.enter.ctrl="sendMessage"
          />
          <el-button type="primary" @click="sendMessage" :loading="sendingMessage">
            发送
          </el-button>
        </div>
      </div>

      <div v-if="currentAfterSale?.status === 'pending'" class="admin-decision">
        <el-divider>管理员裁定</el-divider>
        <el-form :model="decisionForm" label-width="80px">
          <el-form-item label="裁定结果">
            <el-radio-group v-model="decisionForm.decision">
              <el-radio label="resolved">解决</el-radio>
              <el-radio label="rejected">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="decisionForm.decision === 'resolved'" label="处理结果">
            <el-radio-group v-model="decisionForm.result">
              <el-radio label="completed">项目完成</el-radio>
              <el-radio label="refunded">退款</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitDecision" :loading="submittingDecision">
              提交裁定
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { afterSaleApi, type AfterSale, type AfterSaleMessage } from '@/api/afterSale'
import { useUserStore } from '@/stores/user'
import StatusTag from '@/components/StatusTag.vue'

const loading = ref(false)
const afterSaleList = ref<AfterSale[]>([])
const total = ref(0)
const filterStatus = ref('')

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const showDetailDialog = ref(false)
const currentAfterSale = ref<AfterSale | null>(null)
const afterSaleMessages = ref<AfterSaleMessage[]>([])
const newMessage = ref('')
const sendingMessage = ref(false)
const submittingDecision = ref(false)
const chatMessagesRef = ref<HTMLElement | null>(null)

const userStore = useUserStore()

const decisionForm = reactive({
  decision: 'resolved',
  result: 'completed'
})

const fetchAfterSales = async () => {
  loading.value = true
  try {
    const res = await afterSaleApi.getList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: filterStatus.value || undefined
    })
    afterSaleList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取售后列表失败:', error)
    ElMessage.error('获取售后列表失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = async (row: AfterSale) => {
  currentAfterSale.value = row
  decisionForm.decision = 'resolved'
  decisionForm.result = 'completed'
  showDetailDialog.value = true
  await loadMessages(row.id)
}

const loadMessages = async (afterSaleId: number) => {
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

const sendMessage = async () => {
  if (!currentAfterSale.value || !newMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  sendingMessage.value = true
  try {
    await afterSaleApi.sendMessage(currentAfterSale.value.id, newMessage.value.trim())
    newMessage.value = ''
    await loadMessages(currentAfterSale.value.id)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sendingMessage.value = false
  }
}

const submitDecision = async () => {
  if (!currentAfterSale.value) return
  
  if (decisionForm.decision === 'resolved' && !decisionForm.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  
  submittingDecision.value = true
  try {
    await afterSaleApi.decide(currentAfterSale.value.id, {
      adminDecision: decisionForm.decision,
      result: decisionForm.decision === 'resolved' ? decisionForm.result : undefined
    })
    ElMessage.success('裁定成功')
    showDetailDialog.value = false
    fetchAfterSales()
  } catch (error) {
    console.error('裁定失败:', error)
    ElMessage.error('裁定失败')
  } finally {
    submittingDecision.value = false
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

onMounted(() => {
  fetchAfterSales()
})
</script>

<style scoped>
.after-sale-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-bar {
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
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
