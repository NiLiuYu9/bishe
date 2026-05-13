<!--
  =====================================================
  404错误页 —— 相当于后端的错误页面
  =====================================================
  
  【核心概念】当访问不存在的路由时显示
  
  【后端类比】相当于后端的 <error-page> 配置或 @ExceptionHandler(NoHandlerFoundException)
  
  【页面生命周期（给后端开发者）】
    - 纯静态页面，无数据请求
    - 提供"返回首页"按钮 → 相当于后端的 redirect:/
-->
<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EFF6FF;
}

.error-content {
  text-align: center;
}

.error-content h1 {
  font-size: 120px;
  font-weight: 700;
  color: #1E40AF;
  margin-bottom: 0;
  line-height: 1;
}

.error-content h2 {
  font-size: 32px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 16px;
}

.error-content p {
  font-size: 16px;
  color: #64748B;
  margin-bottom: 32px;
}
</style>
