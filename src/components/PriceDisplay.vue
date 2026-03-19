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
