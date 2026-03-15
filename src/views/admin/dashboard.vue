<template>
  <div class="admin-dashboard">
    <div class="filter-section">
      <TimeRangeSelector v-model="timeRangeValue" @update:model-value="handleTimeRangeChange" />
    </div>
    
    <div class="stats-cards">
      <StatsCard
        :value="statistics.totalApis"
        :prev-value="statistics.prevTotalApis"
        label="API总数"
        :icon="Box"
        icon-bg-color="#DBEAFE"
        icon-color="#1E40AF"
      />
      
      <StatsCard
        :value="statistics.totalUsers"
        :prev-value="statistics.prevTotalUsers"
        label="用户总数"
        :icon="User"
        icon-bg-color="#DCFCE7"
        icon-color="#16A34A"
      />
      
      <StatsCard
        :value="statistics.totalOrders"
        :prev-value="statistics.prevTotalOrders"
        label="订单总数"
        :icon="List"
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
            <h3 class="section-title">平台数据趋势</h3>
            <IndicatorSelector
              v-model="selectedIndicators"
              :indicators="dashboardIndicators"
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
    
    <el-row :gutter="24" class="mt-24">
      <el-col :span="12">
        <div class="card">
          <h3 class="section-title">待审核API</h3>
          <el-table :data="pendingApis" border size="small">
            <el-table-column prop="name" label="API名称" />
            <el-table-column prop="username" label="提交者" />
            <el-table-column prop="createTime" label="提交时间" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" text @click="goToAudit(row)">审核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      
      <el-col :span="12">
        <div class="card">
          <h3 class="section-title">最新订单</h3>
          <el-table :data="recentOrders" border size="small">
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column prop="apiName" label="API" />
            <el-table-column prop="price" label="金额">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Box, User, List, Money } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'
import TimeRangeSelector from '@/components/statistics/TimeRangeSelector.vue'
import StatsCard from '@/components/statistics/StatsCard.vue'
import IndicatorSelector from '@/components/statistics/IndicatorSelector.vue'

const router = useRouter()

const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const timeRangeValue = ref<{ timeRange?: string; startDate?: Date; endDate?: Date }>({
  timeRange: 'last7days'
})

const selectedIndicators = ref<string[]>(['activeUsers', 'pageViews'])

const dashboardIndicators = [
  { label: '活跃用户', value: 'activeUsers' },
  { label: '调用次数', value: 'invokeCount' },
  { label: '成功次数', value: 'successCount' },
  { label: '失败次数', value: 'failCount' }
]

const statistics = ref({
  totalApis: 0,
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  dailyActiveUsers: 0,
  dailyPageViews: 0,
  apiCallRanking: [] as { apiId: number; apiName: string; invokeCount: number }[],
  dailyStats: [] as { date: string; activeUsers: number; pageViews: number; invokeCount: number; successCount: number; failCount: number }[],
  prevTotalApis: 0,
  prevTotalUsers: 0,
  prevTotalOrders: 0,
  prevTotalRevenue: 0,
  prevDailyActiveUsers: 0,
  prevDailyPageViews: 0
})

const pendingApis = ref<{ id: number; name: string; username: string; createTime: string }[]>([])

const recentOrders = ref<{ id: number; orderNo: string; apiName: string; price: number; status: string }[]>([])

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const handleTimeRangeChange = () => {
  fetchStatistics()
}

const fetchStatistics = async () => {
  try {
    const params: { startDate?: string; endDate?: string; timeRange?: string } = {}
    
    if (timeRangeValue.value.timeRange === 'custom' && timeRangeValue.value.startDate && timeRangeValue.value.endDate) {
      params.startDate = formatDate(timeRangeValue.value.startDate)
      params.endDate = formatDate(timeRangeValue.value.endDate)
    } else if (timeRangeValue.value.timeRange) {
      params.timeRange = timeRangeValue.value.timeRange
    }
    
    const res = await adminApi.getStatistics(params)
    statistics.value = res.data
    initCharts()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchPendingApis = async () => {
  try {
    const res = await adminApi.getApis({ pageNum: 1, pageSize: 5, status: 'pending' })
    pendingApis.value = res.data.list.map((api: any) => ({
      id: api.id,
      name: api.name,
      username: api.username || api.developerName || '-',
      createTime: api.createTime ? api.createTime.split(' ')[0] : '-'
    }))
  } catch (error) {
    console.error('获取待审核API失败:', error)
  }
}

const fetchRecentOrders = async () => {
  try {
    const res = await adminApi.getOrders({ page: 1, pageSize: 5 })
    recentOrders.value = res.data.list.map((order: any) => ({
      id: order.id,
      orderNo: order.orderNo,
      apiName: order.apiName || '-',
      price: order.price || 0,
      status: order.status
    }))
  } catch (error) {
    console.error('获取最新订单失败:', error)
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
  const dates = dailyStats.map((item: any) => {
    if (item.date) {
      const parts = item.date.split('-')
      return `${parts[1]}-${parts[2]}`
    }
    return item.date
  })
  
  const seriesMap: Record<string, { name: string; data: number[]; color: string }> = {
    activeUsers: { name: '活跃用户', data: dailyStats.map((item: any) => item.activeUsers || 0), color: '#1E40AF' },
    pageViews: { name: '页面访问量', data: dailyStats.map((item: any) => item.pageViews || item.invokeCount || 0), color: '#22C55E' },
    invokeCount: { name: '调用次数', data: dailyStats.map((item: any) => item.invokeCount || 0), color: '#F59E0B' },
    successCount: { name: '成功次数', data: dailyStats.map((item: any) => item.successCount || 0), color: '#EC4899' },
    failCount: { name: '失败次数', data: dailyStats.map((item: any) => item.failCount || 0), color: '#EF4444' }
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
  const apiNames = ranking.map((item: any) => item.apiName || '未知API').reverse()
  const invokeCounts = ranking.map((item: any) => item.invokeCount || 0).reverse()
  
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: apiNames
    },
    series: [{
      type: 'bar',
      data: invokeCounts,
      itemStyle: { color: '#1E40AF' }
    }]
  })
}

watch(selectedIndicators, () => {
  updateLineChart()
}, { deep: true })

const goToAudit = (api: any) => {
  router.push('/admin/apis')
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    completed: 'success',
    cancelled: 'danger',
    refunded: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return texts[status] || status
}

const handleResize = () => {
  lineChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  fetchPendingApis()
  fetchRecentOrders()
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

.mt-24 {
  margin-top: 24px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
