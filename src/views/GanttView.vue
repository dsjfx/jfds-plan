<template>
  <div class="gantt-view">
    <div class="page-header">
      <span class="page-title">任务时间线</span>
      <span class="page-divider">·</span>
      <span class="page-subtitle">甘特图</span>
    </div>

    <div class="page-body">
      <section class="summary-panel card">
        <div class="panel-header">
          <div>
            <h2>今日进度</h2>
            <p>查看今天任务状态和甘特图安排。</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="status-card">
            <span class="status-title">总任务</span>
            <span class="status-value">{{ taskStats.total }}</span>
          </div>
          <div class="status-card">
            <span class="status-title">进行中</span>
            <span class="status-value">{{ taskStats.inProgress }}</span>
          </div>
          <div class="status-card">
            <span class="status-title">已完成</span>
            <span class="status-value">{{ taskStats.completed }}</span>
          </div>
          <div class="status-card">
            <span class="status-title">已逾期</span>
            <span class="status-value">{{ taskStats.overdue }}</span>
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
            <span class="legend-color todo"></span>
            <span>待处理</span>
          </div>
          <div class="legend-item">
            <span class="legend-color overdue"></span>
            <span>已逾期</span>
          </div>
          <div class="legend-hint">💡 点击任务条可切换任务状态。</div>
        </div>
      </section>

      <section class="gantt-panel card">
        <div class="panel-header">
          <div>
            <h2>甘特图任务</h2>
            <p>通过时间线查看工作节奏。</p>
          </div>
          <div class="task-overview">共 {{ ganttTasks.length }} 项任务</div>
        </div>

        <div class="gantt-container">
          <div class="gantt-timeline">
            <div class="timeline-header">
              <div class="task-label">任务</div>
              <div class="time-slots">
                <div v-for="hour in timeSlots" :key="hour" class="time-slot">{{ hour }}:00</div>
              </div>
              <div class="status-label">开始</div>
              <div class="actions-label">操作</div>
            </div>

            <div v-for="task in ganttTasks" :key="task.id" class="timeline-row">
              <div class="task-name">{{ task.title }}</div>
              <div class="task-bar-container" @click="toggleTaskStatus(task)">
                <div class="task-bar" :class="task.status" :style="taskBarStyle(task)">
                  <span v-if="task.status === 'completed'" class="check-mark">✓</span>
                </div>
              </div>
              <div class="task-status">{{ task.startTime }}</div>
              <button class="delete-btn" @click.stop="deleteTask(task.id)">×</button>
            </div>
          </div>
        </div>

        <div class="gantt-actions">
          <div class="add-task">
            <input type="text" v-model="newTaskTitle" placeholder="添加任务..." @keyup.enter="addNewTask">
            <input type="time" v-model="newTaskStartTime">
            <input type="time" v-model="newTaskEndTime">
            <button class="add-btn" @click="addNewTask">+ 添加</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const taskStats = computed(() => {
  const total = ganttTasks.value.length
  const completed = ganttTasks.value.filter((task) => task.status === 'completed').length
  const inProgress = ganttTasks.value.filter((task) => task.status === 'in-progress').length
  const overdue = ganttTasks.value.filter((task) => task.status === 'overdue').length

  return {
    total,
    completed,
    inProgress,
    overdue,
  }
})

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
    planDate: today,
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
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);

  .page-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-primary);
  }

  .page-divider {
    margin: 0 8px;
    color: var(--text-secondary);
    font-size: 20px;
    font-weight: 400;
  }

  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 16px;
    opacity: .6;
  }
}

.page-body {
  display: grid;
  gap: 24px;
}

.card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.summary-panel,
.gantt-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.status-card {
  background: var(--bg-color);
  border-radius: 16px;
  padding: 18px;
  text-align: center;
}

.status-title {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 14px;
}

.status-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.task-overview {
  color: var(--text-secondary);
  font-size: 14px;
}

.gantt-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.gantt-container {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
  overflow-x: auto;
  min-height: 220px;
}

.gantt-timeline {
  min-width: 800px;
  display: grid;
  gap: 16px;
}

.timeline-header {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 120px 60px;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.task-label,
.status-label,
.actions-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(17, minmax(40px, 1fr));
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
    background: rgba(107, 122, 161, 0.16);
    border: 1px solid var(--border-color);
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
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 0;
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

  &.todo {
    background: var(--border-color);
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
