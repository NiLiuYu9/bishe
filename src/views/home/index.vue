<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-bg-animation">
        <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
      </div>
      <div class="hero-content">
        <h1>发现、购买、上架API</h1>
        <p class="hero-subtitle">一站式API交易平台，连接开发者与创新应用</p>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索API名称、功能描述、作者名..."
            size="large"
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="smart-match-btn">
          <el-button type="success" size="large" @click="handleSmartMatch">
            <el-icon><MagicStick /></el-icon>
            智能匹配需求
          </el-button>
        </div>
      </div>
    </section>
    
    <main class="main-content">
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
            <div class="favorite-btn" @click.stop="toggleFavorite(api)" v-if="userStore.isLoggedIn">
              <el-icon :size="20" :color="api.isFavorited ? '#f56c6c' : '#909399'">
                <StarFilled v-if="api.isFavorited" />
                <Star v-else />
              </el-icon>
            </div>
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
      
      <section class="requirements-section">
        <div class="section-header">
          <h2 class="section-title">需求广场</h2>
          <el-button text type="primary" @click="router.push('/requirement')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="requirement-cards">
          <div v-if="requirements.length === 0" class="empty-state">
            <el-empty description="暂无需求" />
          </div>
          <div
            v-else
            v-for="req in requirements"
            :key="req.id"
            class="requirement-card"
            @click="goToRequirementDetail(req.id)"
          >
            <div class="req-header">
              <h3>{{ req.title }}</h3>
              <StatusTag :status="req.status" type="requirement" size="small" />
            </div>
            <p class="req-desc">{{ req.description }}</p>
            <div class="req-meta">
              <span><el-icon><User /></el-icon> {{ req.username }}</span>
              <span><el-icon><Money /></el-icon> ¥{{ req.budget }}</span>
              <span><el-icon><Calendar /></el-icon> {{ req.deadline }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
    
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
    
    <el-dialog 
      v-model="showTagDialog" 
      title="设置技能标签" 
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="tag-dialog-content">
        <p class="tag-dialog-desc">请设置您的技能标签，系统将为您智能推荐匹配的需求</p>
        <TagInput v-model="userTags" placeholder="输入技能标签，如：Java、Vue、Python" />
      </div>
      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTagsAndMatch">保存并开始匹配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, ArrowRight, View, Star, StarFilled, Lock, 
  TrendCharts, Monitor, ChatDotRound,
  User, Money, Calendar, MagicStick
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiManagement, apiFavorite } from '@/api/api'
import { getPriceUnit } from '@/utils/format'
import { requirementApi } from '@/api/requirement'
import { tagApi } from '@/api/tag'
import { useUserStore } from '@/stores/user'
import StatusTag from '@/components/StatusTag.vue'
import TagInput from '@/components/TagInput.vue'
import type { ApiItem } from '@/types/api'
import type { Requirement } from '@/types/requirement'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const featuredApis = ref<ApiItem[]>([])
const requirements = ref<Requirement[]>([])
const showTagDialog = ref(false)
const userTags = ref<string[]>([])
const pendingMatch = ref(false)

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

const loadRequirements = async () => {
  try {
    const res = await requirementApi.getList({
      pageNum: 1,
      pageSize: 4
    })
    requirements.value = res.data.list
  } catch (error) {
    console.error('加载需求失败', error)
  }
}

onMounted(() => {
  loadFeaturedApis()
  loadRequirements()
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/api', query: { keyword: searchKeyword.value } })
  }
}

const goToApiDetail = (id: number) => {
  router.push(`/api/${id}`)
}

const goToRequirementDetail = (id: number) => {
  router.push(`/requirement/${id}`)
}

const toggleFavorite = async (api: ApiItem) => {
  try {
    if (api.isFavorited) {
      await apiFavorite.remove(api.id)
      api.isFavorited = false
      ElMessage.success('已取消收藏')
    } else {
      await apiFavorite.add(api.id)
      api.isFavorited = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

const handleSmartMatch = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再使用智能匹配功能')
    router.push('/login')
    return
  }
  
  try {
    const res = await tagApi.getUserTags()
    const tags = res.data || []
    
    if (tags.length === 0) {
      userTags.value = []
      pendingMatch.value = true
      showTagDialog.value = true
    } else {
      startMatching()
    }
  } catch (error) {
    console.error('获取用户标签失败', error)
    ElMessage.error('获取用户标签失败')
  }
}

const saveTagsAndMatch = async () => {
  if (userTags.value.length === 0) {
    ElMessage.warning('请至少添加一个技能标签')
    return
  }
  
  try {
    await tagApi.saveUserTags(userTags.value)
    ElMessage.success('标签保存成功')
    showTagDialog.value = false
    startMatching()
  } catch (error) {
    console.error('保存标签失败', error)
    ElMessage.error('保存标签失败')
  }
}

const startMatching = () => {
  router.push('/requirement?autoMatch=true')
}

const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 10
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}
</script>

<style scoped>
.home-page {
  width: 100%;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  position: relative;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.85) 50%, rgba(168, 85, 247, 0.85) 100%);
  border-radius: 16px;
  padding: 80px 48px;
  text-align: center;
  color: #fff;
  margin-bottom: 48px;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.search-box :deep(.el-input__wrapper):hover,
.search-box :deep(.el-input__wrapper):focus-within {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
}

.search-box :deep(.el-input__inner) {
  color: #fff;
  font-weight: 400;
}

.search-box :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.search-box :deep(.el-input-group__append) {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  box-shadow: none;
}

.search-box :deep(.el-input-group__append .el-button) {
  background: transparent;
  border: none;
  color: #fff;
}

.search-box :deep(.el-input-group__append .el-button:hover) {
  background: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  min-width: 0;
  margin-bottom: 48px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.featured-section {
  margin-bottom: 48px;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.api-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.api-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.favorite-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  background: #fff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.api-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.api-header :deep(.el-tag) {
  transition: all 0.3s;
}

.api-method {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.api-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.api-desc {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.api-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #94a3b8;
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
  border-top: 1px solid #f1f5f9;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #22C55E;
}

.requirements-section {
  margin-bottom: 48px;
}

.requirement-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.requirement-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.requirement-card:hover {
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.req-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.req-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  transition: color 0.3s;
}

.requirement-card:hover .req-header h3 {
  color: #667eea;
}

.req-desc {
  color: #64748B;
  margin-bottom: 16px;
  line-height: 1.6;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.req-meta {
  display: flex;
  gap: 16px;
  color: #94a3b8;
  font-size: 13px;
}

.req-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  padding: 48px 0;
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
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.feature-card:hover {
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  color: #667eea;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #64748B;
  line-height: 1.6;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.cta-buttons :deep(.el-button--primary) {
  background: #fff;
  color: #667eea;
  border-color: #fff;
}

.cta-buttons :deep(.el-button--primary:hover) {
  background: rgba(255, 255, 255, 0.9);
  border-color: #fff;
}

.cta-buttons :deep(.el-button:not(.el-button--primary)) {
  background: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.cta-buttons :deep(.el-button:not(.el-button--primary):hover) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.smart-match-btn {
  margin-top: 16px;
}

.smart-match-btn :deep(.el-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  backdrop-filter: blur(8px);
}

.smart-match-btn :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.tag-dialog-content {
  padding: 8px 0;
}

.tag-dialog-desc {
  color: #64748B;
  font-size: 14px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 48px 24px;
  }
  
  .hero-content h1 {
    font-size: 28px;
  }
  
  .api-grid {
    grid-template-columns: 1fr;
  }
  
  .requirement-cards {
    grid-template-columns: 1fr;
  }
}
</style>
