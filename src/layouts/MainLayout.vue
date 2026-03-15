<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="logo" @click="router.push('/')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span class="logo-text">API Market</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" exact>首页</router-link>
          <router-link to="/api" class="nav-item">API市场</router-link>
          <router-link to="/requirement" class="nav-item">需求广场</router-link>
          <template v-if="userStore.isLoggedIn">
            <router-link to="/user/favorites" class="nav-item">我的收藏</router-link>
            <router-link v-if="userStore.userInfo?.isAdmin === 1" to="/admin" class="nav-item">管理后台</router-link>
          </template>
        </nav>
        
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索API..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-icon :size="18"><User /></el-icon>
                <span class="username">{{ userStore.userInfo?.username }}</span>
                <el-tag v-if="userStore.userInfo?.isAdmin === 1" type="danger" size="small" style="margin-left: 4px;">管理员</el-tag>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="router.push('/register')">注册</el-button>
            <el-button type="primary" @click="router.push('/login')">登录</el-button>
          </template>
        </div>
      </el-header>
      
      <div class="layout-wrapper">
        <Sidebar 
          v-if="showSidebar"
          :types="apiTypes"
          :active-type-id="activeTypeId"
          @type-click="handleTypeClick"
          @page-click="handlePageClick"
        />
        <div :class="['content-wrapper', { 'content-wrapper-full': !showSidebar }]">
          <el-main class="main-content">
            <router-view />
          </el-main>
          
          <el-footer class="footer">
            <div class="footer-content">
              <div class="copyright">
                © 2024 API Market. All rights reserved.
              </div>
            </div>
          </el-footer>
        </div>
      </div>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, SwitchButton, User } from '@element-plus/icons-vue'
import { apiManagement } from '@/api/api'
import type { ApiType } from '@/types/api'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchKeyword = ref('')
const apiTypes = ref<ApiType[]>([])
const activeTypeId = ref<number | ''>('')

const showSidebar = computed(() => {
  const path = route.path
  return path === '/' || path === '/api' || path === '/requirement'
})

const loadApiTypes = async () => {
  try {
    const res = await apiManagement.getApiTypes({ pageNum: 1, pageSize: 100 })
    apiTypes.value = res.data.list
  } catch (error) {
    console.error('加载API分类失败', error)
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/api', query: { keyword: searchKeyword.value } })
  }
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/')
  } else {
    router.push(command)
  }
}

const handleTypeClick = (typeId: number) => {
  activeTypeId.value = typeId
  router.push({ path: '/api', query: { typeId: typeId.toString() } })
}

const handlePageClick = (path: string) => {
  router.push(path)
}

watch(
  () => route.query.typeId,
  (newTypeId) => {
    if (newTypeId) {
      activeTypeId.value = Number(newTypeId)
    } else {
      activeTypeId.value = ''
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadApiTypes()
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1E40AF;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  height: 64px;
  padding: 0 16px;
  background: #fff;
  z-index: 101;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  gap: 28px;
  flex-wrap: nowrap;
  white-space: nowrap;
  margin-left: 180px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  padding-left: 40px;
}

.search-input {
  width: 420px;
  max-width: 500px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.nav-item {
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 17px;
}

.nav-item:hover,
.nav-item.router-link-exact-active {
  color: #1E40AF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #1E3A8A;
  font-weight: 500;
}

.layout-wrapper {
  display: flex;
  flex: 1;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 160px;
}

.content-wrapper-full {
  margin-left: 0;
}

.main-content {
  flex: 1;
  background: #EFF6FF;
  padding: 24px;
}

.footer {
  background: #1E3A8A;
  color: #fff;
  padding: 24px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  color: #93C5FD;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .nav-menu {
    margin-left: 0;
    gap: 16px;
  }
  
  .logo {
    position: static;
    background: transparent;
    padding: 0;
  }
  
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }
  
  .nav-menu {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
  
  .header-center {
    width: 100%;
    margin-top: 12px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }
  
  .layout-wrapper {
    flex-direction: column;
  }
  
  .content-wrapper {
    margin-left: 0;
  }
}
</style>
