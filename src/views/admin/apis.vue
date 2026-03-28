<template>
  <div class="admin-apis-page">
    <div class="page-header">
      <h2 class="page-title">API管理</h2>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="已通过" name="approved" />
      <el-tab-pane label="已拒绝" name="rejected" />
      <el-tab-pane label="已下架" name="offline" />
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
        <el-table-column prop="typeName" label="分类" width="120" />
        <el-table-column prop="username" label="提交者" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}/{{ getPriceUnit(row.priceUnit) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" type="api" />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewApi(row)">查看</el-button>
            <template v-if="row.status === 'pending'">
              <el-button text type="success" @click="approveApi(row)">通过</el-button>
              <el-button text type="danger" @click="rejectApi(row)">拒绝</el-button>
            </template>
            <el-button v-if="row.status === 'approved'" text type="warning" @click="offlineApi(row)">下架</el-button>
            <el-button v-if="row.status === 'offline'" text type="success" @click="onlineApi(row)">上架</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchApis"
          @size-change="fetchApis"
        />
      </div>
    </div>
    
    <el-dialog v-model="apiDialogVisible" title="API详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="API名称">{{ currentApi?.name }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ currentApi?.method }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentApi?.typeName }}</el-descriptions-item>
        <el-descriptions-item label="提交者">{{ currentApi?.username }}</el-descriptions-item>
        <el-descriptions-item label="接口路径" :span="2">{{ currentApi?.endpoint }}</el-descriptions-item>
        <el-descriptions-item label="价格">¥{{ currentApi?.price }}/{{ getPriceUnit(currentApi?.priceUnit || '') }}</el-descriptions-item>
        <el-descriptions-item label="调用限制">{{ currentApi?.callLimit || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="功能描述" :span="2">{{ currentApi?.description }}</el-descriptions-item>
        <el-descriptions-item label="技术文档" :span="2">
          <a v-if="currentApi?.docUrl" :href="currentApi.docUrl" target="_blank" rel="noopener noreferrer" class="doc-link">{{ currentApi.docUrl }}</a>
          <span v-else class="no-doc">未提供</span>
        </el-descriptions-item>
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
import { getMethodType, getStatusInfo, API_STATUS } from '@/utils/status'
import { getPriceUnit } from '@/utils/format'
import StatusTag from '@/components/StatusTag.vue'
import MethodTag from '@/components/MethodTag.vue'

const loading = ref(false)
const activeTab = ref('all')
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

const fetchApis = async () => {
  loading.value = true
  try {
    const res = await adminApi.getApis({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apis.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取API列表失败:', error)
    apis.value = []
    total.value = 0
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
    await adminApi.updateApiStatus(api.id, { status: 'approved' })
    ElMessage.success('审核通过')
    fetchApis()
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
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
    await adminApi.updateApiStatus(currentApi.value.id, { status: 'rejected', reason: rejectForm.reason })
    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    fetchApis()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const offlineApi = async (api: ApiItem) => {
  try {
    await adminApi.updateApiStatus(api.id, { status: 'offline' })
    ElMessage.success('已下架')
    fetchApis()
  } catch (error) {
    console.error('下架失败:', error)
    ElMessage.error('下架失败')
  }
}

const onlineApi = async (api: ApiItem) => {
  try {
    await adminApi.updateApiStatus(api.id, { status: 'approved' })
    ElMessage.success('已上架')
    fetchApis()
  } catch (error) {
    console.error('上架失败:', error)
    ElMessage.error('上架失败')
  }
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

.doc-link {
  color: #1E40AF;
  text-decoration: none;
  word-break: break-all;
}

.doc-link:hover {
  text-decoration: underline;
}

.no-doc {
  color: #9CA3AF;
}
</style>
