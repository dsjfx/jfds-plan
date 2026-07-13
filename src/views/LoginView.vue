<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="title-row">
        <h2>{{ mode === 'login' ? '用户登录' : '用户注册' }}</h2>
        <el-link type="primary" @click="toggleMode">
          {{ mode === 'login' ? '创建账号' : '已有账号？登录' }}
        </el-link>
      </div>

      <el-alert v-if="auth.error" :title="auth.error" type="error" show-icon class="login-alert" />

      <el-form :model="formData" :rules="rules" ref="formRef" label-position="top" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" autocomplete="current-password" />
        </el-form-item>

        <template v-if="mode === 'register'">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码"
              autocomplete="new-password" />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入昵称（可选）" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱（可选）" />
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" :loading="auth.isLoading" @click="handleSubmit" class="submit-button"
            style="width: 100%;">
            {{ mode === 'login' ? '登录' : '注册并登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { RegisterRequest, LoginRequest } from '@/types/user'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  initialMode?: 'login' | 'register'
}>()

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const mode = ref<'login' | 'register'>(props.initialMode || (route.name === 'Register' ? 'register' : 'login'))

const formRef = ref<FormInstance | null>(null)

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
})

const rules = computed(() => {
  return {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 32, message: '用户名长度应为 3-32 位', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码最少 6 位', trigger: 'blur' },
    ],
    confirmPassword: mode.value === 'register'
      ? [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule: any, value: string, callback: any) => {
            if (value !== formData.value.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ]
      : [],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    ],
  }
})

function resetForm() {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
  }
  auth.error = null
  formRef.value?.clearValidate()
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  resetForm()
}

async function handleSubmit() {
  auth.error = null

  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    if (mode.value === 'login') {
      const payload: LoginRequest = {
        username: formData.value.username,
        password: formData.value.password,
      }

      const success = await auth.login(payload)
      if (success) {
        router.push({ name: 'Dashboard' })
      }
    } else {
      const payload: RegisterRequest = {
        username: formData.value.username,
        password: formData.value.password,
        nickname: formData.value.nickname || undefined,
        email: formData.value.email || undefined,
      }

      const success = await auth.register(payload)
      if (success) {
        router.push({ name: 'Dashboard' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(56, 131, 255, 0.12), rgba(255, 255, 255, 0.96));
}

.login-card {
  width: min(420px, 100%);
  padding: 28px 24px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-row h2 {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
}

.login-alert {
  margin-bottom: 16px;
}

.login-form {
  width: 100%;
}

.submit-button {
  margin-top: 8px;
}
</style>
