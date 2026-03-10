<template>
  <div class="admin-statistics-page">
    <h2 class="page-title">平台统计</h2>
    
    <div class="filter-section">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="fetchStatistics"
      />
      <el-input
        v-model="apiNameFilter"
        placeholder="按API名称筛选"
        clearable
        style="width: 200px; margin-left: 16px;"
        @clear="fetchStatistics"
        @keyup.enter="fetchStatistics"
      />
      <el-button type="primary" @click="fetchStatistics" style="margin-left: 8px;">查询</el-button>
    </div>
    
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #DBEAFE;">
          <el-icon :size="28" style="color: #1E40AF;"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.dailyActiveUsers }}</span>
          <span class="stat-label">日活用户</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #DCFCE7;">
          <el-icon :size="28" style="color: #16A34A;"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.dailyPageViews }}</span>
          <span class="stat-label">日访问量</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;">
          <el-icon :size="28" style="color: #D97706;"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.totalApis }}</span>
          <span class="stat-label">API总数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FCE7F3;">
          <el-icon :size="28" style="color: #DB2777;"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ statistics.totalRevenue }}</span>
          <span class="stat-label">总收入</span>
        </div>
      </div>
    </div>
    
    <el-row :gutter="24">
      <el-col :span="16">
        <div class="chart-section card">
          <h3 class="section-title">平台趋势</h3>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { User, View, TrendCharts, Money } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])

const apiNameFilter = ref('')

const statistics = ref({
  totalApis: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  dailyActiveUsers: 0,
  dailyPageViews: 0,
  apiCallRanking: [] as { apiId: number; apiName: string; invokeCount: number }[],
  dailyStats: [] as { date: string; activeUsers: number; pageViews: number; invokeCount: number; successCount: number; failCount: number }[]
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchStatistics = async () => {
  try {
    const params: { startDate?: string; endDate?: string; apiName?: string } = {}
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.startDate = formatDate(dateRange.value[0])
      params.endDate = formatDate(dateRange.value[1])
    }
    if (apiNameFilter.value) {
      params.apiName = apiNameFilter.value
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
  
  lineChart = echarts.init(lineChartRef.value)
  barChart = echarts.init(barChartRef.value)
  
  const dailyStats = statistics.value.dailyStats || []
  const dates = dailyStats.map(s => s.date)
  const activeUsers = dailyStats.map(s => s.activeUsers || 0)
  const pageViews = dailyStats.map(s => s.pageViews || s.invokeCount || 0)
  const invokeCounts = dailyStats.map(s => s.invokeCount || 0)
  const successCounts = dailyStats.map(s => s.successCount || 0)
  
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['活跃用户', '页面访问量', '调用次数', '成功次数'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '活跃用户', type: 'line', smooth: true, data: activeUsers, itemStyle: { color: '#1E40AF' } },
      { name: '页面访问量', type: 'line', smooth: true, data: pageViews, itemStyle: { color: '#22C55E' } },
      { name: '调用次数', type: 'line', smooth: true, data: invokeCounts, itemStyle: { color: '#F59E0B' } },
      { name: '成功次数', type: 'line', smooth: true, data: successCounts, itemStyle: { color: '#EC4899' } }
    ]
  })
  
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

const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
}

onMounted(() => {
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

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
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

.chart-section {
  margin-bottom: 24px;
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
