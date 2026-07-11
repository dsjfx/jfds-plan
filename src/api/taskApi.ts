import { get, post, put, patch, del } from './request'
import type { GanttTask, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

const API_BASE = '/tasks'

/**
 * get tasks by plan date
 * @param planDate 
 * @returns 
 */
export async function getTasksByDate(planDate: string): Promise<GanttTask[]> {
  return get<GanttTask[]>(
    `${API_BASE}/`,
    { params: { plan_date: planDate } }
  )
}

/**
 * create a new task
* @param data 
* @returns 
*/
export async function createTask(data: CreateTaskRequest): Promise<GanttTask> {
  return post<GanttTask>(
    `${API_BASE}/`,
    data
  )
}

/**
 * complete a task
 */
export async function updateTask(taskId: number, data: UpdateTaskRequest): Promise<GanttTask> {
  return put<GanttTask>(
    `${API_BASE}/${taskId}`,
    data
  )
}

/**
 * toggle task done status
 */
export async function toggleTaskDone(taskId: number, isDone: boolean): Promise<GanttTask> {
  return patch<GanttTask>(
    `${API_BASE}/${taskId}/toggle-done`,
    { is_done: isDone }
  )
}

/**
 * delete a task
 */
export async function deleteTask(taskId: number): Promise<void> {
  return del<void>(
    `${API_BASE}/${taskId}`
  )
}

/**
 * clear all done tasks for a specific plan date
 */
export async function clearDoneTasks(planDate: string): Promise<void> {
  return del<void>(
    `${API_BASE}/`,
    { params: { plan_date: planDate } }
  )
}