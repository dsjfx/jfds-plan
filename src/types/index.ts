export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed' | 'overdue'
  startTime: string
  endTime: string
  date: string
  priority?: 'low' | 'medium' | 'high'
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
}

export type Theme = 'light' | 'dark'

export type ViewMode = 'dashboard' | 'gantt'
