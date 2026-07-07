import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import type { Task, DashboardStats } from '@/types'
import { today } from '@/data/staticData'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  const stats = computed<DashboardStats>(() => {
    const total = tasks.value.length
    const completed = tasks.value.filter(t => t.status === 'completed').length
    const pending = tasks.value.filter(t => t.status === 'todo' || t.status === 'in-progress').length
    const overdue = tasks.value.filter(t => t.status === 'overdue').length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionRate: rate,
    }
  })

  const loadTasks = async () => {
    loading.value = true
    try {
      tasks.value = await api.getTasks(today)
    } finally {
      loading.value = false
    }
  }

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    const newTask = await api.addTask(taskData)
    tasks.value.push(newTask)
    return newTask
  }

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const updatedTask = await api.updateTask(id, updates)
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    return updatedTask
  }

  const deleteTask = async (id: number) => {
    await api.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    await updateTask(task.id, { status: newStatus })
  }

  const clearCompleted = async () => {
    const completedTasks = tasks.value.filter(t => t.status === 'completed')
    for (const task of completedTasks) {
      await deleteTask(task.id)
    }
  }

  return {
    tasks,
    loading,
    stats,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearCompleted,
  }
})
