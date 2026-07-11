<template>
  <div class="main-layout">
    <Sidebar />

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
import Sidebar from '@/components/layout/Sidebar.vue'
</script>

<style scoped lang="scss">
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;

.main-layout {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 40px);
  margin-left: 300px;
  overflow: hidden;
  background: var(--bg-color);
}

.content-area {
  flex: 1;
  // padding: 32px;
  overflow-y: auto;
}

.footer {
  padding: 18px 32px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
