// ============================================================
// 用户相关类型定义（与后端对应）
// ============================================================

/**
 * 用户信息（不含密码）
 * 对应后端 UserInfo
 */
export interface UserInfo {
  id: number
  username: string
  nickname?: string | null
  email?: string | null
  avatar?: string | null
  role: number          // 1-普通用户 2-管理员
  status: number        // 1-启用 0-禁用
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Token 信息
 * 对应后端 TokenResponse
 */
export interface TokenInfo {
  accessToken: string
  tokenType: string
  expiresIn: number     // 过期时间（秒）
}

/**
 * 登录响应
 * 对应后端 LoginResponse
 */
export interface LoginResponse {
  token: TokenInfo
  user: UserInfo
}

/**
 * 登录请求
 * 对应后端 UserLogin
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 注册请求
 * 对应后端 UserRegister
 */
export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  email?: string
}

/**
 * 更新用户信息请求
 * 对应后端 UpdateUserInfo（如果有）
 */
export interface UpdateUserRequest {
  nickname?: string
  email?: string
  avatar?: string
}

/**
 * 修改密码请求
 * 对应后端 UpdatePassword（如果有）
 */
export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
}

/**
 * 用户状态枚举（前端使用）
 */
export const UserRole = {
  USER: 1,
  ADMIN: 2,
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

export const UserStatus = {
  ENABLED: 1,
  DISABLED: 0,
} as const

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus]

/**
 * 获取角色名称
 */
export function getRoleName(role: number): string {
  const map: Record<number, string> = {
    [UserRole.USER]: '普通用户',
    [UserRole.ADMIN]: '管理员',
  }
  return map[role] || '未知'
}

/**
 * 获取状态名称
 */
export function getStatusName(status: number): string {
  const map: Record<number, string> = {
    [UserStatus.ENABLED]: '已启用',
    [UserStatus.DISABLED]: '已禁用',
  }
  return map[status] || '未知'
}

/**
 * 判断用户是否是管理员
 */
export function isAdmin(user: UserInfo | null): boolean {
  return user?.role === UserRole.ADMIN
}

/**
 * 判断用户是否已启用
 */
export function isEnabled(user: UserInfo | null): boolean {
  return user?.status === UserStatus.ENABLED
}