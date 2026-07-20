<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">

      <el-dropdown v-if="user" @command="handleCommand" class="user-dropdown">
        <span class="user-trigger el-dropdown-link">
          <el-avatar :src="avatarSrc" size="default" />
          <span class="user-name">{{ user.nickname || user.username }}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="brand-block">
        <h1>任务计划</h1>
      </div>

    </div>

    <nav class="sidebar-nav">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-item" active-class="active">
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.title }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle-btn" @click="toggleTheme">
        {{ currentTheme === 'light' ? '🌙 深色' : '☀️ 浅色' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const auth = useAuth()
const user = auth.user
// const userInitials = computed(() => {
//   if (!auth.user) return ''
//   const name = user.value?.nickname || user.value?.username
//   return name.slice(0, 2).toUpperCase()
// })

const avatarSrc = computed(() => {
  if (user.value?.avatar) {
    return user.value?.avatar
  }

  return 'https://picsum.photos/200/200?random=10'
})

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.theme)

const menuItems = [
  { path: '/', icon: '📊', title: '今日任务概览' },
  { path: '/taskline', icon: '📅', title: '任务时间线' },
  { path: '/charts', icon: '📈', title: '数据可视化展示' },
]

const toggleTheme = () => {
  themeStore.toggleTheme()
}

function handleCommand(command: string) {
  if (command === 'logout') {
    auth.logout().finally(() => {
      router.push({ name: 'Login' })
    })
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.app-sidebar {
  width: 260px;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex-shrink: 0;
  border-right: 1px solid rgba(100, 116, 139, 0.16);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  position: fixed;
  top: 20px;
  left: 20px;
  height: calc(100vh - 40px);
  overflow: hidden;
  z-index: 10;
}

.sidebar-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 30px;
  margin-bottom: 32px;
}

.brand-block {
  display: flex;
  align-items: center;
  width: 100px;
}

.brand-block h1 {
  font-size: 22px;
  color: var(--text-primary);
  margin: 0;
}

.user-dropdown {
  width: auto;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  color: var(--text-secondary);
  cursor: pointer;
}

.user-trigger:hover {
  color: var(--text-primary);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: var(--bg-color);
    color: var(--text-primary);
  }

  &.active {
    background: var(--bg-color);
    color: var(--text-primary);
    font-weight: 600;
  }
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: 15px;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.theme-toggle-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--border-color);
}
</style>
