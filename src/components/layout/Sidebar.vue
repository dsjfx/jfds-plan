<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <h1>📋 任务计划</h1>
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
import { useThemeStore } from '@/stores/theme'

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
  margin-bottom: 32px;

  h1 {
    font-size: 22px;
    color: var(--text-primary);
    margin: 0;
  }
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
