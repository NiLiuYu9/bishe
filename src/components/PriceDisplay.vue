<!--
  =====================================================
  价格显示组件 PriceDisplay —— 相当于后端的价格格式化显示
  =====================================================
  
  【核心概念】格式化显示API价格，支持免费显示和不同计费单位
  
  【后端类比】相当于后端的价格格式化显示，类似 DecimalFormat 格式化金额
  
  【Vue 组件核心概念（给后端开发者）】
    - props（:price）—— 价格数值，相当于后端的方法参数
    - props（:priceUnit）—— 计费单位（per_call/per_month/per_year）
    - computed —— 计算格式化后的价格文本，相当于后端的 getter 方法
-->
<template>
  <div class="price-display">
    <span class="price">¥{{ price }}</span>
    <span class="unit">/{{ unitText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPriceUnit } from '@/utils/format'

const props = defineProps<{
  price: number | string
  unit: string
}>()

const unitText = computed(() => getPriceUnit(props.unit))
</script>

<style scoped>
.price-display {
  display: inline-flex;
  align-items: baseline;
}
.price {
  font-size: 20px;
  font-weight: 600;
  color: #22C55E;
}
.unit {
  font-size: 12px;
  color: #64748B;
}
</style>
