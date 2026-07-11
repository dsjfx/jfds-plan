import type { Task } from '@/types'
import { GanttTask } from '@/types/task'

export const today = new Date().toISOString().split('T')[0]

export const staticTasks: Task[] = [
  {
    id: 1,
    title: '代码审查',
    status: 'in-progress',
    startTime: '08:00',
    endTime: '09:00',
    planDate: today,
    priority: 'high'
  },
  {
    id: 2,
    title: '预约下周会议',
    status: 'overdue',
    startTime: '10:00',
    endTime: '11:00',
    planDate: today,
    priority: 'medium'
  },
  {
    id: 3,
    title: '完成项目报告',
    status: 'todo',
    startTime: '14:00',
    endTime: '16:00',
    planDate: today,
    priority: 'high'
  },
  {
    id: 4,
    title: '整理工作笔记',
    status: 'todo',
    startTime: '16:30',
    endTime: '17:30',
    planDate: today,
    priority: 'low'
  },
  {
    id: 5,
    title: '给团队发周报',
    status: 'completed',
    startTime: '09:30',
    endTime: '10:00',
    planDate: today,
    priority: 'medium'
  }
]

export const ganttTasks: Task[] = [
  {
    id: 1,
    title: '晨会准备',
    status: 'todo',
    startTime: '08:00',
    endTime: '08:30',
    planDate: today
  },
  {
    id: 2,
    title: '代码审查',
    status: 'in-progress',
    startTime: '08:30',
    endTime: '10:00',
    planDate: today
  },
  {
    id: 3,
    title: '项目立项会',
    status: 'todo',
    startTime: '10:30',
    endTime: '12:00',
    planDate: today
  },
  {
    id: 4,
    title: '整理文档',
    status: 'todo',
    startTime: '14:00',
    endTime: '16:00',
    planDate: today
  },
  {
    id: 5,
    title: '复盘今日',
    status: 'todo',
    startTime: '17:00',
    endTime: '18:00',
    planDate: today
  },
  {
    id: 6,
    title: '团队周报',
    status: 'completed',
    startTime: '09:00',
    endTime: '09:30',
    planDate: today
  }
]

let tasks: GanttTask[] = []

const STORAGE_KEY = 'gantt_todo_data_v2'

function initData() {
  const today = getTodayStr()
  const sampleTasks: GanttTask[] = [
    { id: 1, name: '晨会准备', startTime: '08:30', endTime: '09:30', isDone: true, planDate: today },
    { id: 2, name: '团队周报', startTime: '09:00', endTime: '10:00', isDone: true, planDate: today },
    { id: 3, name: '代码审查', startTime: '10:00', endTime: '12:00', isDone: false, planDate: today },
    { id: 4, name: '项目立项会', startTime: '14:00', endTime: '15:30', isDone: false, planDate: today },
    { id: 5, name: '整理文档', startTime: '16:30', endTime: '18:00', isDone: false, planDate: today },
    { id: 6, name: '复盘今日', startTime: '18:00', endTime: '19:00', isDone: false, planDate: today },
  ]
  tasks = sampleTasks
  saveData()
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    tasks = raw ? JSON.parse(raw) : []
  } catch {
    tasks = []
  }
  if (tasks.length === 0) {
    initData()
  }
  return tasks
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}