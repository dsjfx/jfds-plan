import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types/ApiResponse';
import { convertKeysToCamelCase } from '@/utils/caseConverter';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加默认参数
    config.params = {
      ...config.params,
      timestamp: Date.now(),
      version: import.meta.env.VITE_APP_VERSION,
    };

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    if (data.code === 200) {
      return convertKeysToCamelCase(data.data)
    }
    return handleError(data.code, data.message)
  },
  (error) => {
    return handleHttpError(error)
  }
)

// 处理 API 错误
function handleError(code: number, message: string): Promise<never> {
  const errorMessage = message || `请求失败，错误码 ${code}`
  console.error('API Error:', code, errorMessage)
  return Promise.reject(new Error(errorMessage))
}

// 处理 HTTP 错误
function handleHttpError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const responseMessage = error.response?.data?.message ?? error.message
    let message = responseMessage || '网络请求异常，请稍后重试'

    if (status) {
      switch (status) {
        case 400:
          message = '请求参数错误，请检查后重试'
          break
        case 401:
          message = '未授权，请重新登录'
          if (error.response?.status === 401) {
            // Token 过期或无效，跳转到登录页
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_info')
            window.location.href = '/login'
          }
          break
        case 403:
          message = '禁止访问，权限不足'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 408:
          message = '请求超时，请稍后重试'
          break
        case 500:
          message = '服务器内部错误，请稍后重试'
          break
        case 502:
          message = '网关错误，请稍后重试'
          break
        case 503:
          message = '服务不可用，请稍后重试'
          break
        case 504:
          message = '网关超时，请稍后重试'
          break
      }
    }

    console.error('HTTP Error:', status, message)
    return Promise.reject(new Error(message))
  }

  const genericMessage = error instanceof Error ? error.message : String(error)
  console.error('Request Error:', genericMessage)
  return Promise.reject(new Error(genericMessage || '未知错误'))
}

// 判断是否是 Axios 响应
function isAxiosResponse(response: any): response is AxiosResponse {
  return response && typeof response === 'object' && 'config' in response && 'status' in response
}

async function request<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({ url, ...config })
    if (isAxiosResponse(response)) {
      if (response.status === 204) return {} as T
      return response.data as T
    }
    return response as T
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const message = err.response?.data ?? err.message
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
    }
    throw err
  }
}

function get<T>(url: string, config: AxiosRequestConfig = {}) {
  return request<T>(url, { ...config, method: 'GET' })
}

function post<T>(url: string, data?: any, config: AxiosRequestConfig = {}) {
  return request<T>(url, { ...config, method: 'POST', data })
}

function put<T>(url: string, data?: any, config: AxiosRequestConfig = {}) {
  return request<T>(url, { ...config, method: 'PUT', data })
}

function patch<T>(url: string, data?: any, config: AxiosRequestConfig = {}) {
  return request<T>(url, { ...config, method: 'PATCH', data })
}

function del<T>(url: string, config: AxiosRequestConfig = {}) {
  return request<T>(url, { ...config, method: 'DELETE' })
}

export { get, post, put, patch, del }
