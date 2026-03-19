<template>
  <div class="api-test-page">
    <div class="back-link">
      <el-button text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
    </div>
    
    <div class="test-content">
      <div class="test-form card">
        <div class="api-header-section">
          <h2 class="api-title">{{ api.name || 'API测试' }}</h2>
          <div class="api-info">
            <el-tag type="primary">{{ api.typeName }}</el-tag>
            <span class="api-method">{{ api.method }}</span>
            <code>{{ api.endpoint }}</code>
          </div>
        </div>
        
        <el-form :model="testForm" label-width="100px">
          <el-form-item
            v-for="param in api.requestParams"
            :key="param.name"
            :label="param.name"
            :required="param.required"
          >
            <el-input
              v-model="testForm.params[param.name]"
              :placeholder="param.example || param.description"
            />
            <div class="param-desc">{{ param.description }}</div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="testing" @click="handleTest">
              <el-icon><VideoPlay /></el-icon> 发送请求
            </el-button>
            <el-button @click="saveTestRecord" :disabled="!testResult">
              <el-icon><Document /></el-icon> 保存记录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="test-result card">
        <div class="result-header">
          <h3>响应结果</h3>
          <el-tag v-if="testResult" :type="testResult.success ? 'success' : 'danger'">
            {{ testResult.success ? '成功' : '失败' }}
          </el-tag>
        </div>
        
        <div v-if="testResult" class="result-content">
          <div class="result-stats">
            <span>响应时间: {{ testResult.responseTime }}ms</span>
            <span>状态码: {{ testResult.statusCode }}</span>
          </div>
          <div class="result-body">
            <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>
        <el-empty v-else description="请先发送测试请求" />
      </div>
    </div>
    
    <div class="response-example card" v-if="api.responseParams && api.responseParams.length > 0">
      <h3 class="section-title">返回参数示例</h3>
      <el-table :data="api.responseParams" border>
        <el-table-column prop="name" label="字段名" width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="example" label="示例值" width="150" />
      </el-table>
      <div class="example-json" v-if="responseExample">
        <h4>示例JSON</h4>
        <pre>{{ responseExample }}</pre>
      </div>
    </div>
    
    <div class="test-records card" v-if="records.length > 0">
      <h3 class="section-title">测试记录 ({{ records.length }}/5)</h3>
      <el-table :data="records" border>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column prop="params" label="参数">
          <template #default="{ row }">
            <code>{{ JSON.stringify(row.params) }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="success" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" size="small">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="loadRecord(row)">加载</el-button>
            <el-button text type="danger" @click="handleDeleteRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="selectRecordDialogVisible" title="测试记录已满" width="500px">
      <p>您已保存5条测试记录，请选择一条记录删除后再保存新记录。</p>
      <el-table :data="records" border max-height="300">
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column prop="params" label="参数">
          <template #default="{ row }">
            <code>{{ JSON.stringify(row.params) }}</code>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button text type="danger" @click="deleteAndSave(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="selectRecordDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, VideoPlay, Document } from '@element-plus/icons-vue'
import { testApi } from '@/api/test'
import { apiManagement } from '@/api/api'
import type { ApiItem } from '@/types/api'
import type { TestRecord } from '@/types/test'
import { getMethodType } from '@/utils/status'

const MAX_RECORDS = 5

const router = useRouter()
const route = useRoute()

const testing = ref(false)
const testResult = ref<any>(null)
const records = ref<TestRecord[]>([])
const selectRecordDialogVisible = ref(false)

const api = ref<ApiItem>({
  id: 0,
  name: '',
  description: '',
  typeName: '',
  typeId: 0,
  userId: 0,
  username: '',
  method: 'GET',
  endpoint: '',
  requestParams: [],
  responseParams: [],
  price: 0,
  priceUnit: 'per_call',
  callLimit: 0,
  status: 'approved',
  createTime: '',
  updateTime: '',
  docUrl: '',
  rating: 0,
  invokeCount: 0,
  successCount: 0,
  failCount: 0
})

const testForm = reactive({
  params: {} as Record<string, any>
})

const fetchApiDetail = async () => {
  const id = route.params.id as string
  try {
    const res = await apiManagement.getDetail(id)
    api.value = res.data
    fetchRecords()
  } catch (error) {
    console.error('获取API详情失败:', error)
    api.value = {
      id: 1,
      name: '天气查询API',
      description: '支持全国城市天气查询',
      typeName: '数据查询',
      typeId: 1,
      userId: 1,
      username: 'developer1',
      method: 'GET',
      endpoint: '/weather/query',
      requestParams: [
        { name: 'city', type: 'string', required: true, description: '城市名称', example: '北京' },
        { name: 'type', type: 'string', required: false, description: '查询类型', example: 'now' }
      ],
      responseParams: [],
      price: 0.01,
      priceUnit: 'per_call',
      callLimit: 1000,
      status: 'approved',
      createTime: '2024-01-01',
      updateTime: '2024-01-01',
      docUrl: '',
      rating: 4.8,
      invokeCount: 125680,
      successCount: 125000,
      failCount: 680
    }
  }
}

const handleTest = async () => {
  testing.value = true
  try {
    const res = await testApi.testCall({
      apiId: api.value.id,
      params: testForm.params
    })
    testResult.value = {
      success: res.data.success,
      data: res.data.result,
      responseTime: res.data.responseTime,
      statusCode: res.data.statusCode
    }
    ElMessage.success('测试成功')
  } catch (error) {
    console.error('测试失败:', error)
    testResult.value = {
      success: false,
      data: null,
      responseTime: 0,
      statusCode: 500
    }
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}

const saveTestRecord = async () => {
  if (!testResult.value) return
  
  try {
    const countRes = await testApi.getRecordCount(api.value.id)
    const count = countRes.data
    
    if (count >= MAX_RECORDS) {
      selectRecordDialogVisible.value = true
      return
    }
    
    await doSaveRecord()
  } catch (error) {
    console.error('检查记录数量失败:', error)
    ElMessage.error('保存失败')
  }
}

const doSaveRecord = async () => {
  try {
    await testApi.saveRecord({
      id: 0,
      apiId: api.value.id,
      apiName: api.value.name,
      userId: 0,
      params: testForm.params,
      result: testResult.value.data,
      success: testResult.value.success,
      responseTime: testResult.value.responseTime,
      statusCode: testResult.value.statusCode,
      createTime: new Date().toISOString()
    })
    ElMessage.success('保存成功')
    fetchRecords()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const deleteAndSave = async (record: TestRecord) => {
  try {
    await testApi.deleteRecord(record.id)
    ElMessage.success('删除成功')
    selectRecordDialogVisible.value = false
    await doSaveRecord()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleDeleteRecord = async (record: TestRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除该测试记录吗？', '提示', {
      type: 'warning'
    })
    await testApi.deleteRecord(record.id)
    ElMessage.success('删除成功')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const loadRecord = (record: TestRecord) => {
  testForm.params = { ...record.params }
  testResult.value = {
    success: record.success,
    data: record.result,
    responseTime: record.responseTime || 0,
    statusCode: record.statusCode || 200
  }
}

const fetchRecords = async () => {
  try {
    const res = await testApi.getRecords(api.value.id)
    records.value = res.data || []
  } catch (error) {
    console.error('获取记录失败:', error)
    records.value = []
  }
}

const responseExample = computed(() => {
  if (!api.value.responseParams || api.value.responseParams.length === 0) {
    return null
  }
  const example: Record<string, any> = {}
  api.value.responseParams.forEach(param => {
    example[param.name] = param.example || getDefaultExample(param.type)
  })
  return JSON.stringify({ code: 200, message: 'success', data: example }, null, 2)
})

const getDefaultExample = (type: string) => {
  switch (type.toLowerCase()) {
    case 'string': return '示例字符串'
    case 'number':
    case 'integer': return 0
    case 'boolean': return true
    case 'array': return []
    case 'object': return {}
    default: return null
  }
}

onMounted(() => {
  fetchApiDetail()
})
</script>

<style scoped>
.api-test-page {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 16px;
}

.test-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.api-header-section {
  margin-bottom: 20px;
}

.api-title {
  font-size: 22px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
}

.api-method {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #F1F5F9;
  border-radius: 8px;
}

.api-info code {
  color: #1E40AF;
}

.param-desc {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
}

.result-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #64748B;
}

.result-body {
  background: #1E293B;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.result-body pre {
  margin: 0;
  color: #E2E8F0;
  font-size: 13px;
  line-height: 1.6;
}

.test-records {
  margin-top: 24px;
}

.response-example {
  margin-bottom: 24px;
}

.response-example .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 16px;
}

.example-json {
  margin-top: 16px;
}

.example-json h4 {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.example-json pre {
  background: #1E293B;
  border-radius: 8px;
  padding: 16px;
  margin: 0;
  color: #E2E8F0;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .test-content {
    grid-template-columns: 1fr;
  }
}
</style>
