<template>
  <div class="admin-api-types-page">
    <div class="page-header">
      <h2 class="page-title">API分类管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon> 新增分类
      </el-button>
    </div>
    
    <div class="api-types-table card">
      <el-table :data="apiTypes" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="editApiType(row)">编辑</el-button>
            <el-button text type="danger" @click="deleteApiType(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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

const apiTypes = ref<ApiType[]>([
  { id: 1, name: '数据查询', description: '各类数据查询服务' },
  { id: 2, name: '文档处理', description: '文档转换、识别等服务' },
  { id: 3, name: '图像识别', description: '人脸识别、OCR等服务' },
  { id: 4, name: '位置服务', description: '地图、定位、导航服务' },
  { id: 5, name: '支付服务', description: '支付、转账、退款服务' },
  { id: 6, name: '通信服务', description: '短信、语音、邮件服务' }
])

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
    const res = await adminApi.getApiTypes()
    apiTypes.value = res.data
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
}

const editApiType = (apiType: ApiType) => {
  editingApiType.value = apiType
  apiTypeForm.name = apiType.name
  apiTypeForm.description = apiType.description
  showCreateDialog.value = true
}

const deleteApiType = async (apiType: ApiType) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', { type: 'warning' })
    await adminApi.deleteApiType(apiType.id)
    ElMessage.success('删除成功')
    fetchApiTypes()
  } catch (error) {
    console.error('删除失败:', error)
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
        ElMessage.success('操作成功（模拟）')
        showCreateDialog.value = false
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
</style>
