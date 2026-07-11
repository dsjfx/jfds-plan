<template>
  <div class="gantt-container">

    <div class="gantt-header">
      <h2 class="header-title">任务时间线</h2>
      <span class="header-divider">·</span>
      <span class="header-subtitle">甘特图</span>
    </div>

    <div class="gantt-date">
      <button @click="changeDate(-1)" class="nav-btn">‹</button>
      <span class="date-label">{{ dateDisplay }}</span>
      <button @click="changeDate(1)" class="nav-btn">›</button>
      <button @click="goToday" class="today-btn">今天</button>
    </div>

    <!-- gantt chart -->
    <div class="gantt-chart" id="ganttChart">
      <!-- timeline -->
      <div class="timeline-header" id="timelineHeader">
        <span class="task-label-col">任务</span>
        <div class="hour-col" id="hourLabels">
          <span v-for="h in hourRange" :key="h" class="hour-label">
            {{ String(h).padStart(2, '0') }}:00
          </span>
        </div>
        <span class="status-col">状态</span>
      </div>

      <!-- task -->
      <div class="task-rows" id="taskRows">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          今天还没有计划，添加一条吧!
        </div>
        <div v-for="task in filteredTasks" :key="task.id" class="task-row" :class="{ 'task-done': task.done }">
          <span class="task-label" :title="task.name">
            {{ task.name }}
          </span>
          <div class="bar-track" @click="toggleTask(task.id)">
            <div class="bar" :class="getBarClass(task)" :style="getBarStyle(task)">
              <span v-if="task.done" class="check-mark">✓</span>
            </div>
          </div>
          <span class="task-time">{{ task.time || '--:--' }}</span>
          <button class="delete-btn" @click="deleteTask(task.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- legend -->
    <div class="legend-bar">
      <span><span class="dot done"></span>已完成</span>
      <span><span class="dot pending"></span>进行中</span>
      <span><span class="dot overdue"></span>已逾期</span>
      <span class="hint"></span>
    </div>

    <!-- ===== 底部：添加任务 ===== -->
    <div class="add-area">
      <input type="text" v-model="newTaskName" placeholder="添加任务…" @keydown.enter="addTask" class="task-input" />
      <input type="time" v-model="newTaskTime" class="time-input" />
      <button @click="addTask" class="add-btn">+ 添加</button>
      <button @click="clearDone" class="clear-btn">🗑 清除已完成</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

// ===== 类型定义 =====
interface GanttTask {
  id: number
  name: string
  time: string      // 'HH:MM'
  done: boolean
  planDate: string  // 'YYYY-MM-DD'
}

// ===== Props =====
const props = defineProps<{
  initialDate?: string
}>()

// ===== Emits =====
const emit = defineEmits<{
  (e: 'taskToggle', task: GanttTask): void
  (e: 'taskAdd', task: GanttTask): void
  (e: 'taskDelete', taskId: number): void
  (e: 'dateChange', date: string): void
}>()

// ===== 状态 =====
const STORAGE_KEY = 'gantt_todo_data'

const tasks = ref<GanttTask[]>([])
const currentDate = ref(props.initialDate || getTodayStr())
const newTaskName = ref('')
const newTaskTime = ref('12:00')

// 时间轴范围
const startHour = 6
const endHour = 22
const hourRange = computed(() => {
  const hours: number[] = []
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h)
  }
  return hours
})

// ===== 工具函数 =====
function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateDisplay(dateStr: string): string {
  const today = getTodayStr()
  if (dateStr === today) return '今天'
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isOverdue(task: GanttTask): boolean {
  if (task.done) return false
  if (!task.time) return false
  const today = getTodayStr()
  if (currentDate.value < today) return true
  if (currentDate.value > today) return false
  const [h, m] = task.time.split(':').map(Number)
  const now = new Date()
  const taskTime = new Date()
  taskTime.setHours(h, m, 0, 0)
  return taskTime < now
}

// persistence data
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    tasks.value = raw ? JSON.parse(raw) : []
  } catch {
    tasks.value = []
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
}

const dateDisplay = computed(() => formatDateDisplay(currentDate.value))

const filteredTasks = computed(() => {
  return tasks.value
    .filter(t => t.planDate === currentDate.value)
    .sort((a, b) => {
      // the unfinished is on top and the completed is at the bottom
      // if (a.done !== b.done) return a.done ? 1 : -1
      // sort by time
      return (a.time || '99:99').localeCompare(b.time || '99:99')
    })
})

const totalHours = endHour - startHour

// compute the left and width of the bar based on the task time
function getBarStyle(task: GanttTask) {
  if (!task.time) {
    return {
      left: '10%',
      width: '30%'
    }
  }
  const [h, m] = task.time.split(':').map(Number)
  const hourFloat = h + m / 60
  // 每个任务占 1.5 小时
  const duration = 1.5
  let left = ((hourFloat - startHour) / totalHours) * 100
  let width = (duration / totalHours) * 100
  left = Math.max(0, Math.min(95, left))
  width = Math.max(2, Math.min(80, width))
  return {
    left: left + '%',
    width: width + '%'
  }
}

function getBarClass(task: GanttTask) {
  if (task.done) return 'bar-done'
  if (isOverdue(task)) return 'bar-overdue'
  return 'bar-pending'
}

// ===== 操作函数 =====
function toggleTask(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.done = !task.done
    saveData()
    emit('taskToggle', task)
  }
}

function deleteTask(taskId: number) {
  if (!confirm('确定删除这个任务吗？')) return
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  saveData()
  emit('taskDelete', taskId)
}

function addTask() {
  const name = newTaskName.value.trim()
  if (!name) {
    alert('请输入任务名称')
    return
  }
  const time = newTaskTime.value || ''
  const newTask: GanttTask = {
    id: Date.now() + Math.random() * 1000,
    name,
    time,
    done: false,
    planDate: currentDate.value
  }
  tasks.value.push(newTask)
  saveData()
  emit('taskAdd', newTask)
  newTaskName.value = ''
  newTaskName.value = ''
  newTaskName.value = ''
  // 上面三行是为了触发响应式更新，实际只需要一行
  // 但为了保险，用 nextTick
  nextTick(() => {
    newTaskName.value = ''
  })
}

function clearDone() {
  const dayTasks = tasks.value.filter(t => t.planDate === currentDate.value)
  if (!dayTasks.some(t => t.done)) return
  if (!confirm('确定删除所有已完成的任务吗？')) return
  tasks.value = tasks.value.filter(t => !(t.planDate === currentDate.value && t.done))
  saveData()
}

function changeDate(delta: number) {
  currentDate.value = addDays(currentDate.value, delta)
  emit('dateChange', currentDate.value)
}

function goToday() {
  currentDate.value = getTodayStr()
  emit('dateChange', currentDate.value)
}

// initialize sample data
function initSampleData() {
  const today = getTodayStr()
  const sampleTasks: GanttTask[] = [
    { id: 1, name: '晨会准备', time: '08:30', done: false, planDate: today },
    { id: 2, name: '团队周报', time: '09:00', done: true, planDate: today },
    { id: 3, name: '代码审查', time: '10:00', done: false, planDate: today },
    { id: 4, name: '项目立项会', time: '14:00', done: false, planDate: today },
    { id: 5, name: '整理文档', time: '16:30', done: false, planDate: today },
    { id: 6, name: '复盘今日', time: '18:00', done: false, planDate: today },
  ]
  tasks.value = sampleTasks
  saveData()
}

onMounted(() => {
  loadData()
  // if there is no data, initialize sample data
  if (tasks.value.length === 0) {
    initSampleData()
  }
  // check if there is any task for the current date, if not, create an empty array
  const hasData = tasks.value.some(t => t.planDate === currentDate.value)
  if (!hasData) {
    // tasks.value.push({
    //   id: Date.now(),
    //   name: '示例任务',
    //   time: '12:00',
    //   done: false,
    //   planDate: currentDate.value
    // })
    // saveData()
  }
})

// 监听日期变化，重新渲染
watch(currentDate, () => {
  // 不需要额外操作，computed 会自动更新
})
</script>

<style scoped lang="scss">
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;

.gantt-container {
  width: 100%;
  // max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #edf0f5;
}

.gantt-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 5px;

  .header-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    // color: var(--text-primary);
    color: #1a2332;
  }

  .header-divider {
    margin: 0 3px;
    color: var(--text-secondary);
    font-size: 20px;
    font-weight: 400;
  }

  .header-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 16px;
    opacity: .6;
  }
}

.gantt-date {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin: 10px auto 20px;

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: #f0f2f6;
    border: none;
    border-radius: 50%;
    font-size: 18px;
    color: #3a4659;
    transition: 0.2s;
    cursor: pointer;

    &:hover {
      background: #e2e6ed;
    }
  }

  .date-label {
    min-width: 100px;
    font-size: 15px;
    font-weight: 500;
    color: #1a2332;
    text-align: center;
  }

  .today-btn {
    padding: 6px 16px;
    background: #eef2ff;
    border: none;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    color: #4f46e5;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      background: #c7d2fe;
    }
  }
}

.legend-bar {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  background: #f8f9fc;
  border-radius: 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #5a6a7a;
  flex-wrap: wrap;

  .dot {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    border-radius: 4px;
    vertical-align: middle;
  }

  .dot.done {
    background: #4a7a5c;
  }

  .dot.pending {
    background: #5a6a8a;
  }

  .dot.overdue {
    background: #b15353;
  }

  .hint {
    margin-left: auto;
    color: #b0b8c5;
    font-size: 12px;

    &::after {
      content: '点击任务条切换状态';
    }
  }
}

.gantt-chart {
  margin-bottom: 16px;
  overflow-x: auto;
  background: #fafbfd;
  border-radius: 14px;
  border: 1px solid #edf0f5;
}

.timeline-header {
  display: flex;
  align-items: center;
  min-width: 700px;
  padding: 8px 12px;
  background: #f5f6f9;
  border-bottom: 2px solid #e2e6ed;
  font-size: 12px;
  font-weight: 500;
  color: #7a879a;

  .task-label-col {
    width: 100px;
    flex-shrink: 0;
    text-align: left;
  }

  .hour-col {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding: 0 4px;

    .hour-label {
      font-size: 11px;
      color: #7a879a;
      flex: 1;
      text-align: center;
    }
  }

  .status-col {
    width: 50px;
    flex-shrink: 0;
    text-align: center;
  }
}

.task-rows {
  min-height: 60px;
}

.empty-state {
  text-align: center;
  color: #b0b8c5;
  padding: 40px 0;
  font-size: 15px;
}

.task-row {
  display: flex;
  align-items: center;
  min-width: 700px;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f2f6;
  transition: 0.15s;

  &:hover {
    background: #f5f6f9;
  }
}

.task-row.task-done .task-label {
  text-decoration: line-through;
  color: #b0b8c5;
}

.task-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  color: #1a2332;
  font-weight: 450;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  height: 32px;
  position: relative;
  background: #eef0f5;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;
  margin: 0 4px;
}

.bar-track:hover {
  background: #e2e6ed;
}

.bar {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 20px;
  transition: width 0.4s ease, left 0.4s ease, background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
}

.bar-done {
  background: linear-gradient(90deg, #4a7a5c, #6a9a7c);
}

.bar-pending {
  background: linear-gradient(90deg, #5a6a8a, #7a8aaa);
}

.bar-overdue {
  background: linear-gradient(90deg, #b15353, #d47373);
  animation: pulse-overdue 1.5s ease-in-out infinite;
}

@keyframes pulse-overdue {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.bar .check-mark {
  position: absolute;
  right: -8px;
  top: -8px;
  background: #4a7a5c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(74, 122, 92, 0.3);
}

.task-time {
  font-size: 12px;
  color: #7a879a;
  width: 60px;
  flex-shrink: 0;
  text-align: right;
  font-weight: 450;
}

.delete-btn {
  background: none;
  border: none;
  color: #c8ced8;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px 0 10px;
  transition: 0.2s;
  line-height: 1;
  flex-shrink: 0;
}

.delete-btn:hover {
  color: #b15353;
}

/* ===== 底部添加区 ===== */
.add-area {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid #edf0f5;
}

.task-input {
  flex: 1;
  min-width: 140px;
  padding: 10px 16px;
  border: 1.5px solid #e2e6ed;
  border-radius: 30px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  background: #fafbfd;
  color: #1a2332;
}

.task-input:focus {
  border-color: #5a6a8a;
  background: white;
  box-shadow: 0 0 0 3px rgba(90, 106, 138, 0.08);
}

.task-input::placeholder {
  color: #b0b8c5;
}

.time-input {
  padding: 10px 14px;
  border: 1.5px solid #e2e6ed;
  border-radius: 30px;
  font-size: 14px;
  outline: none;
  background: #fafbfd;
  width: 120px;
  flex-shrink: 0;
  color: #1a2332;
}

.time-input:focus {
  border-color: #5a6a8a;
  background: white;
  box-shadow: 0 0 0 3px rgba(90, 106, 138, 0.08);
}

.add-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 30px;
  background: #1a2332;
  color: white;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.add-btn:hover {
  background: #2c3a4f;
  transform: scale(0.97);
}

.clear-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 30px;
  background: none;
  color: #b0b8c5;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.clear-btn:hover {
  background: #f0f2f6;
  color: #b15353;
}

/* ===== 响应式 ===== */
@media (max-width: 700px) {
  .gantt-container {
    padding: 16px 12px;
  }

  .gantt-header {
    flex-direction: column;
    align-items: stretch;
  }

  .gantt-date {
    justify-content: center;
  }

  .task-label {
    width: 70px;
    font-size: 12px;
  }

  .task-time {
    width: 50px;
    font-size: 11px;
  }

  .add-area {
    flex-direction: column;
  }

  .time-input {
    width: 100%;
  }
}
</style>