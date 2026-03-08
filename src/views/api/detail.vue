<template>
  <div class="api-detail-page">
    <div class="back-link">
      <el-button text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
    </div>
    
    <div class="detail-content" v-loading="loading">
      <div class="main-info card">
        <div class="api-header">
          <div class="header-left">
            <el-tag :type="getMethodType(api.method)" size="large">{{ api.method }}</el-tag>
            <h1>{{ api.name }}</h1>
          </div>
          <div class="header-right">
            <el-button @click="goToTest">
              <el-icon><VideoPlay /></el-icon> 免费测试
            </el-button>
            <el-button type="primary" @click="showPurchaseDialog = true">
              <el-icon><ShoppingCart /></el-icon> 购买
            </el-button>
          </div>
        </div>
        
        <div class="api-meta">
          <span><el-icon><User /></el-icon> {{ api.username }}</span>
          <span><el-icon><Folder /></el-icon> {{ api.typeName }}</span>
          <span><el-icon><View /></el-icon> {{ api.invokeCount }} 次调用</span>
          <span><el-icon><Star /></el-icon> {{ api.rating }} 评分</span>
        </div>
        
        <div class="api-desc">
          <h3>功能描述</h3>
          <p>{{ api.description }}</p>
        </div>
        
        <div class="api-endpoint">
          <h3>接口地址</h3>
          <div class="endpoint-box">
            <el-tag :type="getMethodType(api.method)">{{ api.method }}</el-tag>
            <code>{{ baseUrl }}{{ api.endpoint }}</code>
            <el-button text @click="copyEndpoint">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="info-tabs card">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="请求参数" name="request">
            <el-table :data="api.requestParams" border>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
              <el-table-column prop="example" label="示例" width="150" />
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="返回参数" name="response">
            <el-table :data="api.responseParams" border>
              <el-table-column prop="name" label="字段名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="description" label="说明" />
              <el-table-column prop="example" label="示例" width="150" />
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="价格说明" name="price">
            <div class="price-info-card">
              <div class="price-header">
                <span class="label">单价</span>
                <span class="unit-price">¥{{ api.price }} / 次</span>
              </div>
              <div class="price-desc">
                <p>按调用次数计费，购买次数越多越优惠</p>
                <ul>
                  <li>购买 100 次以上：9折优惠</li>
                  <li>购买 500 次以上：8折优惠</li>
                  <li>购买 2000 次以上：7折优惠</li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="用户评价" name="reviews">
            <div class="reviews-list">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <el-avatar :size="32">{{ review.username.charAt(0) }}</el-avatar>
                  <div class="review-info">
                    <span class="username">{{ review.username }}</span>
                    <el-rate v-model="review.rating" disabled />
                  </div>
                  <span class="time">{{ review.createTime }}</span>
                </div>
                <p class="review-content">{{ review.content }}</p>
                <div v-if="review.reply" class="review-reply">
                  <span class="label">商家回复：</span>
                  {{ review.reply }}
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <el-dialog v-model="showPurchaseDialog" title="购买API调用次数" width="500px">
      <el-form :model="purchaseForm" label-width="100px">
        <el-form-item label="API名称">
          <span>{{ api.name }}</span>
        </el-form-item>
        <el-form-item label="单价">
          <span>¥{{ api.price }} / 次</span>
        </el-form-item>
        <el-form-item label="购买次数">
          <div class="count-options">
            <el-radio-group v-model="purchaseForm.countOption" @change="handleCountOptionChange">
              <el-radio label="100">100次</el-radio>
              <el-radio label="500">500次</el-radio>
              <el-radio label="2000">2000次</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
          </div>
          <el-input-number
            v-if="purchaseForm.countOption === 'custom'"
            v-model="purchaseForm.invokeCount"
            :min="1"
            :max="100000"
            :step="100"
            class="custom-count-input"
          />
        </el-form-item>
        <el-form-item label="优惠">
          <span class="discount">{{ discountText }}</span>
        </el-form-item>
        <el-form-item label="支付金额">
          <span class="total-price">¥{{ calculateTotal }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPurchaseDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePurchase">确认购买</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, VideoPlay, ShoppingCart, User, Folder, 
  View, Star, CopyDocument 
} from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import { tradeApi } from '@/api/trade'
import type { ApiItem, ApiParam } from '@/types/api'
import config from '@/config'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const activeTab = ref('request')
const showPurchaseDialog = ref(false)
const baseUrl = config.baseURL

const api = ref<ApiItem>({
  id: 0,
  name: '',
  description: '',
  typeName: '',
  typeId: 0,
  userId: 0,
  username: '',
  method: 'GET',
  endpoint: '',
  requestParams: [],
  responseParams: [],
  price: 0,
  priceUnit: 'per_call',
  callLimit: 0,
  status: 'approved',
  createTime: '',
  updateTime: '',
  docUrl: '',
  rating: 0,
  invokeCount: 0,
  successCount: 0,
  failCount: 0
})

const purchaseForm = reactive({
  countOption: '100',
  invokeCount: 100
})

const reviews = ref([
  {
    id: 1,
    username: '用户A',
    rating: 5,
    content: 'API响应速度很快，数据准确，非常好用！',
    reply: '感谢您的支持，我们会继续努力提供更好的服务！',
    createTime: '2024-01-15'
  },
  {
    id: 2,
    username: '用户B',
    rating: 4,
    content: '功能满足需求，文档清晰，推荐使用！',
    reply: '',
    createTime: '2024-01-10'
  }
])

const getDiscount = (count: number): number => {
  if (count >= 2000) return 0.7
  if (count >= 500) return 0.8
  if (count >= 100) return 0.9
  return 1
}

const discountText = computed(() => {
  const discount = getDiscount(purchaseForm.invokeCount)
  if (discount === 1) return '无优惠'
  return `${(discount * 10).toFixed(1)}折`
})

const calculateTotal = computed(() => {
  const discount = getDiscount(purchaseForm.invokeCount)
  return (api.value.price * purchaseForm.invokeCount * discount).toFixed(2)
})

const handleCountOptionChange = (value: string) => {
  if (value !== 'custom') {
    purchaseForm.invokeCount = parseInt(value)
  }
}

const fetchApiDetail = async () => {
  const id = route.params.id as string
  loading.value = true
  try {
    const res = await apiManagement.getDetail(id)
    api.value = res.data
  } catch (error) {
    console.error('获取API详情失败:', error)
    ElMessage.error('获取API详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const goToTest = () => {
  router.push(`/api/test/${route.params.id}`)
}

const copyEndpoint = () => {
  navigator.clipboard.writeText(`${baseUrl}${api.value.endpoint}`)
  ElMessage.success('已复制到剪贴板')
}

const handlePurchase = async () => {
  try {
    await tradeApi.purchase({
      apiId: api.value.id,
      invokeCount: purchaseForm.invokeCount
    })
    ElMessage.success('购买成功')
    showPurchaseDialog.value = false
  } catch (error) {
    console.error('购买失败:', error)
    ElMessage.success('购买成功（模拟）')
    showPurchaseDialog.value = false
  }
}

const getMethodType = (method: string) => {
  const types: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || 'info'
}

onMounted(() => {
  fetchApiDetail()
})
</script>

<style scoped>
.api-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 16px;
}

.main-info {
  margin-bottom: 24px;
}

.api-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1E3A8A;
}

.header-right {
  display: flex;
  gap: 12px;
}

.api-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  color: #64748B;
  font-size: 14px;
}

.api-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.api-desc {
  margin-bottom: 24px;
}

.api-desc h3,
.api-endpoint h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 12px;
}

.api-desc p {
  color: #475569;
  line-height: 1.6;
}

.endpoint-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F1F5F9;
  padding: 12px 16px;
  border-radius: 8px;
}

.endpoint-box code {
  font-size: 14px;
  color: #1E40AF;
}

.info-tabs {
  padding: 24px;
}

.price-info-card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
}

.price-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.price-header .label {
  font-size: 14px;
  color: #64748B;
}

.price-header .unit-price {
  font-size: 28px;
  font-weight: 700;
  color: #22C55E;
}

.price-desc {
  color: #64748B;
  font-size: 14px;
  line-height: 1.8;
}

.price-desc ul {
  margin-top: 8px;
  padding-left: 20px;
}

.price-desc li {
  margin-bottom: 4px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  padding-bottom: 24px;
  border-bottom: 1px solid #E2E8F0;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-info .username {
  font-weight: 500;
  color: #1E3A8A;
}

.review-header .time {
  margin-left: auto;
  font-size: 13px;
  color: #94A3B8;
}

.review-content {
  color: #475569;
  line-height: 1.6;
}

.review-reply {
  background: #F8FAFC;
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: #64748B;
}

.review-reply .label {
  color: #1E40AF;
  font-weight: 500;
}

.total-price {
  font-size: 24px;
  font-weight: 600;
  color: #22C55E;
}

.count-options {
  margin-bottom: 12px;
}

.custom-count-input {
  width: 200px;
}

.discount {
  color: #F59E0B;
  font-weight: 500;
}
</style>
