import type { Task } from '@/types'
import { staticTasks, ganttTasks } from '@/data/staticData'

export interface ApiService {
  getTasks: (date?: string) => Promise<Task[]>
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>
  updateTask: (id: number, task: Partial<Task>) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  getGanttTasks: (date?: string) => Promise<Task[]>
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MockApiService implements ApiService {
  async getTasks(_date?: string): Promise<Task[]> {
    await delay(300)
    return [...staticTasks]
  }

  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    await delay(300)
    const newTask: Task = {
      ...task,
      id: Date.now()
    }
    staticTasks.push(newTask)
    return newTask
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    await delay(300)
    const index = staticTasks.findIndex(t => t.id === id)
    if (index !== -1) {
      staticTasks[index] = { ...staticTasks[index], ...updates }
      return staticTasks[index]
    }
    throw new Error('Task not found')
  }

  async deleteTask(id: number): Promise<void> {
    await delay(300)
    const index = staticTasks.findIndex(t => t.id === id)
    if (index !== -1) {
      staticTasks.splice(index, 1)
    }
  }

  async getGanttTasks(_date?: string): Promise<Task[]> {
    await delay(300)
    return [...ganttTasks]
  }
}

export const api: ApiService = new MockApiService()
