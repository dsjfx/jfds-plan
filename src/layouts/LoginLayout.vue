<template>
  <div class="login-layout">
    <Login />

    <footer class="footer">
      <p>© 2024 任务计划 | 个人使用</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Login from '@/views/Login.vue'
</script>

<style scoped lang="scss">
.login-layout {
  display: flex;
  flex-direction: column;
}

.footer {
  width: 100%;
  height: 44px;
  margin: 10px auto;
  padding: 10px 0;
  text-align: center;
}
</style>