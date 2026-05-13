<!--
  =====================================================
  根组件 App.vue —— 相当于后端的最外层容器
  =====================================================
  
  【后端类比】这个文件相当于后端的"应用入口页面"
    - 后端：所有请求经过 DispatcherServlet 分发到各个 Controller
    - 前端：所有页面通过 <router-view /> 渲染到这个根组件中
  
  【Vue 单文件组件 (.vue) 的三大组成部分】
    1. <template> —— HTML 模板（相当于 JSP/Thymeleaf 的 HTML 部分）
       定义组件的视觉结构，就是用户看到的页面
    2. <script setup> —— JavaScript/TypeScript 逻辑（相当于 Java 类的逻辑）
       定义数据、方法、计算属性等
       setup 语法糖是 Vue 3 的简写方式，不用写 export default {}
    3. <style> —— CSS 样式（相当于 CSS 文件）
       定义组件的视觉效果（颜色、字体、间距等）
  
  【本组件的作用】
    这个根组件非常简单，只包含一个 <router-view /> 标签
    它的作用就是一个"占位符"，由路由决定渲染哪个页面组件
    相当于后端的 DispatcherServlet：它自己不处理请求，只负责分发
-->

<!-- ==================== 模板部分 ==================== -->

<!--
  <template> —— 组件的 HTML 结构
  【后端类比】相当于 JSP 页面的 <body> 部分，定义用户看到的界面
  
  <router-view /> —— 路由视图占位符
  【后端类比】相当于 DispatcherServlet 的分发点
    - 这个标签会被"当前路由对应的页面组件"替换
    - 例如：访问 /api 时，这里渲染 ApiList.vue 组件
    - 例如：访问 /login 时，这里渲染 Login.vue 组件
    - 它是一个动态占位符，内容随 URL 变化而变化
    - 类似于 JSP 中的 <jsp:include page="${page}" />
-->
<template>
  <router-view />
</template>

<!-- ==================== 脚本部分 ==================== -->

<!--
  <script setup lang="ts"> —— 组件的 TypeScript 逻辑
  【各部分含义】
    - script：定义 JavaScript/TypeScript 代码
    - setup：Vue 3 的 Composition API 语法糖，简化写法
      不用 setup 的话需要写 export default { setup() { return {} } }
      用了 setup 后，顶层变量和函数自动暴露给模板使用
    - lang="ts"：使用 TypeScript 而非 JavaScript，提供类型检查
  
  【后端类比】
    - setup 相当于后端的 @PostConstruct 初始化方法
    - lang="ts" 相当于后端用 Java 而非 Groovy 写代码
  
  【本组件的 script 为空】因为根组件不需要任何逻辑，只负责渲染路由页面
-->
<script setup lang="ts">
</script>

<!-- ==================== 样式部分 ==================== -->

<!--
  <style> —— 组件的 CSS 样式
  【后端类比】相当于给 HTML 页面设置外观样式
  
  【CSS 属性解析】
    font-family —— 字体族，按优先级排列：
      'Plus Jakarta Sans' —— 首选字体（从 Google Fonts 加载）
      -apple-system —— macOS/iOS 系统默认字体
      BlinkMacSystemFont —— macOS Chrome 默认字体
      'Segoe UI' —— Windows 系统默认字体
      Roboto —— Android 系统默认字体
      sans-serif —— 兜底的无衬线字体
      如果前面的字体不可用，就依次使用后面的
    
    -webkit-font-smoothing: antialiased —— 字体抗锯齿（让文字更平滑）
      macOS Chrome/Safari 专用属性
    
    -moz-osx-font-smoothing: grayscale —— Firefox 字体抗锯齿
      Firefox 专用属性
    
  【注意】这里的 #app 选择器是全局的（没有 scoped 属性）
    - 没有 scoped：样式会影响整个应用的所有组件
    - 有 scoped：样式只影响当前组件（相当于后端的局部变量 vs 全局变量）
-->
<style>
#app {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
