import { ref, computed, onMounted } from 'vue'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '@/api/authApi'

// ============================================================
// Token 管理
// ============================================================

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUserFromStorage(): UserInfo | null {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setUserToStorage(user: UserInfo): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ============================================================
// Auth Composable
// ============================================================

export function useAuth() {
  const user = ref<UserInfo | null>(getUserFromStorage())
  const token = ref<string | null>(getToken())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 是否已登录
   */
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * 是否是管理员
   */
  const isAdmin = computed(() => user.value?.role === 2)

  /**
   * 登录
   */
  async function login(data: LoginRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiLogin(data)

      // 保存 token
      token.value = response.token.accessToken
      setToken(response.token.accessToken)

      // 保存用户信息
      user.value = response.user
      setUserToStorage(response.user)

      return true
    } catch (err: any) {
      error.value = err.message || '登录失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 注册
   */
  async function register(data: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await apiRegister(data)
      // 注册成功后自动登录
      return await login({
        username: data.username,
        password: data.password,
      })
    } catch (err: any) {
      error.value = err.message || '注册失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      await apiLogout()
    } catch (err) {
      console.warn('登出接口调用失败:', err)
    } finally {
      // 无论后端是否成功，前端都清除 token
      token.value = null
      user.value = null
      removeToken()
    }
  }

  /**
   * 获取当前用户信息
   */
  async function fetchUser(): Promise<boolean> {
    if (!token.value) return false

    isLoading.value = true
    error.value = null

    try {
      const userInfo = await getCurrentUser()
      user.value = userInfo
      setUserToStorage(userInfo)
      return true
    } catch (err: any) {
      error.value = err.message || '获取用户信息失败'
      // token 失效，清除
      if (err.code === 401) {
        await logout()
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 初始化认证状态（从 localStorage 恢复）
   */
  function initAuth(): void {
    const savedToken = getToken()
    const savedUser = getUserFromStorage()

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
    } else {
      token.value = null
      user.value = null
    }
  }

  // 页面加载时自动初始化
  onMounted(() => {
    initAuth()
  })

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    initAuth,
  }
}