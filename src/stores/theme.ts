import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme } from '@/types'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(localStorage.getItem('theme') as Theme || 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.className = `theme-${newTheme}`
  }, { immediate: true })

  return {
    theme,
    toggleTheme,
  }
})
