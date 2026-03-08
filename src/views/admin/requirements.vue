<template>
  <div class="admin-requirements-page">
    <div class="page-header">
      <h2 class="page-title">需求管理</h2>
    </div>
    
    <div class="filter-section card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索需求标题/描述" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="开放中" value="open" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="requirements-table card">
      <el-table :data="requirements" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="需求标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="需求描述" min-width="200">
          <template #default="{ row }">
            <div class="description-cell">
              <span v-if="!row._expanded" class="description-text">{{ row.description }}</span>
              <span v-else>{{ row.description }}</span>
              <el-button 
                v-if="row.description && row.description.length > 50" 
                text 
                type="primary" 
                size="small"
                @click="row._expanded = !row._expanded"
              >
                {{ row._expanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="发布者" width="120" />
        <el-table-column prop="budget" label="预算" width="100">
          <template #default="{ row }">
            ¥{{ row.budget }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="160">
          <template #default="{ row }">
            {{ row.deadline ? formatDate(row.deadline) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button text type="primary">
                修改状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="open" :disabled="row.status === 'open'">
                    <el-icon><CircleCheck /></el-icon>设为开放中
                  </el-dropdown-item>
                  <el-dropdown-item command="in_progress" :disabled="row.status === 'in_progress'">
                    <el-icon><Loading /></el-icon>设为进行中
                  </el-dropdown-item>
                  <el-dropdown-item command="completed" :disabled="row.status === 'completed'">
                    <el-icon><Select /></el-icon>设为已完成
                  </el-dropdown-item>
                  <el-dropdown-item command="cancelled" :disabled="row.status === 'cancelled'" divided>
                    <el-icon><CircleClose /></el-icon>设为已取消
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button text type="primary" @click="viewDetail(row)">查看申请</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <el-dialog v-model="detailDialogVisible" title="申请者列表" width="700px">
      <div v-if="currentRequirement">
        <div class="requirement-info">
          <h4>{{ currentRequirement.title }}</h4>
          <p>{{ currentRequirement.description }}</p>
        </div>
        
        <el-table :data="currentRequirement.applicants" size="small" border v-if="currentRequirement.applicants?.length">
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="description" label="申请说明" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getApplicantStatusType(row.status)" size="small">
                {{ getApplicantStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyTime" label="申请时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.applyTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无申请者" />
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, CircleCheck, Loading, Select, CircleClose } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import type { Requirement } from '@/types'

interface RequirementRow extends Requirement {
  _expanded?: boolean
}

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentRequirement = ref<Requirement | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const total = ref(0)

const requirements = ref<RequirementRow[]>([])

const filters = reactive({
  keyword: '',
  status: ''
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    open: 'success',
    in_progress: 'warning',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    open: '开放中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getApplicantStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getApplicantStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    accepted: '已选中',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const fetchRequirements = async () => {
  loading.value = true
  try {
    const res = await adminApi.getRequirements({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined
    })
    requirements.value = res.data.list.map((item: Requirement) => ({
      ...item,
      _expanded: false
    }))
    total.value = res.data.total
  } catch (error) {
    console.error('获取需求列表失败:', error)
    requirements.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRequirements()
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = ''
  pagination.page = 1
  fetchRequirements()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchRequirements()
}

const handleCurrentChange = () => {
  fetchRequirements()
}

const viewDetail = async (requirement: Requirement) => {
  try {
    const res = await adminApi.getRequirementDetail(requirement.id)
    currentRequirement.value = res.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取需求详情失败:', error)
    ElMessage.error('获取需求详情失败')
  }
}

const handleCommand = async (command: string, requirement: Requirement) => {
  const statusText = getStatusText(command)
  try {
    await ElMessageBox.confirm(
      `确定将需求「${requirement.title}」状态修改为「${statusText}」吗？`,
      '修改状态',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await adminApi.updateRequirementStatus(requirement.id, { status: command })
    ElMessage.success('状态修改成功')
    fetchRequirements()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改状态失败:', error)
      ElMessage.error('修改状态失败')
    }
  }
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

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.requirements-table {
  padding: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.description-cell {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.requirement-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.requirement-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.requirement-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
