import type { Task2 } from './task'

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
}

export type Theme = 'light' | 'dark'

export type ViewMode = 'dashboard' | 'gantt'

export type { Task2 as Task }