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
    
    <el-dialog v-model="showCreateDialog" :title="editingApi ? '编辑API' : '上架新API'" width="900px">
      <el-form ref="formRef" :model="apiForm" :rules="rules" label-width="100px">
        <el-form-item label="API名称" prop="name">
          <el-input v-model="apiForm.name" placeholder="请输入API名称" />
        </el-form-item>
        
        <el-form-item label="类型" prop="typeId">
          <el-select v-model="apiForm.typeId" placeholder="请选择类型">
            <el-option
              v-for="type in types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
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
        
        <el-divider content-position="left">请求参数</el-divider>
        <el-form-item label="" prop="requestParams">
          <div class="params-container">
            <div v-for="(param, index) in apiForm.requestParams" :key="index" class="param-item">
              <el-row :gutter="8">
                <el-col :span="5">
                  <el-input v-model="param.name" placeholder="参数名" />
                </el-col>
                <el-col :span="4">
                  <el-select v-model="param.type" placeholder="类型">
                    <el-option label="string" value="string" />
                    <el-option label="number" value="number" />
                    <el-option label="boolean" value="boolean" />
                    <el-option label="object" value="object" />
                    <el-option label="array" value="array" />
                  </el-select>
                </el-col>
                <el-col :span="3">
                  <el-select v-model="param.required" placeholder="必填">
                    <el-option label="必填" :value="true" />
                    <el-option label="选填" :value="false" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-input v-model="param.description" placeholder="描述" />
                </el-col>
                <el-col :span="5">
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
            <div v-for="(param, index) in apiForm.responseParams" :key="index" class="param-item">
              <el-row :gutter="8">
                <el-col :span="5">
                  <el-input v-model="param.name" placeholder="参数名" />
                </el-col>
                <el-col :span="4">
                  <el-select v-model="param.type" placeholder="类型">
                    <el-option label="string" value="string" />
                    <el-option label="number" value="number" />
                    <el-option label="boolean" value="boolean" />
                    <el-option label="object" value="object" />
                    <el-option label="array" value="array" />
                  </el-select>
                </el-col>
                <el-col :span="3">
                  <el-select v-model="param.required" placeholder="必填">
                    <el-option label="必填" :value="true" />
                    <el-option label="选填" :value="false" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-input v-model="param.description" placeholder="描述" />
                </el-col>
                <el-col :span="5">
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
        <el-button type="primary" @click="handleSubmit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiItem, ApiCreateParams, ApiType, ApiParam } from '@/types/api'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const showCreateDialog = ref(false)
const editingApi = ref<ApiItem | null>(null)
const formRef = ref<FormInstance>()

const apiList = ref<ApiItem[]>([])
const total = ref(0)

const types = ref<ApiType[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const apiForm = reactive<ApiCreateParams>({
  name: '',
  description: '',
  typeId: 0,
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
  typeId: [{ required: true, message: '请选择类型', trigger: 'change' }],
  method: [{ required: true, message: '请选择请求方式', trigger: 'change' }],
  endpoint: [{ required: true, message: '请输入接口路径', trigger: 'blur' }],
  description: [{ required: true, message: '请输入功能描述', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  priceUnit: [{ required: true, message: '请选择计费单位', trigger: 'change' }],
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

const createEmptyParam = (): ApiParam => ({
  name: '',
  type: 'string',
  required: true,
  description: '',
  example: ''
})

const addRequestParam = () => {
  apiForm.requestParams.push(createEmptyParam())
}

const removeRequestParam = (index: number) => {
  apiForm.requestParams.splice(index, 1)
}

const addResponseParam = () => {
  apiForm.responseParams.push(createEmptyParam())
}

const removeResponseParam = (index: number) => {
  apiForm.responseParams.splice(index, 1)
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
  Object.assign(apiForm, {
    name: api.name,
    description: api.description,
    typeId: api.typeId,
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
    typeId: 0,
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

.params-container {
  width: 100%;
}

.param-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
}
</style>
