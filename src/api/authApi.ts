import { post, get } from './request'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfo,
  TokenInfo,
} from '@/types/user'

// ============================================================
// 认证 API
// ============================================================

const AUTH_BASE = '/auth'

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>(`${AUTH_BASE}/login`, data)
}

/**
 * 用户注册
 */
export function register(data: RegisterRequest): Promise<UserInfo> {
  return post<UserInfo>(`${AUTH_BASE}/register`, data)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return get<UserInfo>(`${AUTH_BASE}/userInfo`)
}

/**
 * 用户登出（前端清除 token 即可，后端无状态）
 */
export function logout(): Promise<null> {
  return post<null>(`${AUTH_BASE}/logout`)
}

/**
 * 刷新 Token
 */
export function refreshToken(): Promise<TokenInfo> {
  return post<TokenInfo>(`${AUTH_BASE}/refresh`)
}
