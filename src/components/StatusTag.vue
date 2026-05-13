<!--
  =====================================================
  状态标签组件 StatusTag —— 相当于后端的枚举状态显示组件
  =====================================================
  
  【核心概念】根据状态值（pending/approved/rejected等）显示对应颜色和中文文本
  支持订单状态、API状态、需求状态、售后状态等多种状态映射
  
  【后端类比】相当于后端的枚举状态显示组件，将英文枚举值转为中文+颜色标签
  
  【Vue 组件核心概念（给后端开发者）】
    - props（:status）—— 状态英文值，相当于后端的方法参数
    - props（:statusMap）—— 状态映射表，相当于后端的枚举映射
    - props（:size）—— 标签大小
    - computed —— 根据状态值查找映射表获取显示信息，相当于后端的 getter 方法
-->
<template>
  <el-tag :type="statusInfo.type" :size="size">
    {{ statusInfo.text }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ORDER_STATUS, API_STATUS, REQUIREMENT_STATUS, AFTER_SALE_STATUS, getStatusInfo } from '@/utils/status'

interface Props {
  status: string
  type: 'order' | 'api' | 'requirement' | 'after_sale'
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default'
})

const statusMap = computed(() => {
  switch (props.type) {
    case 'order':
      return ORDER_STATUS
    case 'api':
      return API_STATUS
    case 'requirement':
      return REQUIREMENT_STATUS
    case 'after_sale':
      return AFTER_SALE_STATUS
    default:
      return {}
  }
})

const statusInfo = computed(() => {
  return getStatusInfo(props.status, statusMap.value)
})
</script>
