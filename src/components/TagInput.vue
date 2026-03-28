<template>
  <div class="tag-input">
    <div class="tag-list">
      <el-tag
        v-for="tag in modelValue"
        :key="tag"
        closable
        @close="removeTag(tag)"
        class="tag-item"
      >
        {{ tag }}
      </el-tag>
    </div>
    <div class="input-wrapper">
      <el-input
        v-model="inputValue"
        :placeholder="placeholder"
        @keyup.enter="addTag"
        @blur="addTag"
        size="small"
        class="tag-input-field"
      />
      <el-button type="primary" size="small" @click="addTag" :disabled="!inputValue.trim()">
        添加
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const inputValue = ref('')

const addTag = () => {
  const tag = inputValue.value.trim()
  if (tag && !props.modelValue.includes(tag)) {
    emit('update:modelValue', [...props.modelValue, tag])
  }
  inputValue.value = ''
}

const removeTag = (tag: string) => {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}
</script>

<style scoped>
.tag-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  font-size: 13px;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.tag-input-field {
  flex: 1;
}
</style>
