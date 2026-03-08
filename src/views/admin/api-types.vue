<template>
  <div class="admin-api-types-page">
    <div class="page-header">
      <h2 class="page-title">API分类管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 新增分类
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="启用" name="active" />
      <el-tab-pane label="禁用" name="inactive" />
    </el-tabs>
    
    <div class="api-types-table card">
      <el-table :data="apiTypes" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editApiType(row)">编辑</el-button>
            <el-button v-if="row.status === 'active'" text type="warning" @click="disableApiType(row)">禁用</el-button>
            <el-button v-if="row.status === 'inactive'" text type="success" @click="enableApiType(row)">启用</el-button>
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
    
    <el-dialog v-model="showCreateDialog" :title="editingApiType ? '编辑分类' : '新增分类'" width="400px">
      <el-form ref="formRef" :model="apiTypeForm" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="apiTypeForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="apiTypeForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import type { ApiType } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const showCreateDialog = ref(false)
const editingApiType = ref<ApiType | null>(null)
const formRef = ref<FormInstance>()
const activeTab = ref('all')

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const total = ref(0)

const apiTypes = ref<ApiType[]>([])

const apiTypeForm = reactive({
  name: '',
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入分类描述', trigger: 'blur' }]
}

const fetchApiTypes = async () => {
  loading.value = true
  try {
    const res = await adminApi.getApiTypes({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apiTypes.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取分类失败:', error)
    apiTypes.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchApiTypes()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchApiTypes()
}

const handleCurrentChange = () => {
  fetchApiTypes()
}

const editApiType = (apiType: ApiType) => {
  editingApiType.value = apiType
  apiTypeForm.name = apiType.name
  apiTypeForm.description = apiType.description
  showCreateDialog.value = true
}

const disableApiType = async (apiType: ApiType) => {
  try {
    await adminApi.updateApiTypeStatus(apiType.id, { status: 'inactive' })
    ElMessage.success('已禁用')
    fetchApiTypes()
  } catch (error) {
    console.error('禁用失败:', error)
    ElMessage.error('禁用失败')
  }
}

const enableApiType = async (apiType: ApiType) => {
  try {
    await adminApi.updateApiTypeStatus(apiType.id, { status: 'active' })
    ElMessage.success('已启用')
    fetchApiTypes()
  } catch (error) {
    console.error('启用失败:', error)
    ElMessage.error('启用失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingApiType.value) {
          await adminApi.updateApiType(editingApiType.value.id, apiTypeForm)
          ElMessage.success('修改成功')
        } else {
          await adminApi.createApiType(apiTypeForm)
          ElMessage.success('创建成功')
        }
        showCreateDialog.value = false
        resetForm()
        fetchApiTypes()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

const resetForm = () => {
  editingApiType.value = null
  apiTypeForm.name = ''
  apiTypeForm.description = ''
}

onMounted(() => {
  fetchApiTypes()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
