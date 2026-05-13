<!--
  =====================================================
  参数表格组件 ParamTable —— 相当于后端的参数说明表格
  =====================================================
  
  【核心概念】以表格形式展示API的请求参数和响应参数
  显示参数名、类型、是否必填、描述、示例值
  
  【后端类比】相当于后端的参数说明表格，类似 Swagger 的参数列表展示
  
  【Vue 组件核心概念（给后端开发者）】
    - props（:params）—— 参数数组，相当于后端的方法参数
    - props（:title）—— 表格标题（"请求参数"或"响应参数"）
-->
<template>
  <div class="param-table">
    <h4 v-if="title" class="table-title">{{ title }}</h4>
    <el-table :data="params" border :size="size">
      <el-table-column prop="name" label="参数名" width="150" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="required" label="必填" width="80">
        <template #default="{ row }">
          <el-tag :type="row.required ? 'danger' : 'info'" size="small">
            {{ row.required ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" />
      <el-table-column prop="example" label="示例" width="150" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
export interface Param {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

interface Props {
  params: Param[]
  title?: string
  size?: 'small' | 'default'
}

withDefaults(defineProps<Props>(), {
  title: '',
  size: 'default'
})
</script>

<style scoped>
.param-table {
  width: 100%;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
}
</style>
