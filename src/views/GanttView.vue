<template>
  <div class="gantt-view">
    <div class="page-header">
      <h1>甘特图</h1>
      <p>任务时间线</p>
    </div>

    <div class="gantt-container">
      <div class="gantt-timeline">
        <div class="timeline-header">
          <div class="task-label">任务</div>
          <div class="time-slots">
            <div v-for="hour in timeSlots" :key="hour" class="time-slot">{{ hour }}:00</div>
          </div>
          <div class="status-label">状态</div>
        </div>

        <div v-for="task in ganttTasks" :key="task.id" class="timeline-row" @click="toggleTaskStatus(task)">
          <div class="task-name">{{ task.title }}</div>
          <div class="task-bar-container">
            <div 
              class="task-bar" 
              :class="task.status"
              :style="taskBarStyle(task)"
            >
              <span v-if="task.status === 'completed'" class="check-mark">✓</span>
            </div>
          </div>
          <div class="task-status">{{ task.startTime }}</div>
          <button class="delete-btn" @click.stop="deleteTask(task.id)">×</button>
        </div>
      </div>
    </div>

    <div class="gantt-legend">
      <div class="legend-item">
        <span class="legend-color completed"></span>
        <span>已完成</span>
      </div>
      <div class="legend-item">
        <span class="legend-color in-progress"></span>
        <span>进行中</span>
      </div>
      <div class="legend-item">
        <span class="legend-color overdue"></span>
        <span>已逾期</span>
      </div>
      <div class="legend-hint">💡 点击任务条切换状态</div>
    </div>

    <div class="add-task">
      <input type="text" v-model="newTaskTitle" placeholder="添加任务..." @keyup.enter="addNewTask">
      <input type="time" v-model="newTaskStartTime">
      <input type="time" v-model="newTaskEndTime">
      <button class="add-btn" @click="addNewTask">+ 添加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import { useTaskStore } from '@/stores/task'
import type { Task } from '@/types'
import { today } from '@/data/staticData'

const taskStore = useTaskStore()
const ganttTasks = ref<Task[]>([])
const newTaskTitle = ref('')
const newTaskStartTime = ref('12:00')
const newTaskEndTime = ref('13:00')

const timeSlots = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const taskBarStyle = (task: Task) => {
  const startMinutes = timeToMinutes(task.startTime)
  const endMinutes = timeToMinutes(task.endTime)
  const dayStart = 6 * 60
  const dayEnd = 22 * 60
  const totalMinutes = dayEnd - dayStart

  const left = ((startMinutes - dayStart) / totalMinutes) * 100
  const width = ((endMinutes - startMinutes) / totalMinutes) * 100

  return {
    left: `${Math.max(0, left)}%`,
    width: `${Math.max(5, width)}%`,
  }
}

const loadTasks = async () => {
  ganttTasks.value = await api.getGanttTasks(today)
}

const toggleTaskStatus = async (task: Task) => {
  const statusMap: Record<string, Task['status']> = {
    'todo': 'in-progress',
    'in-progress': 'completed',
    'completed': 'todo',
    'overdue': 'todo',
  }
  const newStatus = statusMap[task.status]
  const updatedTask = await api.updateTask(task.id, { status: newStatus })
  const index = ganttTasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    ganttTasks.value[index] = updatedTask
  }
}

const addNewTask = async () => {
  if (!newTaskTitle.value.trim()) return
  const newTask = await taskStore.addTask({
    title: newTaskTitle.value.trim(),
    status: 'todo',
    startTime: newTaskStartTime.value,
    endTime: newTaskEndTime.value,
    date: today,
  })
  ganttTasks.value.push(newTask)
  newTaskTitle.value = ''
}

const deleteTask = async (id: number) => {
  await api.deleteTask(id)
  ganttTasks.value = ganttTasks.value.filter(t => t.id !== id)
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.gantt-view {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    margin: 0 0 8px 0;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 15px;
  }
}

.gantt-container {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
  overflow-x: auto;
}

.gantt-timeline {
  min-width: 800px;
}

.timeline-header {
  display: grid;
  grid-template-columns: 150px 1fr 80px 40px;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.task-label,
.status-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(17, 1fr);
  gap: 4px;
}

.time-slot {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.timeline-row {
  display: grid;
  grid-template-columns: 150px 1fr 80px 40px;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;

  &:hover {
    background: var(--bg-color);
    margin: 0 -8px;
    padding: 12px 8px;
    border-radius: 8px;
  }
}

.task-name {
  font-weight: 500;
  color: var(--text-primary);
}

.task-bar-container {
  position: relative;
  height: 40px;
  background: var(--border-color);
  border-radius: 20px;
}

.task-bar {
  position: absolute;
  height: 32px;
  top: 4px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &.todo {
    background: var(--border-color);
  }

  &.in-progress {
    background: var(--color-in-progress);
    opacity: 0.8;
  }

  &.completed {
    background: var(--color-completed);
  }

  &.overdue {
    background: var(--color-overdue);
  }

  .check-mark {
    color: white;
    font-weight: bold;
  }
}

.task-status {
  color: var(--text-secondary);
  text-align: center;
}

.delete-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: var(--color-overdue);
  }
}

.gantt-legend {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 24px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;

  &.completed {
    background: var(--color-completed);
  }

  &.in-progress {
    background: var(--color-in-progress);
  }

  &.overdue {
    background: var(--color-overdue);
  }
}

.legend-hint {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 14px;
}

.add-task {
  display: flex;
  gap: 12px;

  input[type="text"] {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 20px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 16px;
    box-shadow: var(--shadow);
  }

  input[type="time"] {
    padding: 12px 16px;
    border: none;
    border-radius: 20px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 16px;
    box-shadow: var(--shadow);
  }

  .add-btn {
    background: var(--text-primary);
    color: var(--card-bg);
    border: none;
    padding: 12px 28px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
  }
}
</style>
