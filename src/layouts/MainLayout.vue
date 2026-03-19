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
            <div class="quick-use-wrapper" @mouseenter="showDropdown" @mouseleave="hideDropdown">
              <el-button text class="quick-use-btn">
                <el-icon><Document /></el-icon>
                快速使用
              </el-button>
              <div class="quick-use-dropdown" :class="{ 'show': isDropdownVisible }">
                <div class="dropdown-header">
                  <span class="dropdown-title">API调用客户端</span>
                  <el-button text class="copy-btn" :class="{ 'copied': isCopied }" @click="copyCode">
                    <el-icon><component :is="copyButtonIcon" /></el-icon>
                    {{ copyButtonText }}
                  </el-button>
                </div>
                <pre class="code-content"><code>{{ apiClientCode }}</code></pre>
              </div>
            </div>
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
import { Search, SwitchButton, User, Document, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiManagement } from '@/api/api'
import type { ApiType } from '@/types/api'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const apiClientCode = `import cn.hutool.crypto.digest.DigestAlgorithm;
import cn.hutool.crypto.digest.Digester;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * API调用客户端 - 填入配置即可使用
 */
public class ApiClient {

    // ==================== 配置区域（必填） ====================
    private static final String ACCESS_KEY = "your_access_key";
    private static final String SECRET_KEY = "your_secret_key";
    private static final String GATEWAY_HOST = "http://localhost:8080";
    // =======================================================

    private final String accessKey;
    private final String secretKey;
    private final String gatewayHost;

    // ==================== 使用示例 ====================
    public static void main(String[] args) {
        ApiClient client = new ApiClient(ACCESS_KEY, SECRET_KEY, GATEWAY_HOST);

        // GET请求
        Map<String, Object> getParams = new HashMap<>();
        getParams.put("userId", 123);
        System.out.println(client.get("/api/user/info", getParams));

        // POST请求
        Map<String, Object> postParams = new HashMap<>();
        postParams.put("username", "test");
        System.out.println(client.post("/api/user/create", postParams));
    }

    public ApiClient(String accessKey, String secretKey, String gatewayHost) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.gatewayHost = gatewayHost;
    }

    public String request(String method, String path, Map<String, Object> params) {
        String body = params == null ? "" : JSONUtil.toJsonStr(params);
        String url = gatewayHost + path;

        HttpRequest httpRequest;
        if ("GET".equalsIgnoreCase(method)) {
            httpRequest = HttpRequest.get(url);
            if (params != null) {
                params.forEach((key, value) -> httpRequest.form(key, value));
            }
        } else if ("POST".equalsIgnoreCase(method)) {
            httpRequest = HttpRequest.post(url).body(body);
        } else {
            throw new IllegalArgumentException("不支持的HTTP方法: " + method);
        }

        buildHeaders(body).forEach(httpRequest::header);
        return httpRequest.execute().body();
    }

    public String get(String path, Map<String, Object> params) {
        return request("GET", path, params);
    }

    public String post(String path, Map<String, Object> params) {
        return request("POST", path, params);
    }

    private Map<String, String> buildHeaders(String body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("accessKey", accessKey);
        headers.put("nonce", String.format("%04d", new Random().nextInt(10000)));
        headers.put("timestamp", String.valueOf(System.currentTimeMillis() / 1000));
        headers.put("body", body);
        headers.put("sign", genSign(body, secretKey));
        return headers;
    }

    private String genSign(String body, String secretKey) {
        return new Digester(DigestAlgorithm.SHA256).digestHex(body + "." + secretKey);
    }

}`;

const copyButtonText = ref('复制');
const copyButtonIcon = ref(DocumentCopy);
const isCopied = ref(false);

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(apiClientCode);
    isCopied.value = true;
    copyButtonText.value = '已复制';
    copyButtonIcon.value = Document;
    
    setTimeout(() => {
      isCopied.value = false;
      copyButtonText.value = '复制';
      copyButtonIcon.value = DocumentCopy;
    }, 2000);
  } catch (error) {
    ElMessage.error('复制失败，请手动复制');
  }
};

const isDropdownVisible = ref(false);
let hideTimeout: number | null = null;

const showDropdown = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  isDropdownVisible.value = true;
};

const hideDropdown = () => {
  hideTimeout = window.setTimeout(() => {
    isDropdownVisible.value = false;
  }, 200);
};

const searchKeyword = ref('')
const apiTypes = ref<ApiType[]>([])
const activeTypeId = ref<number | ''>('')

const showSidebar = computed(() => {
  const path = route.path
  return path === '/' || path === '/api' || path === '/requirement' || 
    path.startsWith('/api/') || path.startsWith('/requirement/')
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
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    router.push({ path: '/api', query: { keyword } })
  } else {
    router.push({ path: '/api' })
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

watch(
  () => route.query.keyword,
  (newKeyword) => {
    searchKeyword.value = newKeyword as string || ''
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

.quick-use-wrapper {
  position: relative;
}

.quick-use-btn {
  font-size: 14px;
  font-weight: 500;
  color: #1E40AF;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.quick-use-btn:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
}

.quick-use-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 750px;
  max-height: 520px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 
              0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-12px) scale(0.98);
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1), 
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-use-dropdown::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 32px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #ffffff;
  z-index: 1;
}

.quick-use-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.dropdown-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
}

.dropdown-title {
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #1E40AF, #3b82f6);
  border-radius: 2px;
}

.copy-btn {
  color: #1E40AF;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.copy-btn:active {
  transform: translateY(0);
}

.copy-btn.copied {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #86efac;
  color: #166534;
}

.copy-btn.copied:hover {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  border-color: #4ade80;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
}

.code-content {
  margin: 0;
  padding: 20px;
  max-height: 440px;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  font-size: 12.5px;
  line-height: 1.7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  position: relative;
}

.code-content::-webkit-scrollbar {
  width: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: #1e293b;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #475569, #64748b);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #64748b, #94a3b8);
}

.code-content code {
  display: block;
  white-space: pre;
  position: relative;
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
