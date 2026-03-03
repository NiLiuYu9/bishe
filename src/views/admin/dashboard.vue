<template>
  <div class="admin-dashboard">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #DBEAFE;">
          <el-icon :size="28" style="color: #1E40AF;"><Box /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.totalApis }}</span>
          <span class="stat-label">API总数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #DCFCE7;">
          <el-icon :size="28" style="color: #16A34A;"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.totalUsers }}</span>
          <span class="stat-label">用户总数</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;">
          <el-icon :size="28" style="color: #D97706;"><List /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statistics.totalOrders }}</span>
          <span class="stat-label">订单总数</span>
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
          <h3 class="section-title">平台数据趋势</h3>
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
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Box, User, List, Money } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const router = useRouter()

const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const statistics = ref({
  totalApis: 128,
  totalUsers: 1024,
  totalOrders: 356,
  totalRevenue: 56800,
  dailyActiveUsers: 256,
  dailyPageViews: 3580,
  apiCallRanking: [] as { apiId: number; apiName: string; callCount: number }[],
  dailyStats: [] as { date: string; activeUsers: number; pageViews: number; newUsers: number; newOrders: number }[]
})

const pendingApis = ref([
  { id: 1, name: '天气查询API', username: 'developer1', createTime: '2024-01-18' },
  { id: 2, name: '身份证识别API', username: 'developer2', createTime: '2024-01-17' }
])

const recentOrders = ref([
  { id: 1, orderNo: 'ORD202401180001', apiName: '天气查询API', price: 45, status: 'completed' },
  { id: 2, orderNo: 'ORD202401180002', apiName: '短信验证码', price: 100, status: 'pending' }
])

const fetchStatistics = async () => {
  try {
    const res = await adminApi.getStatistics({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
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
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dates.push(date.toLocaleDateString())
    activeUsers.push(Math.floor(Math.random() * 200) + 100)
    pageViews.push(Math.floor(Math.random() * 1000) + 500)
  }
  
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['活跃用户', '页面访问量'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: activeUsers,
        itemStyle: { color: '#1E40AF' }
      },
      {
        name: '页面访问量',
        type: 'line',
        smooth: true,
        data: pageViews,
        itemStyle: { color: '#22C55E' }
      }
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

const goToAudit = (api: any) => {
  router.push('/admin/apis')
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
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
  height: 300px;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
