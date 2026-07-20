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
  remark?: string
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
  description?: string
  plan_date: string
  start_time?: string
  end_time?: string
  user_id?: number
}

export interface UpdateTaskRequest {
  name?: string
  description?: string
  plan_date?: string
  start_time?: string
  end_time?: string
  is_done?: boolean
  remark?: string
  user_id: number | undefined
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