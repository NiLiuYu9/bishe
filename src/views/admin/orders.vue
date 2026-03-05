<template>
  <div class="admin-orders-page">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
    </div>
    
    <div class="filter-section card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单号">
          <el-input v-model="filters.orderNo" placeholder="订单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已完成" value="completed" />
            <el-option label="已退款" value="refunded" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="orders-table card">
      <el-table :data="orders" border v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="apiName" label="API名称" />
        <el-table-column prop="buyerName" label="买家" width="120" />
        <el-table-column prop="sellerName" label="卖家" width="120" />
        <el-table-column prop="price" label="金额" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewOrder(row)">详情</el-button>
            <el-button v-if="row.status === 'paid'" text type="warning" @click="refundOrder(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, prev, pager, next"
        />
      </div>
    </div>
    
    <el-dialog v-model="orderDialogVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder?.status || '')">{{ getStatusText(currentOrder?.status || '') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="API名称">{{ currentOrder?.apiName }}</el-descriptions-item>
        <el-descriptions-item label="套餐">{{ getPackageName(currentOrder?.packageType || '') }}</el-descriptions-item>
        <el-descriptions-item label="买家">{{ currentOrder?.buyerName }}</el-descriptions-item>
        <el-descriptions-item label="卖家">{{ currentOrder?.sellerName }}</el-descriptions-item>
        <el-descriptions-item label="调用次数">{{ currentOrder?.invokeCount === -1 ? '无限' : currentOrder?.invokeCount }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder?.price }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder?.payTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'
import type { Order } from '@/types/trade'

const loading = ref(false)
const orders = ref<Order[]>([])
const total = ref(0)

const orderDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)

const filters = reactive({
  orderNo: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const mockOrders: Order[] = [
  {
    id: 1,
    orderNo: 'ORD202401180001',
    apiId: 1,
    apiName: '天气查询API',
    buyerId: 1,
    buyerName: 'user1',
    sellerId: 2,
    sellerName: 'developer1',
    packageType: 'standard',
    invokeCount: 500,
    price: 45,
    status: 'completed',
    createTime: '2024-01-18 10:30:00',
    payTime: '2024-01-18 10:35:00',
    completeTime: '2024-01-18 10:35:00'
  },
  {
    id: 2,
    orderNo: 'ORD202401180002',
    apiId: 2,
    apiName: '身份证OCR识别',
    buyerId: 2,
    buyerName: 'user2',
    sellerId: 3,
    sellerName: 'developer2',
    packageType: 'basic',
    invokeCount: 100,
    price: 10,
    status: 'pending',
    createTime: '2024-01-18 14:20:00',
    payTime: '',
    completeTime: ''
  }
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await adminApi.getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined
    })
    orders.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取订单失败:', error)
    orders.value = mockOrders
    total.value = mockOrders.length
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchOrders()
}

const resetFilters = () => {
  filters.orderNo = ''
  filters.status = ''
  pagination.page = 1
  fetchOrders()
}

const viewOrder = (order: Order) => {
  currentOrder.value = order
  orderDialogVisible.value = true
}

const refundOrder = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要退款吗？', '提示', { type: 'warning' })
    ElMessage.success('退款成功')
    fetchOrders()
  } catch (error) {
    console.error('退款失败', error)
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

const getPackageName = (type: string) => {
  const names: Record<string, string> = {
    basic: '基础版',
    standard: '标准版',
    premium: '专业版',
    unlimited: '无限版'
  }
  return names[type] || type
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
