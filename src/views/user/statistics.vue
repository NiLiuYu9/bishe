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
      <el-input
        v-model="apiNameFilter"
        placeholder="按API名称筛选"
        clearable
        style="width: 200px;"
        @clear="fetchStatistics"
        @keyup.enter="fetchStatistics"
      />
      <el-button type="primary" @click="fetchStatistics" style="margin-left: 8px;">查询</el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="fetchStatistics">
      <el-tab-pane label="我的调用统计" name="my-invoke">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon" style="background: #DBEAFE;">
              <el-icon :size="24" style="color: #1E40AF;"><View /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myInvokeStats.invokeCount }}</span>
              <span class="stat-label">总调用次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #DCFCE7;">
              <el-icon :size="24" style="color: #16A34A;"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myInvokeStats.successCount }}</span>
              <span class="stat-label">成功次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #FEE2E2;">
              <el-icon :size="24" style="color: #DC2626;"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myInvokeStats.failCount }}</span>
              <span class="stat-label">失败次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #FEF3C7;">
              <el-icon :size="24" style="color: #D97706;"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myInvokeSuccessRate }}%</span>
              <span class="stat-label">成功率</span>
            </div>
          </div>
        </div>
        
        <div class="chart-section card">
          <h3 class="section-title">调用趋势</h3>
          <div ref="myInvokeChartRef" class="chart-container"></div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="我的API被调用统计" name="my-api-invoke">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon" style="background: #DBEAFE;">
              <el-icon :size="24" style="color: #1E40AF;"><View /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myApiInvokeStats.invokeCount }}</span>
              <span class="stat-label">总调用次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #DCFCE7;">
              <el-icon :size="24" style="color: #16A34A;"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myApiInvokeStats.successCount }}</span>
              <span class="stat-label">成功次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #FEE2E2;">
              <el-icon :size="24" style="color: #DC2626;"><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myApiInvokeStats.failCount }}</span>
              <span class="stat-label">失败次数</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: #FEF3C7;">
              <el-icon :size="24" style="color: #D97706;"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myApiInvokeSuccessRate }}%</span>
              <span class="stat-label">成功率</span>
            </div>
          </div>
        </div>
        
        <div class="chart-section card">
          <h3 class="section-title">调用趋势</h3>
          <div ref="myApiInvokeChartRef" class="chart-container"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
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
const apiNameFilter = ref('')
const activeTab = ref('my-invoke')

const myInvokeChartRef = ref<HTMLElement>()
const myApiInvokeChartRef = ref<HTMLElement>()
let myInvokeChart: echarts.ECharts | null = null
let myApiInvokeChart: echarts.ECharts | null = null

const userId = ref<number>(1)

const myInvokeStats = ref({
  invokeCount: 0,
  successCount: 0,
  failCount: 0,
  dailyStats: [] as { date: string; invokeCount: number; successCount: number; failCount: number }[]
})

const myApiInvokeStats = ref({
  invokeCount: 0,
  successCount: 0,
  failCount: 0,
  dailyStats: [] as { date: string; invokeCount: number; successCount: number; failCount: number }[]
})

const myInvokeSuccessRate = computed(() => {
  if (myInvokeStats.value.invokeCount === 0) return 0
  return ((myInvokeStats.value.successCount / myInvokeStats.value.invokeCount) * 100).toFixed(2)
})

const myApiInvokeSuccessRate = computed(() => {
  if (myApiInvokeStats.value.invokeCount === 0) return 0
  return ((myApiInvokeStats.value.successCount / myApiInvokeStats.value.invokeCount) * 100).toFixed(2)
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getParams = () => {
  const params: { userId: number; startDate?: string; endDate?: string; apiName?: string } = {
    userId: userId.value
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.startDate = formatDate(dateRange.value[0])
    params.endDate = formatDate(dateRange.value[1])
  }
  if (apiNameFilter.value) {
    params.apiName = apiNameFilter.value
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
  
  myInvokeChart.setOption({
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
        data: dailyStats.map(s => s.invokeCount || 0),
        itemStyle: { color: '#1E40AF' }
      },
      {
        name: '成功次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.successCount || 0),
        itemStyle: { color: '#22C55E' }
      },
      {
        name: '失败次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.failCount || 0),
        itemStyle: { color: '#EF4444' }
      }
    ]
  })
}

const updateMyApiInvokeChart = () => {
  if (!myApiInvokeChartRef.value) return
  
  if (!myApiInvokeChart) {
    myApiInvokeChart = echarts.init(myApiInvokeChartRef.value)
  }
  
  const dailyStats = myApiInvokeStats.value.dailyStats || []
  
  myApiInvokeChart.setOption({
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
        data: dailyStats.map(s => s.invokeCount || 0),
        itemStyle: { color: '#1E40AF' }
      },
      {
        name: '成功次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.successCount || 0),
        itemStyle: { color: '#22C55E' }
      },
      {
        name: '失败次数',
        type: 'line',
        smooth: true,
        data: dailyStats.map(s => s.failCount || 0),
        itemStyle: { color: '#EF4444' }
      }
    ]
  })
}

const handleResize = () => {
  myInvokeChart?.resize()
  myApiInvokeChart?.resize()
}

onMounted(() => {
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
