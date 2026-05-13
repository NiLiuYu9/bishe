<!--
  =====================================================
  标签输入组件 TagInput —— 相当于后端的多选标签输入框
  =====================================================
  
  【核心概念】支持输入标签、删除标签，用于需求标签和用户技能标签
  输入标签后按回车添加，点击标签上的×删除
  
  【后端类比】相当于后端的多选标签输入框，类似 List<String> 的前端输入控件
  
  【Vue 组件核心概念（给后端开发者）】
    - v-model（modelValue）—— 双向绑定标签数组，相当于后端的表单字段绑定
    - emit（@update:modelValue）—— 标签变化事件，相当于后端的回调函数
    - ref —— 输入框数据，相当于后端的成员变量
-->
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
