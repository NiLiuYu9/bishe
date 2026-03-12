<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="header-content">
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
              <router-link to="/user/my-apis" class="nav-item">我的API</router-link>
              <router-link to="/user/orders" class="nav-item">我的订单</router-link>
              <router-link to="/user/quota" class="nav-item">调用额度</router-link>
              <router-link to="/user/my-requirements" class="nav-item">我的需求</router-link>
              <router-link to="/user/statistics" class="nav-item">统计分析</router-link>
              <router-link to="/user/profile" class="nav-item">个人资料</router-link>
              <router-link v-if="userStore.userInfo?.isAdmin === 1" to="/admin" class="nav-item">管理后台</router-link>
            </template>
          </nav>
          
          <div class="header-right">
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
              <el-button type="primary" @click="router.push('/login')">登录</el-button>
              <el-button @click="router.push('/register')">注册</el-button>
            </template>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
      
      <el-footer class="footer">
        <div class="footer-content">
          <div class="footer-links">
            <a href="#">关于我们</a>
            <a href="#">帮助中心</a>
            <a href="#">服务协议</a>
            <a href="#">隐私政策</a>
          </div>
          <div class="copyright">
            © 2024 API Market. All rights reserved.
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, SwitchButton, User } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')

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
}

.header-content {
  max-width: 1700px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1E40AF;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  white-space: nowrap;
  flex-shrink: 1;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 140px;
  flex-shrink: 0;
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

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer-links a {
  color: #93C5FD;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #fff;
}

.copyright {
  color: #93C5FD;
  font-size: 14px;
}
</style>
