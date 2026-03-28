<template>
  <div class="my-apis-page">
    <div class="page-header">
      <h2 class="page-title">我的API</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> 上架新API
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="已上架" name="approved" />
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="已下架" name="offline" />
    </el-tabs>
    
    <div class="api-list" v-loading="loading">
      <el-table :data="apiList" border>
        <el-table-column prop="name" label="API名称" min-width="150">
          <template #default="{ row }">
            <div class="api-name-cell">
              <MethodTag :method="row.method" size="small" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="类型" width="120" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}/{{ getPriceUnit(row.priceUnit) }}
          </template>
        </el-table-column>
        <el-table-column prop="invokeCount" label="调用次数" width="100" />
        <el-table-column prop="rating" label="评分" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" type="api" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editApi(row)">编辑</el-button>
            <el-button text type="primary" @click="viewStatistics(row)">统计</el-button>
            <el-button text type="primary" @click="openWhitelistDialog(row)">白名单</el-button>
            <el-button text type="primary" @click="openReviewsDialog(row)">评价</el-button>
            <el-button 
              v-if="row.status === 'approved'" 
              text 
              type="warning" 
              @click="offlineApi(row)"
            >
              下架
            </el-button>
            <el-button 
              v-if="row.status === 'offline'" 
              text 
              type="success" 
              @click="onlineApi(row)"
            >
              上架
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchApiList"
          @size-change="fetchApiList"
        />
      </div>
    </div>
    
    <ApiCreateDialog 
      v-model="showCreateDialog" 
      :editing-api="editingApi" 
      :types="types" 
      @success="handleDialogSuccess" 
    />

    <el-dialog v-model="showWhitelistDialog" title="白名单管理" width="600px">
      <div class="whitelist-header">
        <el-switch 
          v-model="whitelistEnabled" 
          active-text="已启用" 
          inactive-text="已关闭"
          @change="handleWhitelistSwitch"
        />
      </div>
      <div class="whitelist-add" style="margin: 16px 0;">
        <el-input 
          v-model="newUsername" 
          placeholder="输入用户名添加白名单" 
          style="width: 200px; margin-right: 10px;"
        />
        <el-button type="primary" @click="addWhitelistUser">添加</el-button>
      </div>
      <el-table :data="whitelistUsers" v-loading="whitelistLoading" border>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="createTime" label="添加时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button text type="danger" @click="removeWhitelistUser(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="margin-top: 16px;">
        <el-pagination
          v-model:current-page="whitelistPagination.page"
          v-model:page-size="whitelistPagination.pageSize"
          :total="whitelistTotal"
          layout="total, prev, pager, next"
          @current-change="fetchWhitelistUsers"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="showReviewsDialog" title="API评价列表" width="700px">
      <el-table :data="reviewsList" v-loading="reviewsLoading" border>
        <el-table-column prop="username" label="评价用户" width="120" />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="150" />
        <el-table-column label="回复" min-width="150">
          <template #default="{ row }">
            <span v-if="row.replies && row.replies.length > 0">{{ row.replies.length }}条回复</span>
            <el-button v-else text type="primary" @click="openReplyDialog(row)">回复</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评价时间" width="180" />
      </el-table>
      <div class="pagination" style="margin-top: 16px;">
        <el-pagination
          v-model:current-page="reviewsPagination.page"
          v-model:page-size="reviewsPagination.pageSize"
          :total="reviewsTotal"
          layout="total, prev, pager, next"
          @current-change="fetchReviewsList"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="showReplyDialog" title="回复评价" width="500px">
      <el-input 
        v-model="replyContent" 
        type="textarea" 
        :rows="4" 
        placeholder="请输入回复内容"
      />
      <template #footer>
        <el-button @click="showReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import { whitelistApi, type WhitelistUser } from '@/api/whitelist'
import { reviewApi, type ApiReview } from '@/api/review'
import type { ApiItem, ApiType } from '@/types/api'
import ApiCreateDialog from '@/components/ApiCreateDialog.vue'
import { getMethodType, getStatusInfo, API_STATUS } from '@/utils/status'
import { getPriceUnit } from '@/utils/format'
import StatusTag from '@/components/StatusTag.vue'
import MethodTag from '@/components/MethodTag.vue'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const showCreateDialog = ref(false)
const editingApi = ref<ApiItem | null>(null)

const apiList = ref<ApiItem[]>([])
const total = ref(0)

const types = ref<ApiType[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const showWhitelistDialog = ref(false)
const whitelistLoading = ref(false)
const whitelistEnabled = ref(false)
const whitelistUsers = ref<WhitelistUser[]>([])
const whitelistTotal = ref(0)
const newUsername = ref('')
const currentApiId = ref<number | null>(null)
const whitelistPagination = reactive({
  page: 1,
  pageSize: 10
})

const showReviewsDialog = ref(false)
const reviewsLoading = ref(false)
const reviewsList = ref<ApiReview[]>([])
const reviewsTotal = ref(0)
const reviewsPagination = reactive({
  page: 1,
  pageSize: 10
})

const showReplyDialog = ref(false)
const replyContent = ref('')
const currentReviewId = ref<number | null>(null)

const openCreateDialog = () => {
  editingApi.value = null
  showCreateDialog.value = true
}

const fetchApiList = async () => {
  loading.value = true
  try {
    const res = await apiManagement.getMyApis({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    })
    apiList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取API列表失败:', error)
    apiList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page = 1
  fetchApiList()
}

const editApi = (api: ApiItem) => {
  editingApi.value = api
  showCreateDialog.value = true
}

const viewStatistics = (api: ApiItem) => {
  router.push({ path: '/user/statistics', query: { apiId: api.id } })
}

const offlineApi = async (api: ApiItem) => {
  try {
    await ElMessageBox.confirm('确定要下架该API吗？下架后已购买的调用次数仍可正常使用。', '提示', {
      type: 'warning'
    })
    await apiManagement.updateStatus(api.id, { status: 'offline' })
    ElMessage.success('下架成功')
    fetchApiList()
  } catch (error) {
    console.error('下架失败:', error)
  }
}

const onlineApi = async (api: ApiItem) => {
  try {
    await apiManagement.updateStatus(api.id, { status: 'pending' })
    ElMessage.success('已提交上架申请')
    fetchApiList()
  } catch (error) {
    console.error('上架失败:', error)
  }
}

const handleDialogSuccess = () => {
  fetchApiList()
}

const fetchTypes = async () => {
  try {
    const res = await apiManagement.getTypes()
    types.value = res.data?.list || []
  } catch (error) {
    console.error('获取类型列表失败:', error)
    types.value = []
  }
}

const openWhitelistDialog = async (api: ApiItem) => {
  currentApiId.value = api.id
  whitelistEnabled.value = api.whitelistEnabled === 1
  whitelistPagination.page = 1
  showWhitelistDialog.value = true
  await fetchWhitelistUsers()
}

const fetchWhitelistUsers = async () => {
  if (!currentApiId.value) return
  whitelistLoading.value = true
  try {
    const res = await whitelistApi.getList(currentApiId.value, whitelistPagination.page, whitelistPagination.pageSize)
    whitelistUsers.value = res.data.list || []
    whitelistTotal.value = res.data.total || 0
  } catch (error) {
    console.error('获取白名单列表失败:', error)
    whitelistUsers.value = []
    whitelistTotal.value = 0
  } finally {
    whitelistLoading.value = false
  }
}

const addWhitelistUser = async () => {
  if (!currentApiId.value || !newUsername.value.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  try {
    await whitelistApi.add(currentApiId.value, [newUsername.value.trim()])
    ElMessage.success('添加成功')
    newUsername.value = ''
    whitelistEnabled.value = true
    await fetchWhitelistUsers()
  } catch (error) {
    console.error('添加白名单失败:', error)
  }
}

const removeWhitelistUser = async (user: WhitelistUser) => {
  if (!currentApiId.value) return
  try {
    await ElMessageBox.confirm('确定要移除该用户吗？', '提示', { type: 'warning' })
    await whitelistApi.remove(currentApiId.value, user.userId)
    ElMessage.success('移除成功')
    await fetchWhitelistUsers()
  } catch (error) {
    console.error('移除白名单失败:', error)
  }
}

const handleWhitelistSwitch = async (val: boolean) => {
  if (!currentApiId.value) return
  try {
    if (val) {
      if (whitelistUsers.value.length === 0) {
        ElMessage.warning('开启白名单前必须先添加白名单用户')
        whitelistEnabled.value = false
        return
      }
      await whitelistApi.enable(currentApiId.value)
      ElMessage.success('白名单已启用')
    } else {
      await whitelistApi.disable(currentApiId.value)
      ElMessage.success('白名单已关闭')
    }
    fetchApiList()
  } catch (error) {
    console.error('操作失败:', error)
    whitelistEnabled.value = !val
  }
}

const openReviewsDialog = async (api: ApiItem) => {
  currentApiId.value = api.id
  reviewsPagination.page = 1
  showReviewsDialog.value = true
  await fetchReviewsList()
}

const fetchReviewsList = async () => {
  if (!currentApiId.value) return
  reviewsLoading.value = true
  try {
    const res = await reviewApi.getList(currentApiId.value, reviewsPagination.page, reviewsPagination.pageSize, true)
    reviewsList.value = res.data.list || []
    reviewsTotal.value = res.data.total || 0
  } catch (error) {
    console.error('获取评价列表失败:', error)
    reviewsList.value = []
    reviewsTotal.value = 0
  } finally {
    reviewsLoading.value = false
  }
}

const openReplyDialog = (review: ApiReview) => {
  currentReviewId.value = review.id
  replyContent.value = ''
  showReplyDialog.value = true
}

const submitReply = async () => {
  if (!currentReviewId.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await reviewApi.publisherReply(currentReviewId.value, replyContent.value.trim())
    ElMessage.success('回复成功')
    showReplyDialog.value = false
    await fetchReviewsList()
  } catch (error) {
    console.error('回复失败:', error)
  }
}

onMounted(() => {
  fetchApiList()
  fetchTypes()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.api-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
