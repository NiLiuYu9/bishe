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
            <el-tag type="primary" size="large">{{ api.typeName }}</el-tag>
            <span class="api-method-large">{{ api.method }}</span>
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
            <el-tag type="primary">{{ api.typeName }}</el-tag>
            <span class="endpoint-method">{{ api.method }}</span>
            <code>{{ baseUrl }}{{ api.endpoint }}</code>
            <el-button text @click="copyEndpoint">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
        
        <div v-if="api.docUrl" class="api-doc">
          <h3>技术文档</h3>
          <div class="doc-box">
            <el-icon><Document /></el-icon>
            <a href="javascript:void(0)" @click="goToDocPage">{{ api.docUrl }}</a>
            <el-button text @click="goToDocPage">
              <el-icon><Link /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="info-sections">
        <div class="params-wrapper">
          <div class="section card param-section">
            <ParamTable :params="api.requestParams" title="请求参数" />
          </div>

          <div class="section card param-section">
            <ParamTable :params="api.responseParams" title="返回参数" />
          </div>
        </div>

        <div v-if="showAuditButtons" class="audit-actions card">
          <div class="audit-title">审核操作</div>
          <div class="audit-buttons">
            <el-button type="danger" @click="showRejectDialog = true">
              <el-icon><Close /></el-icon> 拒绝
            </el-button>
            <el-button type="success" @click="handleApprove">
              <el-icon><Check /></el-icon> 通过
            </el-button>
          </div>
        </div>

        <div class="section card">
          <h3 class="section-title">用户评价 ({{ reviewsTotal }})</h3>
          <div class="reviews-list">
            <ReviewThread
              v-for="review in reviews"
              :key="review.id"
              :review="review"
              :api-user-id="api.userId"
              :current-user-id="currentUserId"
              @refresh="fetchReviews"
            />
            <div v-if="reviews.length === 0" class="empty-reviews">
              <el-empty description="暂无评价" />
            </div>
          </div>
          <div v-if="reviews.length < reviewsTotal" class="load-more">
            <el-button 
              type="primary" 
              plain 
              :loading="loadingReviews" 
              @click="loadMoreReviews"
            >
              加载更多
            </el-button>
          </div>
        </div>
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
        <div class="discount-info">
          <p><el-icon><InfoFilled /></el-icon> 优惠说明：</p>
          <ul>
            <li>购买 100 次以上：9折优惠</li>
            <li>购买 500 次以上：8折优惠</li>
            <li>购买 2000 次以上：7折优惠</li>
          </ul>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showPurchaseDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePurchase">确认购买</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showRejectDialog" title="拒绝原因" width="400px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认拒绝</el-button>
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
  View, Star, CopyDocument, InfoFilled, Check, Close, Document, Link
} from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import { tradeApi } from '@/api/trade'
import { reviewApi, type ApiReview } from '@/api/review'
import { adminApi } from '@/api/admin'
import type { ApiItem, ApiParam } from '@/types/api'
import config from '@/config'
import { useUserStore } from '@/stores/user'
import { getMethodType } from '@/utils/status'
import ReviewThread from '@/components/ReviewThread.vue'
import ParamTable from '@/components/ParamTable.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const loadingReviews = ref(false)
const showPurchaseDialog = ref(false)
const showRejectDialog = ref(false)
const baseUrl = config.baseURL
const reviewsPage = ref(1)
const reviewsTotal = ref(0)
const currentUserId = computed(() => userStore.userInfo?.id || 0)

const showAuditButtons = computed(() => {
  const isAdmin = userStore.userInfo?.isAdmin === 1
  const isFromAdmin = route.query.from === 'admin'
  const isPending = api.value.status === 'pending'
  return isAdmin && isFromAdmin && isPending
})

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

const rejectForm = reactive({ reason: '' })

const reviews = ref<ApiReview[]>([])

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

const fetchReviews = async (page = 1, append = false) => {
  const id = route.params.id as string
  loadingReviews.value = true
  try {
    const res = await reviewApi.getList(parseInt(id), page, 10, true)
    if (append) {
      reviews.value = [...reviews.value, ...(res.data.list || [])]
    } else {
      reviews.value = res.data.list || []
    }
    reviewsTotal.value = res.data.total || 0
    reviewsPage.value = page
  } catch (error) {
    console.error('获取评价数据失败:', error)
  } finally {
    loadingReviews.value = false
  }
}

const loadMoreReviews = () => {
  fetchReviews(reviewsPage.value + 1, true)
}

const goToTest = () => {
  router.push(`/api/test/${route.params.id}`)
}

const copyEndpoint = () => {
  navigator.clipboard.writeText(`${baseUrl}${api.value.endpoint}`)
  ElMessage.success('已复制到剪贴板')
}

const goToDocPage = () => {
  router.push({
    path: `/api/doc/${route.params.id}`,
    query: {
      name: api.value.name,
      endpoint: api.value.endpoint,
      method: api.value.method
    }
  })
}

const handlePurchase = async () => {
  try {
    const res = await tradeApi.purchase({
      apiId: api.value.id,
      invokeCount: purchaseForm.invokeCount
    })
    ElMessage.success('订单创建成功，请前往订单页面完成支付')
    showPurchaseDialog.value = false
    router.push('/user/orders')
  } catch (error: any) {
    console.error('创建订单失败:', error)
    ElMessage.error(error.message || '创建订单失败，请重试')
  }
}

const handleApprove = async () => {
  try {
    await adminApi.updateApiStatus(api.value.id, { status: 'approved' })
    ElMessage.success('审核通过')
    router.push('/admin/apis')
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

const handleReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  try {
    await adminApi.updateApiStatus(api.value.id, { 
      status: 'rejected', 
      reason: rejectForm.reason 
    })
    ElMessage.success('已拒绝')
    showRejectDialog.value = false
    router.push('/admin/apis')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchApiDetail()
  fetchReviews()
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

.api-method-large {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
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

.endpoint-method {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
}

.api-doc {
  margin-top: 24px;
}

.doc-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #EFF6FF;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #BFDBFE;
}

.doc-box a {
  color: #1E40AF;
  text-decoration: none;
  font-size: 14px;
  word-break: break-all;
  flex: 1;
}

.doc-box a:hover {
  text-decoration: underline;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.params-wrapper {
  display: flex;
  gap: 24px;
}

.param-section {
  flex: 1;
}

@media (max-width: 992px) {
  .params-wrapper {
    flex-direction: column;
  }
}

.section {
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 16px;
}

.empty-reviews {
  padding: 32px 0;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.discount-info {
  background: #FFFBEB;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #78350F;
}

.discount-info p {
  margin: 0 0 8px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.discount-info ul {
  margin: 0;
  padding-left: 20px;
}

.discount-info li {
  margin-bottom: 4px;
}

.audit-actions {
  margin-top: 24px;
  padding: 24px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
}

.audit-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 16px;
}

.audit-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
