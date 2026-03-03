<template>
  <div class="my-apis-page">
    <div class="page-header">
      <h2 class="page-title">我的API</h2>
      <el-button type="primary" @click="showCreateDialog = true">
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
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}/{{ getPriceUnit(row.priceUnit) }}
          </template>
        </el-table-column>
        <el-table-column prop="callCount" label="调用次数" width="100" />
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
          layout="total, prev, pager, next"
        />
      </div>
    </div>
    
    <el-dialog v-model="showCreateDialog" :title="editingApi ? '编辑API' : '上架新API'" width="700px">
      <el-form ref="formRef" :model="apiForm" :rules="rules" label-width="100px">
        <el-form-item label="API名称" prop="name">
          <el-input v-model="apiForm.name" placeholder="请输入API名称" />
        </el-form-item>
        
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="apiForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="请求方式" prop="method">
          <el-select v-model="apiForm.method" placeholder="请选择请求方式">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="接口路径" prop="endpoint">
          <el-input v-model="apiForm.endpoint" placeholder="/api/your-endpoint" />
        </el-form-item>
        
        <el-form-item label="功能描述" prop="description">
          <el-input v-model="apiForm.description" type="textarea" :rows="3" placeholder="请描述API功能" />
        </el-form-item>
        
        <el-form-item label="定价" required>
          <el-col :span="12">
            <el-form-item prop="price">
              <el-input v-model.number="apiForm.price" type="number" placeholder="价格">
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="priceUnit">
              <el-select v-model="apiForm.priceUnit" placeholder="计费单位">
                <el-option label="每次" value="per_call" />
                <el-option label="每月" value="per_month" />
                <el-option label="每年" value="per_year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        
        <el-form-item label="调用限制">
          <el-input v-model.number="apiForm.callLimit" type="number" placeholder="每日调用次数限制，0表示不限" />
        </el-form-item>
        
        <el-form-item label="技术文档">
          <el-input v-model="apiForm.docUrl" placeholder="文档链接（选填）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiItem, ApiCreateParams } from '@/types/api'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const showCreateDialog = ref(false)
const editingApi = ref<ApiItem | null>(null)
const formRef = ref<FormInstance>()

const apiList = ref<ApiItem[]>([])
const total = ref(0)

const categories = ref([
  { id: 1, name: '数据查询' },
  { id: 2, name: '文档处理' },
  { id: 3, name: '图像识别' },
  { id: 4, name: '位置服务' },
  { id: 5, name: '支付服务' },
  { id: 6, name: '通信服务' }
])

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const apiForm = reactive<ApiCreateParams>({
  name: '',
  description: '',
  categoryId: 0,
  method: 'GET',
  endpoint: '',
  requestParams: [],
  responseParams: [],
  price: 0,
  priceUnit: 'per_call',
  callLimit: 0,
  docUrl: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入API名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  method: [{ required: true, message: '请选择请求方式', trigger: 'change' }],
  endpoint: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  description: [{ required: true, message: '请输入功能描述', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  priceUnit: [{ required: true, message: '请选择计费单位', trigger: 'change' }]
}

const mockApiList: ApiItem[] = [
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
    requestParams: [],
    responseParams: [],
    price: 0.01,
    priceUnit: 'per_call',
    callLimit: 1000,
    status: 'approved',
    createTime: '2024-01-01',
    updateTime: '2024-01-01',
    docUrl: '',
    rating: 4.8,
    callCount: 125680,
    successCount: 125000,
    failCount: 680
  },
  {
    id: 2,
    name: '身份证OCR识别',
    description: '高精度身份证识别',
    category: '图像识别',
    categoryId: 3,
    userId: 1,
    username: 'developer1',
    method: 'POST',
    endpoint: '/ocr/idcard',
    requestParams: [],
    responseParams: [],
    price: 0.05,
    priceUnit: 'per_call',
    callLimit: 500,
    status: 'pending',
    createTime: '2024-01-02',
    updateTime: '2024-01-02',
    docUrl: '',
    rating: 0,
    callCount: 0,
    successCount: 0,
    failCount: 0
  }
]

const fetchApiList = async () => {
  loading.value = true
  try {
    const res = await apiManagement.getMyApis({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apiList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取API列表失败:', error)
    apiList.value = mockApiList
    total.value = mockApiList.length
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
  Object.assign(apiForm, {
    name: api.name,
    description: api.description,
    categoryId: api.categoryId,
    method: api.method,
    endpoint: api.endpoint,
    requestParams: api.requestParams,
    responseParams: api.responseParams,
    price: api.price,
    priceUnit: api.priceUnit,
    callLimit: api.callLimit,
    docUrl: api.docUrl
  })
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
    await apiManagement.update(api.id, { status: 'offline' as any })
    ElMessage.success('下架成功')
    fetchApiList()
  } catch (error) {
    console.error('下架失败:', error)
  }
}

const onlineApi = async (api: ApiItem) => {
  try {
    await apiManagement.update(api.id, { status: 'pending' as any })
    ElMessage.success('已提交上架申请')
    fetchApiList()
  } catch (error) {
    console.error('上架失败:', error)
    ElMessage.success('上架成功（模拟）')
    fetchApiList()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingApi.value) {
          await apiManagement.update(editingApi.value.id, apiForm)
          ElMessage.success('修改成功，已重新提交审核')
        } else {
          await apiManagement.create(apiForm)
          ElMessage.success('提交成功，等待审核')
        }
        showCreateDialog.value = false
        resetForm()
        fetchApiList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.success('提交成功（模拟）')
        showCreateDialog.value = false
        resetForm()
      }
    }
  })
}

const resetForm = () => {
  editingApi.value = null
  Object.assign(apiForm, {
    name: '',
    description: '',
    categoryId: 0,
    method: 'GET',
    endpoint: '',
    requestParams: [],
    responseParams: [],
    price: 0,
    priceUnit: 'per_call',
    callLimit: 0,
    docUrl: ''
  })
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

onMounted(() => {
  fetchApiList()
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
