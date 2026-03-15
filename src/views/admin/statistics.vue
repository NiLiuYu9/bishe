<template>
  <div class="admin-statistics-page">
    <h2 class="page-title">平台统计</h2>
    
    <div class="filter-section">
      <TimeRangeSelector v-model="timeRangeValue" @update:model-value="handleTimeRangeChange" />
      <el-select
        v-model="typeIdFilter"
        placeholder="API分类"
        clearable
        style="width: 160px; margin-left: 12px;"
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
        style="width: 200px; margin-left: 12px;"
        @clear="fetchStatistics"
        @keyup.enter="fetchStatistics"
      />
      <el-button type="primary" @click="fetchStatistics" style="margin-left: 8px;">查询</el-button>
    </div>
    
    <div class="stats-cards">
      <StatsCard
        :value="statistics.dailyActiveUsers"
        :prev-value="statistics.prevDailyActiveUsers"
        label="日调用用户"
        :icon="User"
        icon-bg-color="#DBEAFE"
        icon-color="#1E40AF"
      />
      
      <StatsCard
        :value="statistics.dailyPageViews"
        :prev-value="statistics.prevDailyPageViews"
        label="日调用量"
        :icon="View"
        icon-bg-color="#DCFCE7"
        icon-color="#16A34A"
      />
      
      <StatsCard
        :value="statistics.totalApis"
        :prev-value="statistics.prevTotalApis"
        label="API总数"
        :icon="TrendCharts"
        icon-bg-color="#FEF3C7"
        icon-color="#D97706"
      />
      
      <StatsCard
        :value="statistics.totalRevenue"
        :prev-value="statistics.prevTotalRevenue"
        label="总收入"
        :icon="Money"
        icon-bg-color="#FCE7F3"
        icon-color="#DB2777"
        prefix="¥"
      />
    </div>
    
    <el-row :gutter="24">
      <el-col :span="16">
        <div class="chart-section card">
          <div class="chart-header">
            <h3 class="section-title">平台趋势</h3>
            <IndicatorSelector
              v-model="selectedIndicators"
              :indicators="platformIndicators"
            />
          </div>
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </el-col>
      
      <el-col :span="8">
        <div class="chart-section card">
          <h3 class="section-title">API调用排行</h3>
          <div ref="barChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { User, View, TrendCharts, Money } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'
import TimeRangeSelector from '@/components/statistics/TimeRangeSelector.vue'
import StatsCard from '@/components/statistics/StatsCard.vue'
import IndicatorSelector from '@/components/statistics/IndicatorSelector.vue'
import type { ApiType } from '@/types'

const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const timeRangeValue = ref<{ timeRange?: string; startDate?: Date; endDate?: Date }>({
  timeRange: 'last30days'
})

const typeIdFilter = ref<number>()
const apiNameFilter = ref('')
const apiTypes = ref<ApiType[]>([])

const selectedIndicators = ref<string[]>(['activeUsers', 'invokeCount', 'successCount'])

const platformIndicators = [
  { label: '活跃用户', value: 'activeUsers' },
  { label: '调用次数', value: 'invokeCount' },
  { label: '成功次数', value: 'successCount' },
  { label: '失败次数', value: 'failCount' },
  { label: '成功率', value: 'successRate' }
]

const statistics = ref({
  totalApis: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  dailyActiveUsers: 0,
  dailyPageViews: 0,
  apiCallRanking: [] as { apiId: number; apiName: string; invokeCount: number }[],
  dailyStats: [] as { date: string; activeUsers: number; pageViews: number; invokeCount: number; successCount: number; failCount: number; successRate: number }[],
  prevTotalApis: 0,
  prevTotalUsers: 0,
  prevTotalOrders: 0,
  prevTotalRevenue: 0,
  prevDailyActiveUsers: 0,
  prevDailyPageViews: 0
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
    const res = await adminApi.getAllApiTypes()
    apiTypes.value = res.data
  } catch (error) {
    console.error('获取API分类失败:', error)
  }
}

const fetchStatistics = async () => {
  try {
    const params: { startDate?: string; endDate?: string; apiName?: string; typeId?: number; timeRange?: string } = {}
    
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
    
    const res = await adminApi.getStatistics(params)
    statistics.value = res.data
    initCharts()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const initCharts = () => {
  if (!lineChartRef.value || !barChartRef.value) return
  
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }
  
  updateLineChart()
  updateBarChart()
}

const updateLineChart = () => {
  if (!lineChart) return
  
  const dailyStats = statistics.value.dailyStats || []
  const dates = dailyStats.map(s => s.date)
  
  const seriesMap: Record<string, { name: string; data: number[]; color: string }> = {
    activeUsers: { name: '活跃用户', data: dailyStats.map(s => s.activeUsers || 0), color: '#1E40AF' },
    invokeCount: { name: '调用次数', data: dailyStats.map(s => s.invokeCount || 0), color: '#F59E0B' },
    successCount: { name: '成功次数', data: dailyStats.map(s => s.successCount || 0), color: '#22C55E' },
    failCount: { name: '失败次数', data: dailyStats.map(s => s.failCount || 0), color: '#EF4444' },
    successRate: { name: '成功率(%)', data: dailyStats.map(s => s.successRate || 0), color: '#EC4899' }
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
  
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: series.map(s => s.name) },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series
  }, { notMerge: true })
}

const updateBarChart = () => {
  if (!barChart) return
  
  const ranking = statistics.value.apiCallRanking || []
  const rankingNames = ranking.map(r => r.apiName)
  const rankingCounts = ranking.map(r => r.invokeCount)
  
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: rankingNames
    },
    series: [{
      type: 'bar',
      data: rankingCounts,
      itemStyle: { color: '#1E40AF' }
    }]
  })
}

watch(selectedIndicators, () => {
  updateLineChart()
}, { deep: true })

const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  fetchApiTypes()
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.filter-section {
  display: flex;
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
  height: 350px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
