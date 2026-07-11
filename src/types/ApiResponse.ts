

/**
 * API response type definitions
 */
export interface ApiResponse<T = any> {
  code: number        // 业务状态码，200 表示成功
  success: boolean    // 是否成功
  data: T            // 响应数据（泛型）
  message: string        // 提示信息
}

/**
 * 分页响应数据（后续扩展）
 */
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 列表响应（简化版）
 */
export type ApiListResponse<T> = ApiResponse<T[]>

/**
 * 单项响应
 */
export type ApiItemResponse<T> = ApiResponse<T>

/**
 * 空响应（删除、清空等操作）
 */
export type ApiEmptyResponse = ApiResponse<null>

export class ResponseData {

  static success<T>(data: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      data,
      message,
      success: true
    }
  }

  static error<T>(message: string = '操作失败', code: number = 500, data: T = null as any): ApiResponse<T> {
    return {
      code,
      data,
      message,
      success: false
    }
  }
}
