<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="login-tabs" stretch @tab-change="handleTabChange">
        <el-tab-pane label="登录" name="login">
          <!-- 标题 -->
          <div class="login-header">
            <h2>用户登录</h2>
            <p class="subtitle">登录以管理你的任务</p>
          </div>
          <!-- 登录表单 -->
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0"
            @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" size="large" clearable />
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" show-password />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" :loading="loading" class="submit-btn" @click="handleLogin">
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>

            <div class="form-footer">
              <span>还没有账号？</span>
              <el-link type="primary" @click="switchToRegister">立即注册</el-link>
            </div>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <!-- 注册表单 -->
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0"
            @submit.prevent="handleRegister">
            <!-- 标题 -->
            <div class="login-header">
              <h2>用户注册</h2>
              <p class="subtitle">注册帐号来制定任务</p>
            </div>
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="用户名" size="large" clearable />
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="密码（至少6位）" size="large"
                show-password />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" size="large"
                show-password />
            </el-form-item>

            <el-form-item prop="nickname">
              <el-input v-model="registerForm.nickname" placeholder="昵称（可选）" size="large" clearable />
            </el-form-item>

            <!-- <el-form-item prop="email">
              <el-input v-model="registerForm.email" placeholder="邮箱（可选）" size="large" clearable />
            </el-form-item> -->

            <el-form-item>
              <el-button type="primary" size="large" :loading="loading" class="submit-btn" @click="handleRegister">
                {{ loading ? '注册中...' : '注 册' }}
              </el-button>
            </el-form-item>

            <div class="form-footer">
              <span>已有账号？</span>
              <el-link type="primary" @click="switchToLogin">立即登录</el-link>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login: loginApi, register: registerApi, isAuthenticated } = useAuth()

// ============================================================
// 状态
// ============================================================
const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// ============================================================
// 登录表单
// ============================================================
const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

// ============================================================
// 注册表单
// ============================================================
const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (value !== registerForm.password) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名 2-20 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// ============================================================
// Tab 切换
// ============================================================
function handleTabChange(tab: string) {
  // 切换时重置表单
  if (tab === 'login') {
    registerFormRef.value?.resetFields()
  } else {
    loginFormRef.value?.resetFields()
  }
}

function switchToRegister() {
  activeTab.value = 'register'
}

function switchToLogin() {
  activeTab.value = 'login'
}

// ============================================================
// 登录
// ============================================================
async function handleLogin() {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const success = await loginApi({
        username: loginForm.username,
        password: loginForm.password,
      })

      if (success) {
        ElMessage.success('登录成功！')
        router.push('/')
      } else {
        ElMessage.error('用户名或密码错误')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

// ============================================================
// 注册
// ============================================================
async function handleRegister() {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const success = await registerApi({
        username: registerForm.username,
        password: registerForm.password,
        nickname: registerForm.nickname || undefined,
        email: registerForm.email || undefined,
      })

      if (success) {
        ElMessage.success('注册成功！已自动登录')
        router.push('/dashboard')
      } else {
        ElMessage.error('注册失败，请稍后重试')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
    } finally {
      loading.value = false
    }
  })
}

// ============================================================
// 已登录则跳转
// ============================================================
onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/dashboard')
  }
})

// 监听登录状态变化
watch(isAuthenticated, (val) => {
  if (val) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
/* ============================================================
   页面容器
   ============================================================ */
.login-page {
  display: flex;
  align-items: baseline;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding-top: 50px;
  background: #f5f7fb;
  overflow-y: hidden;
}

/* ============================================================
   卡片
   ============================================================ */
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  border: 1px solid #edf0f5;
}

.login-card :deep(.el-card__body) {
  padding: 32px 28px 28px;
}

/* ============================================================
   标题
   ============================================================ */
.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a2332;
  margin: 0 0 4px 0;
}

.login-header .subtitle {
  font-size: 14px;
  color: #8c95a3;
  margin: 0;
}

/* ============================================================
   Tabs
   ============================================================ */
.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #8c95a3;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: rgb(76, 165, 2);
}

.login-tabs :deep(.el-tabs__active-bar) {
  background-color: rgb(76, 165, 2);
}

.login-tabs :deep(.el-tabs__item:hover) {
  color: rgb(76, 165, 2);
}

/* ============================================================
   表单
   ============================================================ */
.login-card :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-card :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e6ed inset;
  transition: box-shadow 0.2s ease;
}

.login-card :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgb(76, 165, 2) inset;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgb(76, 165, 2) inset !important;
}

.login-card :deep(.el-input__inner) {
  font-size: 14px;
}

.login-card :deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

/* ============================================================
   提交按钮
   ============================================================ */
.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  background: rgb(76, 165, 2);
  border: none;
  letter-spacing: 2px;
}

.submit-btn:hover:not(:disabled) {
  background: rgb(56, 135, 2);
}

.submit-btn:active:not(:disabled) {
  background: rgb(46, 115, 2);
}

.submit-btn :deep(.el-button__text) {
  color: white;
}

/* ============================================================
   表单底部
   ============================================================ */
.form-footer {
  text-align: center;
  font-size: 14px;
  color: #8c95a3;
}

.form-footer .el-link {
  color: rgb(76, 165, 2);
  font-weight: 500;
}

.form-footer .el-link:hover {
  color: rgb(56, 135, 2);
}
</style>