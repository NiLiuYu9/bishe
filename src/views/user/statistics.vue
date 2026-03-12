<template>
  <div class="statistics-page">
    <h2 class="page-title">统计分析</h2>
    
    <div class="filter-section">
      <TimeRangeSelector v-model="timeRangeValue" @update:model-value="handleTimeRangeChange" />
      <el-select
        v-model="typeIdFilter"
        placeholder="API分类"
        clearable
        style="width: 160px;"
        @change="fetchStatistics"
      >
        <el-option
          v-for="type in apiTypes"
          :key="type.id"
          :label="type.name"
          :value="type.id"
        />
      </el-select>
      <el-input
        v-model="apiNameFilter"
        placeholder="按API名称筛选"
        clearable
        style="width: 200px;"
        @clear="fetchStatistics"
        @keyup.enter="fetchStatistics"
      />
      <el-select
        v-model="statusFilter"
        placeholder="调用状态"
        clearable
        style="width: 120px;"
        @change="fetchStatistics"
      >
        <el-option label="全部" value="all" />
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
      </el-select>
      <el-button type="primary" @click="fetchStatistics" style="margin-left: 8px;">查询</el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="fetchStatistics">
      <el-tab-pane label="我的调用统计" name="my-invoke">
        <div class="stats-cards">
          <StatsCard
            :value="myInvokeStats.invokeCount"
            :prev-value="myInvokeStats.prevInvokeCount"
            label="总调用次数"
            :icon="View"
            icon-bg-color="#DBEAFE"
            icon-color="#1E40AF"
          />
          
          <StatsCard
            :value="myInvokeStats.successCount"
            :prev-value="myInvokeStats.prevSuccessCount"
            label="成功次数"
            :icon="CircleCheck"
            icon-bg-color="#DCFCE7"
            icon-color="#16A34A"
          />
          
          <StatsCard
            :value="myInvokeStats.failCount"
            :prev-value="myInvokeStats.prevFailCount"
            label="失败次数"
            :icon="CircleClose"
            icon-bg-color="#FEE2E2"
            icon-color="#DC2626"
          />
          
          <StatsCard
            :value="myInvokeSuccessRate"
            label="成功率"
            :icon="TrendCharts"
            icon-bg-color="#FEF3C7"
            icon-color="#D97706"
            suffix="%"
            :show-trend="false"
          />
        </div>
        
        <div class="chart-section card">
          <div class="chart-header">
            <h3 class="section-title">调用趋势</h3>
            <IndicatorSelector
              v-model="selectedIndicators"
              :indicators="userIndicators"
            />
          </div>
          <div ref="myInvokeChartRef" class="chart-container"></div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="我的API被调用统计" name="my-api-invoke">
        <div class="stats-cards">
          <StatsCard
            :value="myApiInvokeStats.invokeCount"
            :prev-value="myApiInvokeStats.prevInvokeCount"
            label="总调用次数"
            :icon="View"
            icon-bg-color="#DBEAFE"
            icon-color="#1E40AF"
          />
          
          <StatsCard
            :value="myApiInvokeStats.successCount"
            :prev-value="myApiInvokeStats.prevSuccessCount"
            label="成功次数"
            :icon="CircleCheck"
            icon-bg-color="#DCFCE7"
            icon-color="#16A34A"
          />
          
          <StatsCard
            :value="myApiInvokeStats.failCount"
            :prev-value="myApiInvokeStats.prevFailCount"
            label="失败次数"
            :icon="CircleClose"
            icon-bg-color="#FEE2E2"
            icon-color="#DC2626"
          />
          
          <StatsCard
            :value="myApiInvokeSuccessRate"
            label="成功率"
            :icon="TrendCharts"
            icon-bg-color="#FEF3C7"
            icon-color="#D97706"
            suffix="%"
            :show-trend="false"
          />
        </div>
        
        <div class="chart-section card">
          <div class="chart-header">
            <h3 class="section-title">调用趋势</h3>
            <IndicatorSelector
              v-model="selectedIndicators"
              :indicators="userIndicators"
            />
          </div>
          <div ref="myApiInvokeChartRef" class="chart-container"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { View, CircleCheck, CircleClose, TrendCharts } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import * as echarts from 'echarts'
import TimeRangeSelector from '@/components/statistics/TimeRangeSelector.vue'
import StatsCard from '@/components/statistics/StatsCard.vue'
import IndicatorSelector from '@/components/statistics/IndicatorSelector.vue'
import type { ApiType } from '@/types'

const timeRangeValue = ref<{ timeRange?: string; startDate?: Date; endDate?: Date }>({
  timeRange: 'last7days'
})
const typeIdFilter = ref<number>()
const apiNameFilter = ref('')
const statusFilter = ref<string>('all')
const activeTab = ref('my-invoke')
const apiTypes = ref<ApiType[]>([])

const myInvokeChartRef = ref<HTMLElement>()
const myApiInvokeChartRef = ref<HTMLElement>()
let myInvokeChart: echarts.ECharts | null = null
let myApiInvokeChart: echarts.ECharts | null = null

const selectedIndicators = ref<string[]>(['invokeCount', 'successCount', 'failCount'])

const userIndicators = [
  { label: '调用次数', value: 'invokeCount' },
  { label: '成功次数', value: 'successCount' },
  { label: '失败次数', value: 'failCount' },
  { label: '成功率', value: 'successRate' }
]

const userId = ref<number>(1)

const myInvokeStats = ref({
  invokeCount: 0,
  successCount: 0,
  failCount: 0,
  dailyStats: [] as { date: string; invokeCount: number; successCount: number; failCount: number; successRate: number }[],
  prevInvokeCount: 0,
  prevSuccessCount: 0,
  prevFailCount: 0
})

const myApiInvokeStats = ref({
  invokeCount: 0,
  successCount: 0,
  failCount: 0,
  dailyStats: [] as { date: string; invokeCount: number; successCount: number; failCount: number; successRate: number }[],
  prevInvokeCount: 0,
  prevSuccessCount: 0,
  prevFailCount: 0
})

const myInvokeSuccessRate = computed(() => {
  if (myInvokeStats.value.invokeCount === 0) return '0.00'
  return ((myInvokeStats.value.successCount / myInvokeStats.value.invokeCount) * 100).toFixed(2)
})

const myApiInvokeSuccessRate = computed(() => {
  if (myApiInvokeStats.value.invokeCount === 0) return '0.00'
  return ((myApiInvokeStats.value.successCount / myApiInvokeStats.value.invokeCount) * 100).toFixed(2)
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const handleTimeRangeChange = () => {
  fetchStatistics()
}

const fetchApiTypes = async () => {
  try {
    const res = await apiManagement.getTypes()
    apiTypes.value = res.data
  } catch (error) {
    console.error('获取API分类失败:', error)
  }
}

const getParams = () => {
  const params: { userId: number; startDate?: string; endDate?: string; apiName?: string; typeId?: number; status?: string; timeRange?: string } = {
    userId: userId.value
  }
  
  if (timeRangeValue.value.timeRange === 'custom' && timeRangeValue.value.startDate && timeRangeValue.value.endDate) {
    params.startDate = formatDate(timeRangeValue.value.startDate)
    params.endDate = formatDate(timeRangeValue.value.endDate)
  } else if (timeRangeValue.value.timeRange) {
    params.timeRange = timeRangeValue.value.timeRange
  }
  
  if (apiNameFilter.value) {
    params.apiName = apiNameFilter.value
  }
  if (typeIdFilter.value) {
    params.typeId = typeIdFilter.value
  }
  if (statusFilter.value && statusFilter.value !== 'all') {
    params.status = statusFilter.value
  }
  return params
}

const fetchStatistics = async () => {
  try {
    const params = getParams()
    
    if (activeTab.value === 'my-invoke') {
      const res = await apiManagement.getMyInvokeStatistics(params)
      myInvokeStats.value = res.data
      updateMyInvokeChart()
    } else {
      const res = await apiManagement.getMyApiInvokeStatistics(params)
      myApiInvokeStats.value = res.data
      updateMyApiInvokeChart()
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const updateMyInvokeChart = () => {
  if (!myInvokeChartRef.value) return
  
  if (!myInvokeChart) {
    myInvokeChart = echarts.init(myInvokeChartRef.value)
  }
  
  const dailyStats = myInvokeStats.value.dailyStats || []
  
  const seriesMap: Record<string, { name: string; data: number[]; color: string }> = {
    invokeCount: { name: '调用次数', data: dailyStats.map(s => s.invokeCount || 0), color: '#1E40AF' },
    successCount: { name: '成功次数', data: dailyStats.map(s => s.successCount || 0), color: '#22C55E' },
    failCount: { name: '失败次数', data: dailyStats.map(s => s.failCount || 0), color: '#EF4444' },
    successRate: { name: '成功率(%)', data: dailyStats.map(s => s.successRate || 0), color: '#F59E0B' }
  }
  
  const series = selectedIndicators.value
    .filter(key => seriesMap[key])
    .map(key => ({
      name: seriesMap[key].name,
      type: 'line',
      smooth: true,
      data: seriesMap[key].data,
      itemStyle: { color: seriesMap[key].color }
    }))
  
  myInvokeChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: {
      type: 'category',
      data: dailyStats.map(s => s.date)
    },
    yAxis: { type: 'value' },
    series
  })
}

const updateMyApiInvokeChart = () => {
  if (!myApiInvokeChartRef.value) return
  
  if (!myApiInvokeChart) {
    myApiInvokeChart = echarts.init(myApiInvokeChartRef.value)
  }
  
  const dailyStats = myApiInvokeStats.value.dailyStats || []
  
  const seriesMap: Record<string, { name: string; data: number[]; color: string }> = {
    invokeCount: { name: '调用次数', data: dailyStats.map(s => s.invokeCount || 0), color: '#1E40AF' },
    successCount: { name: '成功次数', data: dailyStats.map(s => s.successCount || 0), color: '#22C55E' },
    failCount: { name: '失败次数', data: dailyStats.map(s => s.failCount || 0), color: '#EF4444' },
    successRate: { name: '成功率(%)', data: dailyStats.map(s => s.successRate || 0), color: '#F59E0B' }
  }
  
  const series = selectedIndicators.value
    .filter(key => seriesMap[key])
    .map(key => ({
      name: seriesMap[key].name,
      type: 'line',
      smooth: true,
      data: seriesMap[key].data,
      itemStyle: { color: seriesMap[key].color }
    }))
  
  myApiInvokeChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: {
      type: 'category',
      data: dailyStats.map(s => s.date)
    },
    yAxis: { type: 'value' },
    series
  })
}

watch(selectedIndicators, () => {
  if (activeTab.value === 'my-invoke' && myInvokeChart) {
    updateMyInvokeChart()
  } else if (activeTab.value === 'my-api-invoke' && myApiInvokeChart) {
    updateMyApiInvokeChart()
  }
})

const handleResize = () => {
  myInvokeChart?.resize()
  myApiInvokeChart?.resize()
}

onMounted(() => {
  fetchApiTypes()
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myInvokeChart?.dispose()
  myApiInvokeChart?.dispose()
})
</script>

<style scoped>
.filter-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin: 0 0 16px 0;
}

.chart-container {
  height: 300px;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
