/**
 * 下划线转驼峰
 * plan_date -> planDate
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 驼峰转下划线
 * planDate -> plan_date
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 递归转换对象的所有键：下划线 -> 驼峰（响应时使用）
 */
export function convertKeysToCamelCase<T = any>(data: any): T {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => convertKeysToCamelCase(item)) as T
  }

  if (typeof data === 'object') {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      const camelKey = toCamelCase(key)
      result[camelKey] = convertKeysToCamelCase(value)
    }
    return result as T
  }

  return data
}

/**
 * 递归转换对象的所有键：驼峰 -> 下划线（请求时使用）
 */
export function convertKeysToSnakeCase<T = any>(data: any): T {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => convertKeysToSnakeCase(item)) as T
  }

  if (typeof data === 'object') {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = convertKeysToSnakeCase(value)
    }
    return result as T
  }

  return data
}