<template>
  <div class="doc-page">
    <div class="doc-header">
      <div class="header-content">
        <div class="header-left">
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
          <el-divider direction="vertical" />
          <h1>{{ apiName }} 技术文档</h1>
        </div>
        <div class="header-right">
          <el-tag type="success" size="large">v1.0.0</el-tag>
          <el-button type="primary" @click="goToApiDetail">
            <el-icon><Link /></el-icon> 查看API详情
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="doc-container">
      <div class="doc-sidebar">
        <div class="sidebar-title">目录</div>
        <el-menu :default-active="activeSection" @select="handleMenuSelect">
          <el-menu-item index="overview">
            <el-icon><Document /></el-icon>
            <span>概述</span>
          </el-menu-item>
          <el-menu-item index="quickstart">
            <el-icon><Promotion /></el-icon>
            <span>快速开始</span>
          </el-menu-item>
          <el-menu-item index="auth">
            <el-icon><Key /></el-icon>
            <span>认证方式</span>
          </el-menu-item>
          <el-menu-item index="endpoint">
            <el-icon><Connection /></el-icon>
            <span>接口地址</span>
          </el-menu-item>
          <el-menu-item index="params">
            <el-icon><Setting /></el-icon>
            <span>请求参数</span>
          </el-menu-item>
          <el-menu-item index="response">
            <el-icon><DataAnalysis /></el-icon>
            <span>响应参数</span>
          </el-menu-item>
          <el-menu-item index="examples">
            <el-icon><DocumentCopy /></el-icon>
            <span>代码示例</span>
          </el-menu-item>
          <el-menu-item index="errors">
            <el-icon><Warning /></el-icon>
            <span>错误码</span>
          </el-menu-item>
          <el-menu-item index="faq">
            <el-icon><QuestionFilled /></el-icon>
            <span>常见问题</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="doc-content">
        <section id="overview" class="doc-section">
          <h2>概述</h2>
          <p class="section-desc">{{ apiName }} 是一款高效的API服务，提供稳定、快速的接口调用能力。</p>
          
          <div class="feature-list">
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <div class="feature-content">
                <h4>高可用性</h4>
                <p>99.9%的服务可用性保障，确保您的业务稳定运行</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <div class="feature-content">
                <h4>低延迟</h4>
                <p>平均响应时间小于100ms，提供极致的调用体验</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Check /></el-icon>
              <div class="feature-content">
                <h4>安全可靠</h4>
                <p>采用HTTPS加密传输，保障数据安全</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="quickstart" class="doc-section">
          <h2>快速开始</h2>
          <p class="section-desc">按照以下步骤快速接入API服务：</p>
          
          <div class="steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>注册账号</h4>
                <p>在平台注册账号并完成实名认证</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>获取密钥</h4>
                <p>在个人中心获取 AccessKey 和 SecretKey</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>购买服务</h4>
                <p>根据业务需求购买相应的调用次数</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>开始调用</h4>
                <p>参照文档示例代码进行接口调用</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="auth" class="doc-section">
          <h2>认证方式</h2>
          <p class="section-desc">API采用签名认证方式，确保请求的安全性。</p>
          
          <div class="auth-info">
            <h4>请求头参数</h4>
            <el-table :data="authHeaders" border stripe>
              <el-table-column prop="name" label="参数名" width="180" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>
          </div>
          
          <div class="code-block">
            <div class="code-header">
              <span>签名算法示例</span>
              <el-button text size="small" @click="copyCode('sign')">
                <el-icon><CopyDocument /></el-icon> 复制
              </el-button>
            </div>
            <pre><code id="sign-code">import hmac
import hashlib
import base64

def generate_signature(secret_key, timestamp, params):
    sorted_params = sorted(params.items())
    query_string = '&'.join([f'{k}={v}' for k, v in sorted_params])
    sign_str = f'{timestamp}{query_string}'
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_str.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(signature).decode('utf-8')</code></pre>
          </div>
        </section>
        
        <section id="endpoint" class="doc-section">
          <h2>接口地址</h2>
          <p class="section-desc">API的基础地址和请求方式。</p>
          
          <div class="endpoint-info">
            <div class="endpoint-item">
              <span class="label">基础地址：</span>
              <code>{{ baseUrl }}</code>
            </div>
            <div class="endpoint-item">
              <span class="label">接口路径：</span>
              <code>{{ endpoint }}</code>
            </div>
            <div class="endpoint-item">
              <span class="label">请求方式：</span>
              <el-tag :type="methodTagType" size="small">{{ method }}</el-tag>
            </div>
            <div class="endpoint-item">
              <span class="label">数据格式：</span>
              <code>application/json</code>
            </div>
          </div>
        </section>
        
        <section id="params" class="doc-section">
          <h2>请求参数</h2>
          <p class="section-desc">以下是接口支持的请求参数：</p>
          
          <el-table :data="requestParams" border stripe>
            <el-table-column prop="name" label="参数名" width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="required" label="必填" width="80">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                  {{ row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="example" label="示例值" width="150" />
          </el-table>
        </section>
        
        <section id="response" class="doc-section">
          <h2>响应参数</h2>
          <p class="section-desc">接口返回的数据结构说明：</p>
          
          <el-table :data="responseParams" border stripe>
            <el-table-column prop="name" label="参数名" width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="description" label="说明" />
          </el-table>
          
          <div class="code-block">
            <div class="code-header">
              <span>响应示例</span>
              <el-button text size="small" @click="copyCode('response')">
                <el-icon><CopyDocument /></el-icon> 复制
              </el-button>
            </div>
            <pre><code id="response-code">{
  "code": 200,
  "message": "success",
  "data": {
    "result": "处理结果数据",
    "timestamp": 1711526400000
  },
  "requestId": "req_abc123xyz"
}</code></pre>
          </div>
        </section>
        
        <section id="examples" class="doc-section">
          <h2>代码示例</h2>
          <p class="section-desc">以下是不同编程语言的调用示例：</p>
          
          <el-tabs v-model="activeLang" class="code-tabs">
            <el-tab-pane label="Python" name="python">
              <div class="code-block">
                <div class="code-header">
                  <span>Python 示例</span>
                  <el-button text size="small" @click="copyCode('python')">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre><code id="python-code">import requests
import json

url = "{{ baseUrl }}{{ endpoint }}"
headers = {
    "Content-Type": "application/json",
    "X-Access-Key": "your_access_key",
    "X-Timestamp": "1711526400000",
    "X-Signature": "your_signature"
}
data = {
    "param1": "value1",
    "param2": "value2"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)</code></pre>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="Java" name="java">
              <div class="code-block">
                <div class="code-header">
                  <span>Java 示例</span>
                  <el-button text size="small" @click="copyCode('java')">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre><code id="java-code">import java.net.http.*;
import java.net.URI;
import java.net.http.HttpRequest.BodyPublishers;

public class ApiExample {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        String json = "{\"param1\":\"value1\",\"param2\":\"value2\"}";
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("{{ baseUrl }}{{ endpoint }}"))
            .header("Content-Type", "application/json")
            .header("X-Access-Key", "your_access_key")
            .header("X-Timestamp", "1711526400000")
            .header("X-Signature", "your_signature")
            .POST(BodyPublishers.ofString(json))
            .build();
        
        HttpResponse&lt;String&gt; response = client.send(
            request, HttpResponse.BodyHandlers.ofString()
        );
        
        System.out.println(response.body());
    }
}</code></pre>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="JavaScript" name="javascript">
              <div class="code-block">
                <div class="code-header">
                  <span>JavaScript 示例</span>
                  <el-button text size="small" @click="copyCode('javascript')">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre><code id="javascript-code">const response = await fetch('{{ baseUrl }}{{ endpoint }}', {
  method: '{{ method }}',
  headers: {
    'Content-Type': 'application/json',
    'X-Access-Key': 'your_access_key',
    'X-Timestamp': '1711526400000',
    'X-Signature': 'your_signature'
  },
  body: JSON.stringify({
    param1: 'value1',
    param2: 'value2'
  })
});

const result = await response.json();
console.log(result);</code></pre>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="cURL" name="curl">
              <div class="code-block">
                <div class="code-header">
                  <span>cURL 示例</span>
                  <el-button text size="small" @click="copyCode('curl')">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre><code id="curl-code">curl -X {{ method }} '{{ baseUrl }}{{ endpoint }}' \
  -H 'Content-Type: application/json' \
  -H 'X-Access-Key: your_access_key' \
  -H 'X-Timestamp: 1711526400000' \
  -H 'X-Signature: your_signature' \
  -d '{
    "param1": "value1",
    "param2": "value2"
  }'</code></pre>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>
        
        <section id="errors" class="doc-section">
          <h2>错误码</h2>
          <p class="section-desc">以下是接口可能返回的错误码及其含义：</p>
          
          <el-table :data="errorCodes" border stripe>
            <el-table-column prop="code" label="错误码" width="120" />
            <el-table-column prop="message" label="错误信息" width="200" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="solution" label="解决方案" />
          </el-table>
        </section>
        
        <section id="faq" class="doc-section">
          <h2>常见问题</h2>
          <p class="section-desc">以下是用户常见的问题及解答：</p>
          
          <el-collapse v-model="activeFaq">
            <el-collapse-item title="Q: 如何获取AccessKey和SecretKey？" name="1">
              <p>A: 登录平台后，进入"个人中心" -> "账号设置"，即可查看和重置您的密钥。请注意妥善保管SecretKey，不要泄露给他人。</p>
            </el-collapse-item>
            <el-collapse-item title="Q: 签名验证失败怎么办？" name="2">
              <p>A: 请检查以下几点：1) 时间戳是否为当前时间（允许误差5分钟）；2) 参数是否按字母顺序排序；3) SecretKey是否正确；4) 签名算法是否正确实现。</p>
            </el-collapse-item>
            <el-collapse-item title="Q: 调用次数用完了怎么办？" name="3">
              <p>A: 您可以在API详情页购买额外的调用次数，购买后立即生效。如需大量购买，可联系客服获取优惠。</p>
            </el-collapse-item>
            <el-collapse-item title="Q: 接口响应超时怎么办？" name="4">
              <p>A: 正常情况下接口响应时间在100ms以内。如遇超时，请检查网络连接，或稍后重试。如问题持续，请联系技术支持。</p>
            </el-collapse-item>
            <el-collapse-item title="Q: 如何申请退款？" name="5">
              <p>A: 如对服务不满意，可在订单详情页申请退款。退款将在1-3个工作日内处理，退款金额将返还至您的账户余额。</p>
            </el-collapse-item>
          </el-collapse>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Link, Document, Promotion, Key, Connection,
  Setting, DataAnalysis, DocumentCopy, Warning, QuestionFilled,
  Check, CopyDocument
} from '@element-plus/icons-vue'
import config from '@/config'

const route = useRoute()
const router = useRouter()

const baseUrl = config.baseURL
const apiId = computed(() => route.params.id as string)
const apiName = computed(() => route.query.name as string || 'API')
const endpoint = computed(() => route.query.endpoint as string || '/api/v1/service')
const method = computed(() => (route.query.method as string || 'POST').toUpperCase())

const activeSection = ref('overview')
const activeLang = ref('python')
const activeFaq = ref(['1'])

const methodTagType = computed(() => {
  const types: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return types[method.value] || 'info'
})

const authHeaders = ref([
  { name: 'X-Access-Key', type: 'string', required: true, description: '用户的AccessKey' },
  { name: 'X-Timestamp', type: 'long', required: true, description: '请求时间戳（毫秒）' },
  { name: 'X-Signature', type: 'string', required: true, description: '请求签名' },
  { name: 'Content-Type', type: 'string', required: true, description: '固定值：application/json' }
])

const requestParams = ref([
  { name: 'param1', type: 'string', required: true, description: '参数1说明', example: 'value1' },
  { name: 'param2', type: 'string', required: false, description: '参数2说明', example: 'value2' }
])

const responseParams = ref([
  { name: 'code', type: 'int', description: '状态码，200表示成功' },
  { name: 'message', type: 'string', description: '响应消息' },
  { name: 'data', type: 'object', description: '返回数据对象' },
  { name: 'requestId', type: 'string', description: '请求唯一标识，用于问题排查' }
])

const errorCodes = ref([
  { code: 200, message: 'success', description: '请求成功', solution: '-' },
  { code: 400, message: 'Bad Request', description: '请求参数错误', solution: '检查请求参数格式和必填项' },
  { code: 401, message: 'Unauthorized', description: '认证失败', solution: '检查AccessKey和签名是否正确' },
  { code: 403, message: 'Forbidden', description: '无权限访问', solution: '检查是否购买该API服务' },
  { code: 429, message: 'Too Many Requests', description: '请求频率超限', solution: '降低调用频率或联系客服提升配额' },
  { code: 500, message: 'Internal Server Error', description: '服务器内部错误', solution: '稍后重试或联系技术支持' }
])

const handleMenuSelect = (index: string) => {
  activeSection.value = index
  const element = document.getElementById(index)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const copyCode = (type: string) => {
  const element = document.getElementById(`${type}-code`)
  if (element) {
    navigator.clipboard.writeText(element.textContent || '')
    ElMessage.success('代码已复制到剪贴板')
  }
}

const goBack = () => {
  router.back()
}

const goToApiDetail = () => {
  router.push(`/api/${apiId.value}`)
}

onMounted(() => {
  document.title = `${apiName.value} 技术文档 - API Market`
})
</script>

<style scoped>
.doc-page {
  min-height: 100vh;
  background: #f8fafc;
}

.doc-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left .el-button {
  color: white;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.doc-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 24px;
}

.doc-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  height: fit-content;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-title {
  padding: 16px 20px;
  font-weight: 600;
  color: #1e3a8a;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.doc-sidebar .el-menu {
  border-right: none;
}

.doc-content {
  flex: 1;
  min-width: 0;
}

.doc-section {
  background: white;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.doc-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.section-desc {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.feature-icon {
  font-size: 24px;
  color: #22c55e;
  flex-shrink: 0;
}

.feature-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 4px 0;
}

.feature-content p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.auth-info {
  margin-bottom: 24px;
}

.auth-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 12px;
}

.endpoint-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.endpoint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.endpoint-item:last-child {
  margin-bottom: 0;
}

.endpoint-item .label {
  font-weight: 500;
  color: #475569;
  width: 80px;
}

.endpoint-item code {
  background: #e2e8f0;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #1e40af;
}

.code-block {
  background: #1e293b;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #334155;
  color: #94a3b8;
  font-size: 13px;
}

.code-header .el-button {
  color: #94a3b8;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
}

.code-tabs {
  margin-top: 16px;
}

.code-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.code-tabs :deep(.el-tabs__nav-wrap) {
  background: #334155;
  padding: 0 16px;
  border-radius: 8px 8px 0 0;
}

.code-tabs :deep(.el-tabs__item) {
  color: #94a3b8;
  height: 44px;
  line-height: 44px;
}

.code-tabs :deep(.el-tabs__item.is-active) {
  color: #3b82f6;
}

.code-tabs :deep(.el-tabs__content) {
  padding: 0;
}

@media (max-width: 1024px) {
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .doc-sidebar {
    display: none;
  }
}
</style>
