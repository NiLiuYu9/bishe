<template>
  <div class="api-list-page">
    <div class="page-header">
      <h1 class="page-title">API市场</h1>
      <el-button type="primary" @click="router.push('/user/my-apis')" v-if="userStore.isLoggedIn">
        <el-icon><Plus /></el-icon> 上架API
      </el-button>
    </div>
    
    <div class="filter-section card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索API" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.typeId" placeholder="全部类型" clearable style="width: 140px">
            <el-option
              v-for="type in types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="filters.sortBy" placeholder="默认排序" style="width: 140px">
            <el-option label="默认排序" value="" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="评分最高" value="rating" />
            <el-option label="调用最多" value="invokeCount" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="api-list" v-loading="loading">
      <div v-if="apiList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无API数据" />
      </div>
      
      <div v-else class="api-grid">
        <div
          v-for="api in apiList"
          :key="api.id"
          class="api-card"
          @click="goToDetail(api.id)"
        >
          <div class="api-header">
            <el-tag :type="getMethodType(api.method)">{{ api.method }}</el-tag>
            <span class="api-type-name">{{ api.typeName }}</span>
          </div>
          <h3 class="api-name">{{ api.name }}</h3>
          <p class="api-desc">{{ api.description }}</p>
          <div class="api-endpoint">
            <code>{{ api.endpoint }}</code>
          </div>
          <div class="api-stats">
            <span><el-icon><View /></el-icon> {{ api.invokeCount }} 次调用</span>
            <span><el-icon><Star /></el-icon> {{ api.rating }}</span>
          </div>
          <div class="api-footer">
            <div class="price-info">
              <span class="price">¥{{ api.price }}</span>
              <span class="unit">/{{ getPriceUnit(api.priceUnit) }}</span>
            </div>
            <div class="actions">
              <el-button size="small" @click.stop="goToTest(api.id)">测试</el-button>
              <el-button type="primary" size="small">购买</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, View, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { apiManagement } from '@/api/api'
import type { ApiItem, ApiType } from '@/types/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const apiList = ref<ApiItem[]>([])
const total = ref(0)

const types = ref<ApiType[]>([])

const filters = reactive({
  keyword: '',
  typeId: '',
  sortBy: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 12
})

const fetchTypes = async () => {
  try {
    const res = await apiManagement.getTypes()
    types.value = res.data || []
  } catch (error) {
    console.error('获取类型列表失败:', error)
    types.value = []
  }
}

const fetchApiList = async () => {
  loading.value = true
  try {
    const res = await apiManagement.getList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      typeId: filters.typeId ? Number(filters.typeId) : undefined,
      sortBy: filters.sortBy.split('_')[0] as any,
      sortOrder: filters.sortBy.split('_')[1] as any
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

const handleSearch = () => {
  pagination.page = 1
  fetchApiList()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.typeId = ''
  filters.sortBy = ''
  pagination.page = 1
  fetchApiList()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchApiList()
}

const handlePageChange = () => {
  fetchApiList()
}

const goToDetail = (id: number) => {
  router.push(`/api/${id}`)
}

const goToTest = (id: number) => {
  router.push(`/api/test/${id}`)
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

const getPriceUnit = (unit: string) => {
  const units: Record<string, string> = {
    per_call: '次',
    per_month: '月',
    per_year: '年'
  }
  return units[unit] || unit
}

onMounted(() => {
  if (route.query.keyword) {
    filters.keyword = route.query.keyword as string
  }
  if (route.query.typeId) {
    filters.typeId = route.query.typeId as string
  }
  fetchTypes()
  fetchApiList()
})
</script>

<style scoped>
.api-list-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.api-list {
  min-height: 400px;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.api-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.api-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.api-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.api-type-name {
  font-size: 12px;
  color: #475569;
}

.api-name {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.api-desc {
  font-size: 14px;
  color: #475569;
  margin-bottom: 12px;
  line-height: 1.5;
}

.api-endpoint {
  background: #F1F5F9;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.api-endpoint code {
  font-size: 12px;
  color: #1E40AF;
}

.api-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748B;
  margin-bottom: 16px;
}

.api-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.api-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price {
  font-size: 20px;
  font-weight: 600;
  color: #22C55E;
}

.unit {
  font-size: 12px;
  color: #64748B;
}

.actions {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.empty-state {
  padding: 80px 0;
}
</style>
