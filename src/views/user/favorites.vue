<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>
    
    <div class="favorites-list" v-loading="loading">
      <div v-if="favorites.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无收藏">
          <el-button type="primary" @click="router.push('/api')">去逛逛</el-button>
        </el-empty>
      </div>
      
      <div v-else class="favorite-cards">
        <div v-for="api in favorites" :key="api.id" class="favorite-card">
          <div class="card-header">
            <div class="api-info">
              <el-tag type="primary" size="small">{{ api.typeName }}</el-tag>
              <span class="api-method">{{ api.method }}</span>
            </div>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleRemove(api)"
            >
              <el-icon><Delete /></el-icon>
              取消收藏
            </el-button>
          </div>
          
          <div class="card-body" @click="goToDetail(api.id)">
            <h3 class="api-name">{{ api.name }}</h3>
            <p class="api-desc">{{ api.description }}</p>
            <div class="api-endpoint">
              <code>{{ api.endpoint }}</code>
            </div>
            <div class="api-stats">
              <span><el-icon><View /></el-icon> {{ api.invokeCount }} 次调用</span>
              <span><el-icon><Star /></el-icon> {{ api.rating }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="price-info">
              <span class="price">¥{{ api.price }}</span>
              <span class="unit">/{{ getPriceUnit(api.priceUnit) }}</span>
            </div>
            <div class="actions">
              <el-button size="small" @click="goToTest(api.id)">测试</el-button>
              <el-button type="primary" size="small" @click="goToDetail(api.id)">查看详情</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View, Star } from '@element-plus/icons-vue'
import { apiFavorite } from '@/api/api'
import type { ApiItem } from '@/types/api'
import { getPriceUnit } from '@/utils/format'

const router = useRouter()

const loading = ref(false)
const favorites = ref<ApiItem[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const fetchFavorites = async () => {
  loading.value = true
  try {
    const res = await apiFavorite.getList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    })
    favorites.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
    favorites.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleRemove = async (api: ApiItem) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该API吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await apiFavorite.remove(api.id)
    ElMessage.success('已取消收藏')
    fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }
}

const goToDetail = (id: number) => {
  router.push(`/api/${id}`)
}

const goToTest = (id: number) => {
  router.push(`/api/test/${id}`)
}

watch(() => pagination.page, () => {
  fetchFavorites()
})

watch(() => pagination.pageSize, () => {
  pagination.page = 1
  fetchFavorites()
})

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-page {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 24px;
}

.favorites-list {
  min-height: 400px;
}

.favorite-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  transition: all 0.2s;
}

.favorite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-method {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.card-body {
  padding: 16px;
  cursor: pointer;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.api-desc {
  font-size: 14px;
  color: #475569;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
}

.api-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #E2E8F0;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price {
  font-size: 18px;
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
  margin-top: 24px;
}

.empty-state {
  padding: 80px 0;
}
</style>
