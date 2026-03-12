<template>
  <el-dialog v-model="visible" :title="editingApi ? '编辑API' : '上架新API'" width="900px" @closed="handleClose">
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交审核</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiItem, ApiType, ApiCreateParams, ApiParam } from '@/types/api'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  editingApi?: ApiItem | null
  types: ApiType[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()

const getEmptyForm = (): ApiCreateParams => ({
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

const apiForm = reactive<ApiCreateParams>(getEmptyForm())

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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (props.editingApi) {
          await apiManagement.update(props.editingApi.id, apiForm)
          ElMessage.success('修改成功，已重新提交审核')
        } else {
          await apiManagement.create(apiForm)
          ElMessage.success('提交成功，等待审核')
        }
        visible.value = false
        emit('success')
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请重试')
      }
    }
  })
}

const resetForm = () => {
  Object.assign(apiForm, getEmptyForm())
}

const handleClose = () => {
  resetForm()
}

watch(() => props.modelValue, (val) => {
  if (val && props.editingApi) {
    Object.assign(apiForm, {
      name: props.editingApi.name,
      description: props.editingApi.description,
      typeId: props.editingApi.typeId,
      method: props.editingApi.method,
      endpoint: props.editingApi.endpoint,
      requestParams: props.editingApi.requestParams ? [...props.editingApi.requestParams] : [],
      responseParams: props.editingApi.responseParams ? [...props.editingApi.responseParams] : [],
      price: props.editingApi.price,
      priceUnit: props.editingApi.priceUnit,
      callLimit: props.editingApi.callLimit,
      docUrl: props.editingApi.docUrl
    })
  } else if (val) {
    resetForm()
  }
})
</script>

<style scoped>
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
