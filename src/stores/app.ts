/**
 * =====================================================
 * 全局应用状态 Store —— 相当于后端的全局配置/上下文
 * =====================================================
 *
 * 【核心概念】
 *   管理全局级别的应用状态，如加载状态、侧边栏折叠状态
 *   这些状态不属于某个特定业务模块，而是整个应用共享的
 *
 * 【后端类比】
 *   相当于后端的 ApplicationContext 或全局配置 Bean
 *   - loading → 相当于后端的"系统正在处理中"标志
 *   - sidebarCollapsed → 相当于后端的 UI 配置项
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * useAppStore —— 应用 Store 的 Hook 函数
 * 【后端类比】相当于后端的 @Autowired AppContext
 */
export const useAppStore = defineStore('app', () => {
  /**
   * loading —— 全局加载状态
   * true 表示应用正在加载（可显示全屏 loading 遮罩）
   * false 表示加载完成
   * 【后端类比】相当于后端的"请求处理中"标志
   */
  const loading = ref(false)

  /**
   * sidebarCollapsed —— 侧边栏是否折叠
   * true 表示侧边栏收起（只显示图标）
   * false 表示侧边栏展开（显示图标+文字）
   * 【后端类比】相当于后端的 UI 配置项，控制界面布局
   */
  const sidebarCollapsed = ref(false)

  /**
   * setLoading —— 设置全局加载状态
   * 【后端类比】相当于后端的 setLoading(boolean) 方法
   */
  function setLoading(value: boolean) {
    loading.value = value
  }

  /**
   * toggleSidebar —— 切换侧边栏折叠状态
   * !sidebarCollapsed.value —— 取反，true 变 false，false 变 true
   * 【后端类比】相当于后端的 toggle() 方法
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    loading,
    sidebarCollapsed,
    setLoading,
    toggleSidebar
  }
})
