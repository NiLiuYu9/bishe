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
