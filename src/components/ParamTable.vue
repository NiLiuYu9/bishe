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
