<template>
  <div class="quota-page">
    <h2 class="page-title">我的调用次数</h2>
    
    <div class="search-bar">
      <el-input
        v-model="searchApiName"
        placeholder="请输入API名称搜索"
        clearable
        style="width: 300px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    
    <div class="quota-list" v-loading="loading">
      <div v-if="quotas.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无调用配额" />
      </div>
      
      <div v-else class="quota-cards">
        <div v-for="quota in quotas" :key="quota.id" class="quota-card">
          <div class="quota-header">
            <h4 class="api-name">{{ quota.apiName }}</h4>
            <el-tag :type="getQuotaStatusType(quota.remainingCount)">
              {{ getQuotaStatusText(quota.remainingCount) }}
            </el-tag>
          </div>
          
          <div class="quota-body">
            <div class="quota-progress">
              <div class="progress-info">
                <span class="label">已使用 / 总次数</span>
                <span class="value">{{ quota.usedCount }} / {{ quota.totalCount }}</span>
              </div>
              <el-progress
                :percentage="getPercentage(quota.usedCount, quota.totalCount)"
                :status="getProgressStatus(quota.remainingCount)"
              />
            </div>
            
            <div class="quota-stats">
              <div class="stat-item">
                <span class="stat-label">剩余次数</span>
                <span class="stat-value" :class="{ warning: quota.remainingCount <= 10 }">
                  {{ quota.remainingCount }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">使用率</span>
                <span class="stat-value">
                  {{ getPercentage(quota.usedCount, quota.totalCount) }}%
                </span>
              </div>
            </div>
          </div>
          
          <div class="quota-footer">
            <span class="time-info">创建时间: {{ formatTime(quota.createTime) }}</span>
            <el-button type="primary" size="small" @click="goToApi(quota.apiId)">
              查看API
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { quotaApi } from '@/api/quota'
import type { UserQuota } from '@/api/quota'

const router = useRouter()

const loading = ref(false)
const quotas = ref<UserQuota[]>([])
const total = ref(0)
const searchApiName = ref('')

const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

const fetchQuotas = async () => {
  loading.value = true
  try {
    const res = await quotaApi.getQuotaList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      apiName: searchApiName.value || undefined
    })
    quotas.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取配额列表失败:', error)
    ElMessage.error('获取配额列表失败')
    quotas.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchQuotas()
}

const handleReset = () => {
  searchApiName.value = ''
  pagination.pageNum = 1
  fetchQuotas()
}

const handleSizeChange = () => {
  pagination.pageNum = 1
  fetchQuotas()
}

const handlePageChange = () => {
  fetchQuotas()
}

const goToApi = (apiId: number) => {
  router.push(`/api/${apiId}`)
}

const getPercentage = (used: number, total: number) => {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

const getQuotaStatusType = (remaining: number) => {
  if (remaining <= 0) return 'danger'
  if (remaining <= 10) return 'warning'
  return 'success'
}

const getQuotaStatusText = (remaining: number) => {
  if (remaining <= 0) return '已用尽'
  if (remaining <= 10) return '即将用尽'
  return '正常'
}

const getProgressStatus = (remaining: number): '' | 'success' | 'warning' | 'exception' => {
  if (remaining <= 0) return 'exception'
  if (remaining <= 10) return 'warning'
  return 'success'
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

onMounted(() => {
  fetchQuotas()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.quota-list {
  min-height: 400px;
}

.quota-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quota-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.quota-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quota-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.api-name {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
  margin: 0;
}

.quota-body {
  margin-bottom: 16px;
}

.quota-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-info .label {
  font-size: 14px;
  color: #64748B;
}

.progress-info .value {
  font-size: 14px;
  font-weight: 500;
  color: #1E3A8A;
}

.quota-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748B;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1E3A8A;
}

.stat-value.warning {
  color: #E6A23C;
}

.quota-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.time-info {
  font-size: 13px;
  color: #64748B;
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
