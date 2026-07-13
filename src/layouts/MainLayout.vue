<template>
  <div class="main-layout">
    <Sidebar />

    <main class="main-content">
      <div class="content-area">
        <router-view />
      </div>

      <footer class="footer">
        <div>© {{ currentYear }} 任务计划 | 个人使用</div>
        <div class="footer-beian">
          <span class="footer-beian-icp">
            <a v-if="icpLicense" :href="icpUrl" target="_blank">
              {{ icpLicense }}
            </a>
          </span>
          <span class="footer-beian-mps">
            <img class="mps" src="@/assets/img/logo-mps.png" alt="mps" />
            <a v-if="publicSecurityLicense" :href="mpsUrl" target="_blank">
              {{ publicSecurityLicense }}
            </a>
          </span>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from '@/components/layout/Sidebar.vue'

const currentYear = new Date().getFullYear()
const icpLicense = ref<string | null>('苏ICP备2026029057号-1');
const icpUrl = ref<string | ''>('https://beian.miit.gov.cn/');
const publicSecurityLicense = ref<string | null>('苏公网安备32040002010730号');
const mpsUrl = ref<string | ''>('https://beian.mps.gov.cn/#/query/webSearch?code=32040002010730');
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

.footer-beian {
  margin-left: 20px;
  display: inline-block;
  font-size: 0.875rem;

  a {
    color: var(--text-footer);

    &:hover {
      color: var(--text-hover);
    }
  }

  .footer-beian-icp {
    margin-left: 0;
  }

  .footer-beian-mps {
    margin-left: 20px;

    img {
      vertical-align: middle;
    }

    a {
      vertical-align: middle;
    }

    .mps {
      width: 16px;
      height: 17px;
      margin-right: 5px;
    }
  }
}
</style>
