import type { Task } from '@/types'

export const today = new Date().toISOString().split('T')[0]

export const staticTasks: Task[] = [
  {
    id: 1,
    title: '代码审查',
    status: 'in-progress',
    startTime: '08:00',
    endTime: '09:00',
    date: today,
    priority: 'high'
  },
  {
    id: 2,
    title: '预约下周会议',
    status: 'overdue',
    startTime: '10:00',
    endTime: '11:00',
    date: today,
    priority: 'medium'
  },
  {
    id: 3,
    title: '完成项目报告',
    status: 'todo',
    startTime: '14:00',
    endTime: '16:00',
    date: today,
    priority: 'high'
  },
  {
    id: 4,
    title: '整理工作笔记',
    status: 'todo',
    startTime: '16:30',
    endTime: '17:30',
    date: today,
    priority: 'low'
  },
  {
    id: 5,
    title: '给团队发周报',
    status: 'completed',
    startTime: '09:30',
    endTime: '10:00',
    date: today,
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
    date: today
  },
  {
    id: 2,
    title: '代码审查',
    status: 'in-progress',
    startTime: '08:30',
    endTime: '10:00',
    date: today
  },
  {
    id: 3,
    title: '项目立项会',
    status: 'todo',
    startTime: '10:30',
    endTime: '12:00',
    date: today
  },
  {
    id: 4,
    title: '整理文档',
    status: 'todo',
    startTime: '14:00',
    endTime: '16:00',
    date: today
  },
  {
    id: 5,
    title: '复盘今日',
    status: 'todo',
    startTime: '17:00',
    endTime: '18:00',
    date: today
  },
  {
    id: 6,
    title: '团队周报',
    status: 'completed',
    startTime: '09:00',
    endTime: '09:30',
    date: today
  }
]
