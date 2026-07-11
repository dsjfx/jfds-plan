export interface Task2 {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed' | 'overdue'
  startTime: string
  endTime: string
  planDate: string
  priority?: 'low' | 'medium' | 'high'
}

export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'overdue'

export interface GanttTask {
  id: number
  name: string
  description?: string
  status?: TaskStatus
  planDate: string      // 'YYYY-MM-DD'
  startTime: string     // 'HH:MM'
  endTime: string       // 'HH:MM'
  priority?: 'low' | 'medium' | 'high'
  isDone: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TaskWithStatus extends GanttTask {
  status: TaskStatus
  statusLabel: string
  statusColor: string
  statusIcon: string
  dotColor: string
}

// API 请求/响应类型
export interface CreateTaskRequest {
  name: string
  plan_date: string
  start_time?: string
  end_time?: string
}

export interface UpdateTaskRequest {
  name?: string
  plan_date?: string
  start_time?: string
  end_time?: string
  is_done?: boolean
}

export interface ToggleDoneRequest {
  is_done: boolean
}

export interface TaskStats {
  total: number
  not_started: number
  in_progress: number
  done: number
  overdue: number
  completionRate: number
  progressRate: number
}