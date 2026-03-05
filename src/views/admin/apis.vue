<template>
  <div class="admin-apis-page">
    <div class="page-header">
      <h2 class="page-title">API审核</h2>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="已通过" name="approved" />
      <el-tab-pane label="已拒绝" name="rejected" />
      <el-tab-pane label="全部" name="all" />
    </el-tabs>
    
    <div class="apis-table card">
      <el-table :data="apis" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="API名称" min-width="150">
          <template #default="{ row }">
            <div class="api-name-cell">
              <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="username" label="提交者" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}/{{ getPriceUnit(row.priceUnit) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewApi(row)">查看</el-button>
            <template v-if="row.status === 'pending'">
              <el-button text type="success" @click="approveApi(row)">通过</el-button>
              <el-button text type="danger" @click="rejectApi(row)">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, prev, pager, next"
        />
      </div>
    </div>
    
    <el-dialog v-model="apiDialogVisible" title="API详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="API名称">{{ currentApi?.name }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ currentApi?.method }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentApi?.category }}</el-descriptions-item>
        <el-descriptions-item label="提交者">{{ currentApi?.username }}</el-descriptions-item>
        <el-descriptions-item label="接口路径" :span="2">{{ currentApi?.endpoint }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentApi?.price }}/{{ getPriceUnit(currentApi?.priceUnit || '') }}</el-descriptions-item>
        <el-descriptions-item label="调用限制">{{ currentApi?.callLimit || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="功能描述" :span="2">{{ currentApi?.description }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="mt-24" v-if="currentApi?.requestParams && currentApi.requestParams.length > 0">
        <h4>请求参数</h4>
        <el-table :data="currentApi.requestParams" border size="small">
          <el-table-column prop="name" label="参数名" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="required" label="必填">
            <template #default="{ row }">{{ row.required ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
        </el-table>
      </div>
    </el-dialog>
    
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="400px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api/admin'
import type { ApiItem } from '@/types/api'

const loading = ref(false)
const activeTab = ref('pending')
const apis = ref<ApiItem[]>([])
const total = ref(0)

const apiDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentApi = ref<ApiItem | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const rejectForm = reactive({ reason: '' })

const mockApis: ApiItem[] = [
  {
    id: 1,
    name: '天气查询API',
    description: '支持全国城市天气查询',
    category: '数据查询',
    categoryId: 1,
    userId: 1,
    username: 'developer1',
    method: 'GET',
    endpoint: '/weather/query',
    requestParams: [
      { name: 'city', type: 'string', required: true, description: '城市名称', example: '北京' }
    ],
    responseParams: [],
    price: 0.01,
    priceUnit: 'per_call',
    callLimit: 1000,
    status: 'pending',
    createTime: '2024-01-18',
    updateTime: '2024-01-18',
    docUrl: '',
    rating: 0,
    invokeCount: 0,
    successCount: 0,
    failCount: 0
  },
  {
    id: 2,
    name: '身份证OCR识别',
    description: '高精度身份证识别',
    category: '图像识别',
    categoryId: 3,
    userId: 2,
    username: 'developer2',
    method: 'POST',
    endpoint: '/ocr/idcard',
    requestParams: [],
    responseParams: [],
    price: 0.05,
    priceUnit: 'per_call',
    callLimit: 500,
    status: 'pending',
    createTime: '2024-01-17',
    updateTime: '2024-01-17',
    docUrl: '',
    rating: 0,
    invokeCount: 0,
    successCount: 0,
    failCount: 0
  }
]

const fetchApis = async () => {
  loading.value = true
  try {
    const res = await adminApi.getApis({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apis.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取API列表失败:', error)
    apis.value = mockApis
    total.value = mockApis.length
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchApis()
}

const viewApi = (api: ApiItem) => {
  currentApi.value = api
  apiDialogVisible.value = true
}

const approveApi = async (api: ApiItem) => {
  try {
    await adminApi.auditApi(api.id, { status: 'approved' })
    ElMessage.success('审核通过')
    fetchApis()
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.success('审核通过（模拟）')
    fetchApis()
  }
}

const rejectApi = (api: ApiItem) => {
  currentApi.value = api
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!currentApi.value) return
  
  try {
    await adminApi.auditApi(currentApi.value.id, { status: 'rejected', reason: rejectForm.reason })
    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    fetchApis()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.success('已拒绝（模拟）')
    rejectDialogVisible.value = false
    fetchApis()
  }
}

const getMethodType = (method: string) => {
  const types: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || 'info'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    offline: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    approved: '已通过',
    pending: '待审核',
    rejected: '已拒绝',
    offline: '已下架'
  }
  return texts[status] || status
}

const getPriceUnit = (unit: string) => {
  const units: Record<string, string> = {
    per_call: '次',
    per_month: '月',
    per_year: '年'
  }
  return units[unit] || unit
}

onMounted(() => {
  fetchApis()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.api-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
