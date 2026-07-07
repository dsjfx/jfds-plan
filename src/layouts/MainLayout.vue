<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>📋 任务计划</h1>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
        >
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

    <main class="main-content">
      <div class="content-area">
        <router-view />
      </div>
      
      <footer class="footer">
        <p>© 2024 任务计划 | 个人使用</p>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.theme)

const menuItems = [
  { path: '/', icon: '📊', title: '仪表盘' },
  { path: '/gantt', icon: '📅', title: '甘特图' },
  { path: '/charts', icon: '📈', title: '图表中心' },
]

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: 260px;
  background: var(--card-bg);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex-shrink: 0;
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

  .nav-icon {
    font-size: 20px;
  }

  .nav-text {
    font-size: 15px;
  }
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

  &:hover {
    background: var(--border-color);
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.footer {
  padding: 20px 32px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  text-align: center;

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}
</style>
