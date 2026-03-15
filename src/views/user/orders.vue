<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待付款" name="pending" />
      <el-tab-pane label="已完成" name="completed" />
      <el-tab-pane label="已退款" name="refunded" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>
    
    <div class="orders-list" v-loading="loading">
      <div v-if="orders.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无订单" />
      </div>
      
      <div v-else class="order-cards">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号: {{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
          
          <div class="order-body">
            <div class="api-info">
              <h4>{{ order.apiName }}</h4>
              <p>调用次数: {{ order.invokeCount === -1 ? '无限' : order.invokeCount }}次</p>
            </div>
            <div class="price-info">
              <span class="label">订单金额</span>
              <span class="price">¥{{ order.price }}</span>
            </div>
          </div>
          
          <div class="order-rating" v-if="order.status === 'paid' || order.status === 'completed'">
            <div class="rating-header">
              <span class="rating-label">{{ order.rating ? '我的评分' : '给API评分' }}</span>
              <span v-if="order === editingOrder" class="saving-indicator">
                <el-icon class="is-loading"><Loading /></el-icon>
                保存中...
              </span>
            </div>
            <div class="rating-content">
              <el-rate
                v-model="order.rating"
                :disabled="order.status !== 'paid' && order.status !== 'completed'"
                :low-threshold="1"
                :high-threshold="4"
                :step="0.5"
                show-score
                text-color="#ff9900"
                @change="(value) => handleRatingChange(order, value)"
              />
            </div>
          </div>
          
          <div class="order-footer">
            <el-button
              v-if="order.status === 'pending'"
              type="primary"
              @click="handlePay(order)"
            >
              立即付款
            </el-button>
            <el-button
              v-if="order.status === 'paid' || order.status === 'completed'"
              @click="goToApi(order.apiId)"
            >
              查看API
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { tradeApi } from '@/api/trade'
import type { Order } from '@/types/trade'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const orders = ref<Order[]>([])
const total = ref(0)
const editingOrder = ref<Order | null>(null)
const debounceTimer = ref<NodeJS.Timeout | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await tradeApi.getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    orders.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取订单失败:', error)
    ElMessage.error('获取订单失败')
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchOrders()
}

watch(() => pagination.page, () => {
  fetchOrders()
})

watch(() => pagination.pageSize, () => {
  pagination.page = 1
  fetchOrders()
})

const handlePay = async (order: Order) => {
  try {
    await tradeApi.updateOrderStatus(order.id, 'completed')
    ElMessage.success('支付成功')
    fetchOrders()
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败')
  }
}

const goToApi = (apiId: number) => {
  router.push(`/api/${apiId}`)
}

const handleRatingChange = async (order: Order, value: number) => {
  if (!value || value < 0.5) return
  
  editingOrder.value = order
  
  try {
    const ratingValue = Number(value)
    await tradeApi.evaluate(order.id, ratingValue)
    ElMessage.success('评分保存成功')
  } catch (error: any) {
    console.error('评分保存失败:', error)
    ElMessage.error(error.message || '评分保存失败')
  } finally {
    editingOrder.value = null
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    completed: 'success',
    refunded: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    completed: '已完成',
    refunded: '已退款',
    cancelled: '已取消'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-list {
  min-height: 400px;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  transition: all 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.order-info {
  display: flex;
  gap: 24px;
}

.order-no {
  font-weight: 500;
  color: #1E3A8A;
}

.order-time {
  color: #64748B;
  font-size: 14px;
}

.order-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.api-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.api-info p {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 4px;
}

.price-info {
  text-align: right;
}

.price-info .label {
  display: block;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 4px;
}

.price-info .price {
  font-size: 24px;
  font-weight: 600;
  color: #22C55E;
}

.order-rating {
  padding: 16px 20px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-top: 1px solid #FED7AA;
}

.rating-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-label {
  font-size: 14px;
  font-weight: 600;
  color: #9A3412;
}

.saving-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #EA580C;
}

.rating-content {
  display: flex;
  align-items: center;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.empty-state {
  padding: 80px 0;
}
</style>
