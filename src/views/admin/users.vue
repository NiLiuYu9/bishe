<template>
  <div class="admin-users-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button @click="exportUsers">
        <el-icon><Download /></el-icon> 导出数据
      </el-button>
    </div>
    
    <div class="filter-section card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="用户名/邮箱/手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="冻结" value="frozen" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="users-table card">
      <el-table :data="users" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewUser(row)">查看</el-button>
            <el-button 
              v-if="row.status === 'active'" 
              text 
              type="warning" 
              @click="freezeUser(row)"
            >
              冻结
            </el-button>
            <el-button 
              v-if="row.status === 'frozen'" 
              text 
              type="success" 
              @click="unfreezeUser(row)"
            >
              解冻
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>
    
    <el-dialog v-model="userDialogVisible" title="用户详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">{{ currentUser?.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser?.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser?.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser?.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser?.status === 'active' ? 'success' : 'danger'">
            {{ currentUser?.status === 'active' ? '正常' : '冻结' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser?.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <el-dialog v-model="freezeDialogVisible" title="冻结用户" width="400px">
      <el-form :model="freezeForm" label-width="80px">
        <el-form-item label="冻结原因">
          <el-input v-model="freezeForm.reason" type="textarea" :rows="3" placeholder="请输入冻结原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="freezeDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmFreeze">确认冻结</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import type { User } from '@/types'

const loading = ref(false)
const users = ref<User[]>([])
const total = ref(0)

const userDialogVisible = ref(false)
const freezeDialogVisible = ref(false)
const currentUser = ref<User | null>(null)

const filters = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const freezeForm = reactive({ reason: '' })

const mockUsers: User[] = [
  { id: 1, username: 'user1', email: 'user1@example.com', phone: '13800138001', status: 'active', createTime: '2024-01-01', role: 'user' },
  { id: 2, username: 'user2', email: 'user2@example.com', phone: '13800138002', status: 'active', createTime: '2024-01-02', role: 'user' },
  { id: 3, username: 'developer1', email: 'dev1@example.com', phone: '13800138003', status: 'active', createTime: '2024-01-03', role: 'user' },
  { id: 4, username: 'frozen_user', email: 'frozen@example.com', phone: '13800138004', status: 'frozen', createTime: '2024-01-04', role: 'user' }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword
    })
    users.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    users.value = mockUsers
    total.value = mockUsers.length
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  pagination.page = 1
  fetchUsers()
}

const viewUser = (user: User) => {
  currentUser.value = user
  userDialogVisible.value = true
}

const freezeUser = (user: User) => {
  currentUser.value = user
  freezeForm.reason = ''
  freezeDialogVisible.value = true
}

const confirmFreeze = async () => {
  if (!currentUser.value) return
  
  try {
    await adminApi.freezeUser(currentUser.value.id, freezeForm)
    ElMessage.success('冻结成功')
    freezeDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('冻结失败:', error)
    ElMessage.success('冻结成功（模拟）')
    freezeDialogVisible.value = false
  }
}

const unfreezeUser = async (user: User) => {
  try {
    await adminApi.freezeUser(user.id, { reason: '' })
    ElMessage.success('解冻成功')
    fetchUsers()
  } catch (error) {
    console.error('解冻失败:', error)
    ElMessage.success('解冻成功（模拟）')
    fetchUsers()
  }
}

const exportUsers = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
