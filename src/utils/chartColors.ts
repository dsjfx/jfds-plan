// 工具函数：获取 CSS 变量的实际颜色值
export const getCssVar = (name: string): string => {
  if (typeof window === 'undefined') return '#000000'
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || '#000000'
}

// 预定义的主题颜色（避免 CSS 变量在 Canvas 中失效）
export const themeColors = {
  light: {
    completed: '#4a9f7a',
    inProgress: '#6b7aa1',
    overdue: '#c75050',
    textPrimary: '#2c3e50',
    textSecondary: '#64748b',
    border: '#e0e0e0',
    cardBg: '#ffffff',
  },
  dark: {
    completed: '#6dd4a5',
    inProgress: '#94a3b8',
    overdue: '#f87171',
    textPrimary: '#e4e4e7',
    textSecondary: '#94a3b8',
    border: '#334155',
    cardBg: '#16213e',
  }
}

// 根据当前主题返回颜色
export const getChartColors = () => {
  const isDark = document.documentElement.classList.contains('theme-dark')
  return isDark ? themeColors.dark : themeColors.light
}
