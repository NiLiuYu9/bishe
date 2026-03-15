<template>
  <aside class="sidebar">
    <h3 class="sidebar-title">API分类</h3>
    <div class="category-list api-category-list">
      <div
        v-for="type in types"
        :key="type.id"
        class="category-item"
        :class="{ active: activeTypeId === type.id }"
        @click="handleTypeClick(type.id)"
      >
        <span>{{ type.name }}</span>
      </div>
    </div>
    <template v-if="userStore.isLoggedIn">
      <h3 class="sidebar-title" style="margin-top: 24px;">我的</h3>
      <div class="category-list">
        <div class="category-item" @click="handlePageClick('/user/my-apis')">
          <span>我的API</span>
        </div>
        <div class="category-item" @click="handlePageClick('/user/orders')">
          <span>我的订单</span>
        </div>
        <div class="category-item" @click="handlePageClick('/user/quota')">
          <span>调用额度</span>
        </div>
        <div class="category-item" @click="handlePageClick('/user/my-requirements')">
          <span>我的需求</span>
        </div>
        <div class="category-item" @click="handlePageClick('/user/statistics')">
          <span>统计分析</span>
        </div>
        <div class="category-item" @click="handlePageClick('/user/profile')">
          <span>个人资料</span>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { ApiType } from '@/types/api'

interface Props {
  types: ApiType[]
  activeTypeId?: number | ''
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'type-click', typeId: number): void
  (e: 'page-click', path: string): void
}>()

const router = useRouter()
const userStore = useUserStore()

const handleTypeClick = (typeId: number) => {
  emit('type-click', typeId)
}

const handlePageClick = (path: string) => {
  emit('page-click', path)
}
</script>

<style scoped>
.sidebar {
  width: 160px;
  background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
  padding: 24px 12px;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
}

.api-category-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.api-category-list::-webkit-scrollbar {
  width: 4px;
}

.api-category-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.api-category-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.api-category-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #94A3B8;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.category-item.active {
  background: rgba(59, 130, 246, 0.3);
  color: #fff;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 100%;
    position: static;
    height: auto;
    border-radius: 12px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 24px;
  }
  
  .api-category-list {
    max-height: none;
    overflow-y: visible;
  }
  
  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .category-item {
    margin-bottom: 0;
    margin-right: 8px;
  }
}
</style>
