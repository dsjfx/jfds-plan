import type { GanttTask, TaskStatus } from '@/types/task'

export function getCurrentDate(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentTime(): string {
  const d = new Date()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function parseTime(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

/**
 * 计算任务当前状态
 */
export function getTaskStatus(
  task: GanttTask,
  currentDate: string,
  currentTime: string = getCurrentTime()
): TaskStatus {
  // 1. 手动完成优先
  if (task.isDone) {
    return 'done'
  }

  // 2. 如果没有时间信息，默认进行中
  if (!task.startTime || !task.endTime) {
    return 'in_progress'
  }

  // 3. 检查日期
  const today = getCurrentDate()
  if (currentDate > today) {
    return 'not_started'
  }

  if (currentDate < today) {
    return 'overdue'
  }

  // 4. 计划日期 = 今天，按时间判断
  const now = parseTime(currentTime)
  const start = parseTime(task.startTime)
  const end = parseTime(task.endTime)

  if (now < start) {
    return 'not_started'
  } else if (now > end) {
    return 'overdue'
  } else {
    return 'in_progress'
  }
}

/**
 * 获取状态显示信息
 */
export function getStatusDisplay(status: TaskStatus): {
  label: string
  color: string
  icon: string
  dotColor: string
} {
  const map: Record<TaskStatus, { label: string; color: string; icon: string; dotColor: string }> = {
    'not_started': {
      label: '未开始',
      color: '#8c9ab0',
      icon: '⏸',
      dotColor: '#d5dce8'
    },
    'in_progress': {
      label: '进行中',
      color: '#5a6a8a',
      icon: '▶',
      dotColor: '#5a6a8a'
    },
    'done': {
      label: '已完成',
      color: '#4a7a5c',
      icon: '✅',
      dotColor: '#4a7a5c'
    },
    'overdue': {
      label: '已逾期',
      color: '#b15353',
      icon: '⚠️',
      dotColor: '#b15353'
    }
  }
  return map[status]
}

/**
 * 计算任务统计信息
 */
export function calculateStats(
  tasks: GanttTask[],
  currentDate: string
): {
  total: number
  not_started: number
  in_progress: number
  done: number
  overdue: number
  completionRate: number
  progressRate: number
} {
  const filtered = tasks.filter(t => t.planDate === currentDate)
  const total = filtered.length

  const counts = {
    not_started: 0,
    in_progress: 0,
    done: 0,
    overdue: 0
  }

  filtered.forEach(task => {
    const status = getTaskStatus(task, currentDate)
    counts[status]++
  })

  return {
    total,
    ...counts,
    completionRate: total === 0 ? 0 : Math.round((counts.done / total) * 100),
    progressRate: total === 0 ? 0 : Math.round(((counts.done + counts.in_progress) / total) * 100)
  }
}