<!--
  =====================================================
  指标选择器组件 IndicatorSelector —— 相当于后端的下拉选择框
  =====================================================
  
  【核心概念】选择要查看的统计指标（如调用次数、成功率、收入等）
  
  【后端类比】相当于后端的下拉选择框，类似 <select> 标签
  
  【Vue 组件核心概念（给后端开发者）】
    - v-model（modelValue）—— 双向绑定选中的指标，相当于后端的表单字段绑定
    - emit（@update:modelValue）—— 指标变化事件，相当于后端的回调函数
-->
<template>
  <div class="indicator-selector">
    <span class="selector-label">展示指标：</span>
    <el-checkbox-group v-model="selectedIndicators" @change="handleChange">
      <el-checkbox 
        v-for="indicator in indicators" 
        :key="indicator.value" 
        :label="indicator.value"
      >
        {{ indicator.label }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Indicator {
  label: string
  value: string
}

interface Props {
  modelValue: string[]
  indicators: Indicator[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const selectedIndicators = ref<string[]>([...props.modelValue])

const handleChange = (value: string[]) => {
  emit('update:modelValue', value)
}

watch(() => props.modelValue, (newVal) => {
  selectedIndicators.value = [...newVal]
}, { immediate: true })
</script>

<style scoped>
.indicator-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.selector-label {
  font-size: 14px;
  color: #64748B;
  white-space: nowrap;
}
</style>
