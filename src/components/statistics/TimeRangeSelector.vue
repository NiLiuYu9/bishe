<template>
  <div class="time-range-selector">
    <el-select
      v-model="selectedRange"
      placeholder="选择时间范围"
      style="width: 140px;"
      @change="handleRangeChange"
    >
      <el-option label="今日" value="today" />
      <el-option label="昨日" value="yesterday" />
      <el-option label="本周" value="thisWeek" />
      <el-option label="上周" value="lastWeek" />
      <el-option label="本月" value="thisMonth" />
      <el-option label="上月" value="lastMonth" />
      <el-option label="最近7天" value="last7days" />
      <el-option label="最近30天" value="last30days" />
      <el-option label="最近90天" value="last90days" />
      <el-option label="自定义" value="custom" />
    </el-select>
    
    <el-date-picker
      v-if="selectedRange === 'custom'"
      v-model="customDateRange"
      type="daterange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      style="margin-left: 12px;"
      @change="handleCustomDateChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue?: {
    timeRange?: string
    startDate?: Date
    endDate?: Date
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: { timeRange?: string; startDate?: Date; endDate?: Date }): void
}>()

const selectedRange = ref<string>(props.modelValue?.timeRange || 'last7days')
const customDateRange = ref<[Date, Date] | null>(null)

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const handleRangeChange = (value: string) => {
  if (value !== 'custom') {
    emit('update:modelValue', { timeRange: value })
  }
}

const handleCustomDateChange = (value: [Date, Date] | null) => {
  if (value && value[0] && value[1]) {
    emit('update:modelValue', {
      timeRange: 'custom',
      startDate: value[0],
      endDate: value[1]
    })
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal?.timeRange) {
    selectedRange.value = newVal.timeRange
    if (newVal.timeRange === 'custom' && newVal.startDate && newVal.endDate) {
      customDateRange.value = [newVal.startDate, newVal.endDate]
    }
  }
}, { immediate: true })
</script>

<style scoped>
.time-range-selector {
  display: flex;
  align-items: center;
}
</style>
