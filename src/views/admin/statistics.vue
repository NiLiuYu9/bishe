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

const statistics = ref({
  totalApis: 128,
  totalUsers: 1024,
  totalOrders: 356,
  totalRevenue: 56800,
  dailyActiveUsers: 256,
  dailyPageViews: 3580,
  apiCallRanking: [],
  dailyStats: []
})

const fetchStatistics = async () => {
  try {
    const res = await adminApi.getStatistics({
      startDate: dateRange.value[0].toISOString(),
      endDate: dateRange.value[1].toISOString()
    })
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
  initCharts()
}

const initCharts = () => {
  if (!lineChartRef.value || !barChartRef.value) return
  
  lineChart = echarts.init(lineChartRef.value)
  barChart = echarts.init(barChartRef.value)
  
  const dates = []
  const activeUsers = []
  const pageViews = []
  const newUsers = []
  const newOrders = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dates.push(date.toLocaleDateString())
    activeUsers.push(Math.floor(Math.random() * 200) + 100)
    pageViews.push(Math.floor(Math.random() * 1000) + 500)
    newUsers.push(Math.floor(Math.random() * 30) + 10)
    newOrders.push(Math.floor(Math.random() * 20) + 5)
  }
  
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['活跃用户', '页面访问量', '新增用户', '新增订单'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '活跃用户', type: 'line', smooth: true, data: activeUsers, itemStyle: { color: '#1E40AF' } },
      { name: '页面访问量', type: 'line', smooth: true, data: pageViews, itemStyle: { color: '#22C55E' } },
      { name: '新增用户', type: 'line', smooth: true, data: newUsers, itemStyle: { color: '#F59E0B' } },
      { name: '新增订单', type: 'line', smooth: true, data: newOrders, itemStyle: { color: '#EC4899' } }
    ]
  })
  
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['天气查询', '身份证识别', '短信验证', '地图服务', '支付接口']
    },
    series: [{
      type: 'bar',
      data: [125680, 89560, 256780, 67890, 45600],
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
