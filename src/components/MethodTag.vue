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
