<template>
  <div class="login-layout">
    <Login />

    <footer class="footer">
      <p>© {{ currentYear }} 任务计划 | 个人使用</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Login from '@/views/Login.vue'

const currentYear = new Date().getFullYear()
const icpLicense = ref<string | null>('苏ICP备2026029057号-1');
const icpUrl = ref<string | ''>('https://beian.miit.gov.cn/');
const publicSecurityLicense = ref<string | null>('苏公网安备32040002010730号');
const mpsUrl = ref<string | ''>('https://beian.mps.gov.cn/#/query/webSearch?code=32040002010730');
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