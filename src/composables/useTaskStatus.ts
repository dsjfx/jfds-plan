import { ref, computed, watch, type Ref } from 'vue'
import type { GanttTask, TaskStatus, TaskStats } from '@/types/task'
import { getTaskStatus, getStatusDisplay, calculateStats } from '@/utils/taskStatus'
import { toggleTaskDone } from '@/api/taskApi'

export function useTaskStatus(
  tasks: Ref<GanttTask[]>,
  currentDate: Ref<string>,
  refreshTasks: () => Promise<void>
) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 切换任务完成状态（调用 API）
   */
  async function toggleTask(taskId: number): Promise<boolean> {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      error.value = '任务不存在'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const newDone = !task.isDone
      const updated = await toggleTaskDone(taskId, newDone)

      // 更新本地数据
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = {
          ...tasks.value[index],
          isDone: updated.isDone,
          updatedAt: updated.updatedAt
        }
      }

      return true
    } catch (err: any) {
      error.value = err.message || '切换状态失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取任务状态（带缓存计算）
   */
  function getTaskStatusWithCache(task: GanttTask): TaskStatus {
    return getTaskStatus(task, currentDate.value)
  }

  /**
   * 获取任务完整信息（包含状态）
   */
  function getTaskWithStatus(task: GanttTask) {
    const status = getTaskStatusWithCache(task)
    const display = getStatusDisplay(status)
    return {
      ...task,
      status,
      statusLabel: display.label,
      statusColor: display.color,
      statusIcon: display.icon,
      dotColor: display.dotColor
    }
  }

  /**
   * 获取统计信息
   */
  const stats = computed<TaskStats>(() => {
    return calculateStats(tasks.value, currentDate.value)
  })

  /**
   * 检查是否有逾期任务
   */
  const hasOverdue = computed(() => {
    return tasks.value.some(t => {
      if (t.planDate !== currentDate.value) return false
      const status = getTaskStatus(t, currentDate.value)
      return status === 'overdue'
    })
  })

  /**
   * 刷新所有任务的状态（触发视图更新）
   */
  function refreshStatuses() {
    // 触发 computed 重新计算
    tasks.value = [...tasks.value]
  }

  /**
   * 监听日期变化，自动刷新
   */
  watch(currentDate, () => {
    refreshTasks()
  })

  return {
    isLoading,
    error,
    toggleTask,
    getTaskStatusWithCache,
    getTaskWithStatus,
    stats,
    hasOverdue,
    refreshStatuses
  }
}