<!--
  =====================================================
  HTTP方法标签组件 MethodTag —— 相当于后端的请求方法枚举显示
  =====================================================
  
  【核心概念】根据GET/POST/PUT/DELETE显示不同颜色的标签
  GET=绿色, POST=蓝色, PUT=橙色, DELETE=红色
  
  【后端类比】相当于后端的请求方法枚举显示，类似 @RequestMapping 的方法类型
  
  【Vue 组件核心概念（给后端开发者）】
    - props（:method）—— HTTP方法名，相当于后端的方法参数
    - props（:size）—— 标签大小
    - computed —— 根据方法名计算颜色类型，相当于后端的 getter 方法
-->
<template>
  <el-tag :type="methodType" :size="size">
    {{ method }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMethodType } from '@/utils/status'

interface Props {
  method: string
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default'
})

const methodType = computed(() => getMethodType(props.method))
</script>
