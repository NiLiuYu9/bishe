<template>
  <div class="my-apis-page">
    <div class="page-header">
      <h2 class="page-title">我的API</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> 上架新API
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="已上架" name="approved" />
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="已下架" name="offline" />
    </el-tabs>
    
    <div class="api-list" v-loading="loading">
      <el-table :data="apiList" border>
        <el-table-column prop="name" label="API名称" min-width="150">
          <template #default="{ row }">
            <div class="api-name-cell">
              <el-tag :type="getMethodType(row.method)" size="small">{{ row.method }}</el-tag>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="类型" width="120" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}/{{ getPriceUnit(row.priceUnit) }}
          </template>
        </el-table-column>
        <el-table-column prop="invokeCount" label="调用次数" width="100" />
        <el-table-column prop="rating" label="评分" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editApi(row)">编辑</el-button>
            <el-button text type="primary" @click="viewStatistics(row)">统计</el-button>
            <el-button 
              v-if="row.status === 'approved'" 
              text 
              type="warning" 
              @click="offlineApi(row)"
            >
              下架
            </el-button>
            <el-button 
              v-if="row.status === 'offline'" 
              text 
              type="success" 
              @click="onlineApi(row)"
            >
              上架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchApiList"
          @size-change="fetchApiList"
        />
      </div>
    </div>
    
    <ApiCreateDialog 
      v-model="showCreateDialog" 
      :editing-api="editingApi" 
      :types="types" 
      @success="handleDialogSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiItem, ApiType } from '@/types/api'
import ApiCreateDialog from '@/components/ApiCreateDialog.vue'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const showCreateDialog = ref(false)
const editingApi = ref<ApiItem | null>(null)

const apiList = ref<ApiItem[]>([])
const total = ref(0)

const types = ref<ApiType[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const openCreateDialog = () => {
  editingApi.value = null
  showCreateDialog.value = true
}

const fetchApiList = async () => {
  loading.value = true
  try {
    const res = await apiManagement.getMyApis({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apiList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取API列表失败:', error)
    apiList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchApiList()
}

const editApi = (api: ApiItem) => {
  editingApi.value = api
  showCreateDialog.value = true
}

const viewStatistics = (api: ApiItem) => {
  router.push({ path: '/user/statistics', query: { apiId: api.id } })
}

const offlineApi = async (api: ApiItem) => {
  try {
    await ElMessageBox.confirm('确定要下架该API吗？下架后已购买的调用次数仍可正常使用。', '提示', {
      type: 'warning'
    })
    await apiManagement.updateStatus(api.id, { status: 'offline' })
    ElMessage.success('下架成功')
    fetchApiList()
  } catch (error) {
    console.error('下架失败:', error)
  }
}

const onlineApi = async (api: ApiItem) => {
  try {
    await apiManagement.updateStatus(api.id, { status: 'pending' })
    ElMessage.success('已提交上架申请')
    fetchApiList()
  } catch (error) {
    console.error('上架失败:', error)
  }
}

const handleDialogSuccess = () => {
  fetchApiList()
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
    approved: '已上架',
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

const fetchTypes = async () => {
  try {
    const res = await apiManagement.getTypes()
    types.value = res.data || []
  } catch (error) {
    console.error('获取类型列表失败:', error)
    types.value = []
  }
}

onMounted(() => {
  fetchApiList()
  fetchTypes()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
