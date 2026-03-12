<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1>发现、购买、上架API</h1>
        <p class="hero-subtitle">一站式API交易平台，连接开发者与创新应用</p>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索API名称、功能描述、作者名..."
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </section>
    
    <section class="categories-section">
      <h2 class="section-title">API分类</h2>
      <div class="categories-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="goToCategory(category.id)"
        >
          <div class="category-icon">
            <el-icon :size="32"><DataLine /></el-icon>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
          <span class="api-count">{{ category.apiCount || 0 }} 个API</span>
        </div>
      </div>
    </section>
    
    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-title">热门API</h2>
        <el-button text type="primary" @click="router.push('/api')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="api-grid">
        <div
          v-for="api in featuredApis"
          :key="api.id"
          class="api-card"
          @click="goToApiDetail(api.id)"
        >
          <div class="api-header">
            <el-tag type="primary">{{ api.typeName }}</el-tag>
            <span class="api-method">{{ api.method }}</span>
          </div>
          <h3 class="api-name">{{ api.name }}</h3>
          <p class="api-desc">{{ api.description }}</p>
          <div class="api-stats">
            <span><el-icon><View /></el-icon> {{ api.invokeCount }} 次调用</span>
            <span><el-icon><Star /></el-icon> {{ api.rating }}</span>
          </div>
          <div class="api-footer">
            <span class="price">¥{{ api.price }}/{{ getPriceUnit(api.priceUnit) }}</span>
            <el-button type="primary" size="small">查看详情</el-button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="features-section">
      <h2 class="section-title">为什么选择我们</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40"><Lock /></el-icon>
          </div>
          <h3>安全可靠</h3>
          <p>AccessKey/SecretKey身份验证，保障API调用安全</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40"><TrendCharts /></el-icon>
          </div>
          <h3>数据可视化</h3>
          <p>实时统计API调用数据，直观了解使用情况</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40"><Monitor /></el-icon>
          </div>
          <h3>在线测试</h3>
          <p>购买前免费测试，确保API符合需求</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40"><ChatDotRound /></el-icon>
          </div>
          <h3>需求定制</h3>
          <p>找不到合适的API？发布需求让开发者为您定制</p>
        </div>
      </div>
    </section>
    
    <section class="cta-section">
      <h2>开始您的API之旅</h2>
      <p>立即注册，上架您的API或购买所需服务</p>
      <div class="cta-buttons">
        <el-button type="primary" size="large" @click="router.push('/register')">
          免费注册
        </el-button>
        <el-button size="large" @click="router.push('/api')">
          浏览API
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, ArrowRight, View, Star, Lock, 
  TrendCharts, Monitor, ChatDotRound,
  DataLine, Document, Picture, Location, Money, More
} from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiType, ApiItem } from '@/types/api'

const router = useRouter()

const searchKeyword = ref('')

const categories = ref<ApiType[]>([])

const featuredApis = ref<ApiItem[]>([])

const loadFeaturedApis = async () => {
  try {
    const res = await apiManagement.getList({
      pageNum: 1,
      pageSize: 4,
      sortBy: 'invokeCount',
      sortOrder: 'desc'
    })
    featuredApis.value = res.data.list
  } catch (error) {
    console.error('加载热门API失败', error)
  }
}

const loadCategories = async () => {
  try {
    const res = await apiManagement.getApiTypes({ pageNum: 1, pageSize: 100 })
    categories.value = res.data.list
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

onMounted(() => {
  loadCategories()
  loadFeaturedApis()
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/api', query: { keyword: searchKeyword.value } })
  }
}

const goToCategory = (id: number) => {
  router.push({ path: '/api', query: { typeId: id.toString() } })
}

const goToApiDetail = (id: number) => {
  router.push(`/api/${id}`)
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
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
  border-radius: 16px;
  padding: 80px 48px;
  text-align: center;
  color: #fff;
  margin-bottom: 48px;
}

.hero-content h1 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.search-box {
  max-width: 600px;
  margin: 0 auto 24px;
}

.search-box :deep(.el-input__wrapper) {
  background: #fff;
  border-radius: 8px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 24px;
}

.categories-section {
  margin-bottom: 48px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-icon {
  width: 64px;
  height: 64px;
  background: #EFF6FF;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #1E40AF;
}

.category-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.category-card p {
  font-size: 14px;
  color: #475569;
  margin-bottom: 12px;
}

.api-count {
  font-size: 12px;
  color: #3B82F6;
}

.featured-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.api-method {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
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
  margin-bottom: 16px;
  line-height: 1.5;
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

.price {
  font-size: 18px;
  font-weight: 600;
  color: #22C55E;
}

.features-section {
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.feature-icon {
  color: #1E40AF;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #475569;
}

.cta-section {
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
  border-radius: 16px;
  padding: 64px 48px;
  text-align: center;
  color: #fff;
}

.cta-section h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.cta-section p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 48px 24px;
  }
  
  .hero-content h1 {
    font-size: 28px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
