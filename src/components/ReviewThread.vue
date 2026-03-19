<template>
  <div class="review-thread">
    <div class="review-item">
      <div class="review-header">
        <el-avatar :size="32">{{ review.username.charAt(0) }}</el-avatar>
        <div class="review-info">
          <span class="username">{{ review.username }}</span>
          <el-rate v-model="review.rating" disabled />
        </div>
        <span class="time">{{ review.createTime }}</span>
      </div>
      <p class="review-content">{{ review.content }}</p>
      <div class="review-actions">
        <el-button
          v-if="isPublisher"
          text
          type="primary"
          size="small"
          @click="showPublisherReplyInput = true"
        >
          回复
        </el-button>
        <el-button
          v-if="isCommentAuthor"
          text
          type="primary"
          size="small"
          @click="showEditInput = true"
        >
          编辑
        </el-button>
      </div>

      <div v-if="showEditInput" class="edit-input">
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="3"
          placeholder="修改评论内容"
        />
        <div class="input-actions">
          <el-button size="small" @click="cancelEdit">取消</el-button>
          <el-button type="primary" size="small" @click="handleUpdate">保存</el-button>
        </div>
      </div>

      <div v-if="showPublisherReplyInput" class="reply-input">
        <el-input
          v-model="publisherReplyContent"
          type="textarea"
          :rows="3"
          placeholder="输入回复内容"
        />
        <div class="input-actions">
          <el-button size="small" @click="cancelPublisherReply">取消</el-button>
          <el-button type="primary" size="small" @click="handlePublisherReply">发送</el-button>
        </div>
      </div>

      <div v-if="hasReplies" class="replies-section">
        <div v-if="showExpandButton" class="expand-button">
          <el-button text @click="toggleReplies">
            {{ expanded ? '收起对话' : '展开对话' }}
            <el-icon>
              <ArrowDown v-if="!expanded" />
              <ArrowUp v-else />
            </el-icon>
          </el-button>
        </div>

        <div v-show="expanded || !showExpandButton" class="replies-list">
          <div
            v-for="reply in displayReplies"
            :key="reply.id"
            class="reply-item"
            :class="{
              'publisher-reply': reply.replyType === 1,
              'user-reply': reply.replyType === 2
            }"
          >
            <div class="reply-header">
              <el-avatar :size="28">{{ reply.username.charAt(0) }}</el-avatar>
              <div class="reply-info">
                <span class="username">
                  {{ reply.username }}
                  <el-tag v-if="reply.replyType === 1" size="small" type="success">开发者</el-tag>
                </span>
              </div>
              <span class="time">{{ reply.createTime }}</span>
            </div>
            <p class="reply-content">{{ reply.content }}</p>

            <div v-if="reply.replyType === 1 && isCommentAuthor" class="reply-actions">
              <el-button
                text
                type="primary"
                size="small"
                @click="showUserReplyInput(reply.id)"
              >
                回复
              </el-button>
            </div>

            <div v-if="activeUserReplyId === reply.id" class="reply-input">
              <el-input
                v-model="userReplyContent"
                type="textarea"
                :rows="3"
                placeholder="输入回复内容"
              />
              <div class="input-actions">
                <el-button size="small" @click="cancelUserReply">取消</el-button>
                <el-button type="primary" size="small" @click="handleUserReply(reply.id)">发送</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { reviewApi, type ApiReview } from '@/api/review'

interface Props {
  review: ApiReview
  apiUserId: number
  currentUserId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const expanded = ref(false)
const showEditInput = ref(false)
const showPublisherReplyInput = ref(false)
const editContent = ref('')
const publisherReplyContent = ref('')
const userReplyContent = ref('')
const activeUserReplyId = ref<number | null>(null)

const isPublisher = computed(() => props.currentUserId === props.apiUserId)
const isCommentAuthor = computed(() => props.currentUserId === props.review.userId)
const hasReplies = computed(() => props.review.replies && props.review.replies.length > 0)
const showExpandButton = computed(() => {
  if (!hasReplies.value) return false
  const totalItems = 1 + (props.review.replies?.length || 0)
  return totalItems > 2
})

const displayReplies = computed(() => {
  if (!hasReplies.value) return []
  if (!showExpandButton.value || expanded.value) {
    return props.review.replies
  }
  return props.review.replies?.slice(0, 1) || []
})

const toggleReplies = () => {
  expanded.value = !expanded.value
}

const cancelEdit = () => {
  showEditInput.value = false
  editContent.value = ''
}

const cancelPublisherReply = () => {
  showPublisherReplyInput.value = false
  publisherReplyContent.value = ''
}

const cancelUserReply = () => {
  activeUserReplyId.value = null
  userReplyContent.value = ''
}

const showUserReplyInput = (replyId: number) => {
  activeUserReplyId.value = replyId
  userReplyContent.value = ''
}

const handleUpdate = async () => {
  if (!editContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  try {
    await reviewApi.update(props.review.id, editContent.value)
    ElMessage.success('修改成功')
    showEditInput.value = false
    editContent.value = ''
    emit('refresh')
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

const handlePublisherReply = async () => {
  if (!publisherReplyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await reviewApi.publisherReply(props.review.id, publisherReplyContent.value)
    ElMessage.success('回复成功')
    showPublisherReplyInput.value = false
    publisherReplyContent.value = ''
    emit('refresh')
  } catch (error) {
    ElMessage.error('回复失败')
  }
}

const handleUserReply = async (replyId: number) => {
  if (!userReplyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  try {
    await reviewApi.userReply(replyId, userReplyContent.value)
    ElMessage.success('回复成功')
    cancelUserReply()
    emit('refresh')
  } catch (error) {
    ElMessage.error('回复失败')
  }
}
</script>

<style scoped>
.review-thread {
  margin-bottom: 24px;
}

.review-item {
  padding-bottom: 24px;
  border-bottom: 1px solid #F0F0F0;
}

.review-header,
.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-info,
.reply-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.review-content,
.reply-content {
  color: #333;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.review-actions,
.reply-actions {
  margin-top: 8px;
}

.edit-input,
.reply-input {
  margin-top: 12px;
  padding: 12px;
  background: #F8F8F8;
  border-radius: 4px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.replies-section {
  margin-top: 16px;
  padding: 12px 16px;
  background: #F8F8F8;
  border-radius: 4px;
}

.expand-button {
  margin-bottom: 12px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  padding-top: 16px;
  border-top: 1px solid #E8E8E8;
}

.reply-item:first-child {
  padding-top: 0;
  border-top: none;
}

.reply-item.publisher-reply {
  position: relative;
}

.reply-item.publisher-reply::before {
  display: none;
}

.reply-item.user-reply {
  position: relative;
}

.reply-item.user-reply::before {
  display: none;
}

.reply-header .username {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reply-item {
  position: relative;
}
</style>
