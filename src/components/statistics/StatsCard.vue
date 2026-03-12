<template>
  <div class="stats-card">
    <div class="stat-icon" :style="{ background: iconBgColor }">
      <el-icon :size="24" :style="{ color: iconColor }">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-info">
      <div class="stat-value-row">
        <span class="stat-value">{{ formattedValue }}</span>
        <el-tooltip 
          v-if="showTrend && trendValue !== null" 
          :content="trendTooltip" 
          placement="top"
        >
          <span class="trend-badge" :class="trendClass">
            <span class="trend-text">环比</span>
            <el-icon :size="12">
              <component :is="trendIcon" />
            </el-icon>
            {{ Math.abs(trendValue).toFixed(1) }}%
          </span>
        </el-tooltip>
      </div>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

interface Props {
  value: number | string
  label: string
  icon: any
  iconBgColor?: string
  iconColor?: string
  prevValue?: number
  showTrend?: boolean
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconBgColor: '#DBEAFE',
  iconColor: '#1E40AF',
  showTrend: true,
  prefix: '',
  suffix: ''
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  return `${props.prefix}${props.value.toLocaleString()}${props.suffix}`
})

const trendValue = computed(() => {
  if (props.prevValue === undefined || props.prevValue === 0) {
    return props.value && Number(props.value) > 0 ? 100 : 0
  }
  const current = Number(props.value) || 0
  const prev = props.prevValue
  if (prev === 0) return current > 0 ? 100 : 0
  return ((current - prev) / prev) * 100
})

const trendClass = computed(() => {
  if (trendValue.value === null) return ''
  if (trendValue.value > 0) return 'trend-up'
  if (trendValue.value < 0) return 'trend-down'
  return 'trend-flat'
})

const trendIcon = computed(() => {
  if (trendValue.value === null || trendValue.value === 0) return Minus
  return trendValue.value > 0 ? ArrowUp : ArrowDown
})

const trendTooltip = computed(() => {
  if (trendValue.value === null) return ''
  const direction = trendValue.value > 0 ? '增长' : trendValue.value < 0 ? '下降' : '持平'
  return `较上一周期${direction} ${Math.abs(trendValue.value).toFixed(1)}%`
})
</script>

<style scoped>
.stats-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E3A8A;
}

.stat-label {
  font-size: 14px;
  color: #64748B;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.trend-text {
  margin-right: 2px;
}

.trend-up {
  background: #DCFCE7;
  color: #16A34A;
}

.trend-down {
  background: #FEE2E2;
  color: #DC2626;
}

.trend-flat {
  background: #F3F4F6;
  color: #6B7280;
}
</style>
