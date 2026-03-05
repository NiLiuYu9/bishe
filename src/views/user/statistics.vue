<template>
  <div class="statistics-page">
    <h2 class="page-title">统计分析</h2>
    
    <div class="filter-section">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="fetchStatistics"
      />
      <el-select v-model="selectedApiId" placeholder="选择API" clearable @change="fetchStatistics">
        <el-option label="全部API" :value="0" />
        <el-option v-for="api in myApis" :key="api.id" :label="api.name" :value="api.id" />
      </el-select>
    </div>
    
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #DBEAFE;">
          <el-icon :size="24" style="color: #1E40AF;"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.invokeCount }}</span>
          <span class="stat-label">总调用次数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #DCFCE7;">
          <el-icon :size="24" style="color: #16A34A;"><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.successCount }}</span>
          <span class="stat-label">成功次数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEE2E2;">
          <el-icon :size="24" style="color: #DC2626;"><CircleClose /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.failCount }}</span>
          <span class="stat-label">失败次数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;">
          <el-icon :size="24" style="color: #D97706;"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ successRate }}%</span>
          <span class="stat-label">成功率</span>
        </div>
      </div>
    </div>
    
    <div class="chart-section card">
      <h3 class="section-title">调用趋势</h3>
      <div ref="chartRef" class="chart-container"></div>
    </div>
    
    <div class="chart-section card">
      <h3 class="section-title">调用分布</h3>
      <div ref="pieChartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { View, CircleCheck, CircleClose, TrendCharts } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import * as echarts from 'echarts'

const dateRange = ref<[Date, Date]>([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
])
const selectedApiId = ref(0)
const chartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const myApis = ref([
  { id: 1, name: '天气查询API' },
  { id: 2, name: '身份证OCR识别' }
])

const statistics = ref({
  invokeCount: 125680,
  successCount: 125000,
  failCount: 680,
  dailyStats: [] as { date: string; invokeCount: number; successCount: number; failCount: number }[]
})

const successRate = computed(() => {
  if (statistics.value.invokeCount === 0) return 0
  return ((statistics.value.successCount / statistics.value.invokeCount) * 100).toFixed(2)
})

const fetchStatistics = async () => {
  try {
    if (selectedApiId.value) {
      const res = await apiManagement.getStatistics(selectedApiId.value, {
        startDate: dateRange.value[0].toISOString(),
        endDate: dateRange.value[1].toISOString()
      })
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    statistics.value = {
      invokeCount: 125680,
      successCount: 125000,
      failCount: 680,
      dailyStats: generateMockDailyStats()
    }
  }
  updateCharts()
}

const generateMockDailyStats = () => {
  const stats = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    stats.push({
      date: date.toLocaleDateString(),
      invokeCount: Math.floor(Math.random() * 1000) + 500,
      successCount: Math.floor(Math.random() * 900) + 450,
      failCount: Math.floor(Math.random() * 50) + 10
    })
  }
  return stats
}

const updateCharts = () => {
  if (!chartRef.value || !pieChartRef.value) return
  
  if (!lineChart) {
    lineChart = echarts.init(chartRef.value)
  }
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  
  const dailyStats = statistics.value.dailyStats.length > 0 
    ? statistics.value.dailyStats 
    : generateMockDailyStats()
  
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['调用次数', '成功次数', '失败次数'] },
    xAxis: {
      type: 'category',
      data: dailyStats.map(s => s.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '调用次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.invokeCount),
        itemStyle: { color: '#1E40AF' }
      },
      {
        name: '成功次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.successCount),
        itemStyle: { color: '#22C55E' }
      },
      {
        name: '失败次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.failCount),
        itemStyle: { color: '#EF4444' }
      }
    ]
  })
  
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '调用分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.value.successCount, name: '成功', itemStyle: { color: '#22C55E' } },
          { value: statistics.value.failCount, name: '失败', itemStyle: { color: '#EF4444' } }
        ]
      }
    ]
  })
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.filter-section {
  display: flex;
  gap: 16px;
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
