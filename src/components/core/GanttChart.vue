<template>
  <div class="gantt-container">

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div class="gantt-header">
      <FontAwesomeIcon :icon="['far', 'chart-bar']" class="header-icon" />
      <h2 class="header-title">任务时间线</h2>
      <span class="header-divider">·</span>
      <span class="header-subtitle">甘特图</span>
    </div>

    <div class="gantt-date">
      <el-button link class="nav-btn" @click="changeDate(-1)" title="前一天">
        <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
      </el-button>
      <el-date-picker v-model="currentDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" placeholder="选择日期"
        class="date-picker" />
      <el-button link class="nav-btn" @click="changeDate(1)" title="后一天">
        <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
      </el-button>
      <el-button type="primary" @click="goToday" class="today-btn">
        <FontAwesomeIcon :icon="['far', 'calendar']" />
        <span class="today-text">今天</span>
      </el-button>
    </div>

    <!-- gantt chart -->
    <div class="gantt-chart">
      <!-- timeline header -->
      <div class="timeline-header">
        <span class="task-label-col">任务</span>
        <div class="hour-col">
          <span v-for="h in hourRange" :key="h" class="hour-label">
            {{ String(h).padStart(2, '0') }}:00
          </span>
        </div>
        <!-- <span class="time-range-col">时间</span> -->
        <span class="action-col">操作</span>
      </div>

      <!-- task rows -->
      <div class="task-rows">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <FontAwesomeIcon :icon="['far', 'rectangle-list']" />
          <span class="empty-text">
            <span class="empty-text-start">[{{ dateDisplay }}]</span>
            <span class="empty-text-end">还没有计划，请适时制定!</span>
          </span>
        </div>
        <div v-for="task in filteredTasks" :key="task.id" class="task-row" :class="{ 'task-done': task.isDone }">
          <!-- dot and task name -->
          <span class="task-label">
            <span class="status-dot" :class="task.status"></span>
            <span class="task-name" :title="task.description">{{ task.name }}</span>
            <RemarkText v-model="task.remark" :id="task.id" :content="task.name" @save="handleSaveRemark"
              @open="handleOpen" @close="handleClose" ref="remarkRef" />
          </span>

          <!-- gantt bar -->
          <div class="bar-track" @click="handleToggleTask(task.id)">
            <div class="bar" :class="getBarClass(task)" :style="getBarStyle(task)" :title="getBarTooltip(task)">
              <span v-if="task.isDone" class="check-mark">✓</span>
            </div>
          </div>

          <!-- time range -->
          <!-- <span class="time-range">
            {{ task.startTime || '--:--' }} - {{ task.endTime || '--:--' }}
          </span> -->

          <span class="action">
            <!-- update button -->
            <el-button link class="update-btn" @click.stop="openEditDialog(task)" title="更新任务">
              <FontAwesomeIcon :icon="['far', 'pen-to-square']" />
            </el-button>
            <!-- delete button -->
            <el-button link class="delete-btn" @click="handleDeleteTask(task.id)" title="删除任务">
              <FontAwesomeIcon :icon="['far', 'trash-can']" />
            </el-button>
          </span>
        </div>
      </div>
    </div>

    <div class="legend-bar">
      <span><span class="dot done"></span>已完成</span>
      <span><span class="dot progress"></span>进行中</span>
      <span><span class="dot overdue"></span>已逾期</span>
      <span><span class="dot not-started"></span>未开始</span>
      <span class="hint">
        <FontAwesomeIcon :icon="['far', 'alarm-clock']" />
        <span class="hint-text">点击任务条切换状态 · 悬停查看详情</span>
      </span>
    </div>

    <div class="task-operate">
      <el-button type="primary" @click="openEditDialog" class="add-btn">
        <FontAwesomeIcon :icon="['fas', 'plus']" />
        <span class="add-text">添加</span>
      </el-button>
      <el-button type="warning" @click="handleClearDone" class="clear-btn">
        <FontAwesomeIcon :icon="['far', 'trash-can']" />
        <span class="clear-text">清除</span>
      </el-button>
    </div>

    <!-- 新增/修改 对话框 -->
    <el-dialog v-model="editDialogVisible" :title="dialogTitle" width="520px" :before-close="closeEditDialog">
      <el-form :model="editForm" label-width="100px" ref="editFormRef">
        <el-form-item label="任务名称" prop="name" :rules="[{ required: true, message: '请输入任务名称', trigger: 'blur' }]">
          <el-input v-model="editForm.name" placeholder="任务名称" />
        </el-form-item>

        <el-form-item label="日期" prop="plan_date" :rules="[{ required: true, message: '请选择计划日期', trigger: 'change' }]">
          <el-date-picker v-model="editForm.plan_date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            placeholder="选择日期" style="width: 100%;" />
        </el-form-item>

        <div class="dialog-time-row">
          <el-form-item label="开始" prop="start_time">
            <el-time-picker v-model="editForm.start_time" placeholder="开始时间" format="HH:mm" value-format="HH:mm"
              style="width: 100%;" />
          </el-form-item>
          <el-form-item label="结束" prop="end_time">
            <el-time-picker v-model="editForm.end_time" placeholder="结束时间" format="HH:mm" value-format="HH:mm"
              style="width: 100%;" />
          </el-form-item>
        </div>

        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="editForm.description" placeholder="任务描述（可选）" rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="handleUpdateTask(editForm.id)">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { GanttTask, TaskWithStatus } from '@/types/task'
import { getTasksByDate, createTask, deleteTask, clearDoneTasks, updateTask, updateTaskRemark } from '@/api/taskApi'
import { useTaskStatus } from '@/composables/useTaskStatus'
// import { loadData } from '@/data/staticData'
import { getCurrentDate } from '@/utils/taskStatus'
import RemarkText, { RemarkData } from './RemarkText.vue'

const props = defineProps<{
  initialDate?: string
}>()

const emit = defineEmits<{
  (e: 'taskToggle', task: GanttTask): void
  (e: 'taskAdd', task: GanttTask): void
  (e: 'taskDelete', taskId: number): void
  (e: 'dateChange', date: string): void
  (e: 'error', message: string | null): void
}>()


interface EditTaskForm {
  id: number | undefined
  name: string
  plan_date: string
  start_time: string
  end_time: string
  description?: string
}

const initEditForm = () => {
  const _editTask: EditTaskForm = {
    id: undefined,
    name: '',
    plan_date: getCurrentDate(),
    start_time: '',
    end_time: '',
    description: '',
  }
  return _editTask
}

const tasks = ref<GanttTask[]>([])
const currentDate = ref(props.initialDate || getCurrentDate())
// const newTaskName = ref('')
// const newStartTime = ref('08:00')
// const newEndTime = ref('10:00')
// const isRange = ref<boolean>(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const editDialogVisible = ref(false)
const editFormRef = ref<any>(null)
const editForm = ref<EditTaskForm>(initEditForm())
const dialogTitle = ref<string>('')

const {
  toggleTask,
  getTaskWithStatus,
  // stats,
  // hasOverdue,
  refreshStatuses
} = useTaskStatus(tasks, currentDate, loadTasks)

// 时间轴范围
const startHour = 8
const endHour = 22

function formatDateDisplay(dateStr: string): string {
  const today = getCurrentDate()
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

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}


const dateDisplay = computed(() => formatDateDisplay(currentDate.value))

const hourRange = computed(() => {
  const hours: number[] = []
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h)
  }
  return hours
})

// ===== 计算任务列表（含状态） =====
const filteredTasks = computed<TaskWithStatus[]>(() => {
  return tasks.value
    .filter(t => t.planDate === currentDate.value)
    .map(task => getTaskWithStatus(task))
    .sort((a, b) => {
      const order = { 'not_started': 0, 'in_progress': 1, 'overdue': 2, 'done': 3 }
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status]
      }
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99')
    })
})

const totalMinutes = (endHour - startHour) * 60

// load tasks from API
async function loadTasks() {
  isLoading.value = true
  error.value = null
  try {
    const userInfoStr = localStorage.getItem('user_info')
    let userId: number | undefined = undefined
    try {
      const obj = userInfoStr ? JSON.parse(userInfoStr) : null
      if (obj && typeof obj.id === 'number') userId = obj.id
    } catch {
      userId = undefined
    }

    const result = await getTasksByDate(currentDate.value, userId)
    tasks.value = result
  } catch (err: any) {
    const msg = err.message || '加载任务失败'
    ElMessage.error(msg)
    emit('error', msg)
  } finally {
    isLoading.value = false
  }
}

// ===== 甘特图样式计算 =====
function getBarStyle(task: TaskWithStatus) {
  if (!task.startTime || !task.endTime) {
    return { left: '5%', width: '20%', opacity: '0.5' }
  }

  const startMin = timeToMinutes(task.startTime)
  const endMin = timeToMinutes(task.endTime)
  const duration = endMin - startMin
  const baseMin = startHour * 60

  let left = ((startMin - baseMin) / totalMinutes) * 100
  let width = (duration / totalMinutes) * 100

  left = Math.max(0, Math.min(95, left))
  width = Math.max(2, Math.min(90, width))

  return { left: left + '%', width: width + '%' }
}

function getBarClass(task: TaskWithStatus) {
  const statusMap = {
    'done': 'bar-done',
    'in_progress': 'bar-pending',
    'overdue': 'bar-overdue',
    'not_started': 'bar-not-started'
  }
  return statusMap[task.status] || 'bar-pending'
}

function getBarTooltip(task: TaskWithStatus): string {
  // return `时间：${task.startTime || '--:--'} - ${task.endTime || '--:--'}\n状态: ${task.statusLabel}\n`
  return `${task.startTime || '--:--'} - ${task.endTime || '--:--'}`
}

// ===== 操作函数 =====
async function handleToggleTask(taskId: number) {
  const success = await toggleTask(taskId)
  if (success) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      emit('taskToggle', task)
    }
    refreshStatuses()
  }
}

async function handleAddTask() {
  const name = editForm.value.name.trim()
  if (!name) {
    ElMessage.error('请输入任务名称')
    return
  }

  const startTime = editForm.value.start_time
  const endTime = editForm.value.end_time

  // 验证时间
  if (startTime && endTime) {
    const startMin = timeToMinutes(startTime)
    const endMin = timeToMinutes(endTime)
    if (endMin <= startMin) {
      ElMessage.error('结束时间必须晚于开始时间')
      return
    }
    const baseMin = startHour * 60
    if (startMin < baseMin || endMin > (endHour * 60)) {
      ElMessage.error(`时间范围请控制在 ${startHour}:00 - ${endHour}:00 之间`)
      return
    }
  }

  const desc = editForm.value.description

  isLoading.value = true
  error.value = null

  try {
    const userInfoStr = localStorage.getItem('user_info')
    let userId: number | undefined = undefined
    try {
      const obj = userInfoStr ? JSON.parse(userInfoStr) : null
      if (obj && typeof obj.id === 'number') userId = obj.id
    } catch {
      userId = undefined
    }

    const newTask = await createTask({
      name,
      plan_date: currentDate.value,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      description: desc,
      user_id: userId,
    })

    tasks.value.push(newTask)
    emit('taskAdd', newTask)

    // newTaskName.value = ''
    // newStartTime.value = '08:00'
    // newEndTime.value = '10:00'
    refreshStatuses()
    editDialogVisible.value = false
  } catch (err: any) {
    const msg = err.message || '添加任务失败'
    ElMessage.error(msg)
    emit('error', msg)
  } finally {
    isLoading.value = false
  }
}

async function handleDeleteTask(taskId: number) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  try {
    await ElMessageBox.confirm(`确定删除「${task.name}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await deleteTask(taskId)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    emit('taskDelete', taskId)
    refreshStatuses()
    ElMessage.success('任务已删除')
  } catch (err: any) {
    const msg = err.message || '删除任务失败'
    ElMessage.error(msg)
    emit('error', msg)
  } finally {
    isLoading.value = false
  }
}

async function handleClearDone() {
  const hasDone = tasks.value.some(t => t.planDate === currentDate.value && t.isDone)
  if (!hasDone) {
    ElMessage.warning('今天没有已完成的任务')
    return
  }

  try {
    await ElMessageBox.confirm('确定删除所有已完成的任务吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const userInfoStr = localStorage.getItem('user_info')
    let userId: number | undefined = undefined
    try {
      const obj = userInfoStr ? JSON.parse(userInfoStr) : null
      if (obj && typeof obj.id === 'number') userId = obj.id
    } catch {
      userId = undefined
    }

    await clearDoneTasks(currentDate.value, userId)
    tasks.value = tasks.value.filter(t => !(t.planDate === currentDate.value && t.isDone))
    refreshStatuses()
    ElMessage.success('已清除所有已完成任务')
  } catch (err: any) {
    const msg = err.message || '清除已完成任务失败'
    ElMessage.error(msg)
    emit('error', msg)
  } finally {
    isLoading.value = false
  }
}

function changeDate(delta: number) {
  currentDate.value = addDays(currentDate.value, delta)
  emit('dateChange', currentDate.value)
}

function goToday() {
  currentDate.value = getCurrentDate()
  emit('dateChange', currentDate.value)
}

function getCurrentUserId(): number | undefined {
  const userInfoStr = localStorage.getItem('user_info')
  if (!userInfoStr) return undefined
  try {
    const obj = JSON.parse(userInfoStr)
    return typeof obj.id === 'number' ? obj.id : undefined
  } catch {
    return undefined
  }
}

function openEditDialog(task: GanttTask) {
  editForm.value = initEditForm()

  if (task && task.id) {
    dialogTitle.value = '更新任务'
    editForm.value = {
      id: task.id,
      name: task.name,
      plan_date: task.planDate,
      start_time: task.startTime || '',
      end_time: task.endTime || '',
      description: task.description || '',
    }
  } else {
    dialogTitle.value = '新增任务'
  }
  editDialogVisible.value = true
}

function closeEditDialog() {
  editDialogVisible.value = false
  editFormRef.value?.clearValidate()
}

async function handleUpdateTask(id: number | undefined) {
  if (!id) {
    handleAddTask()
    return
  }

  await editFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    if (editForm.value.start_time && editForm.value.end_time) {
      const startMin = timeToMinutes(editForm.value.start_time)
      const endMin = timeToMinutes(editForm.value.end_time)
      if (endMin <= startMin) {
        ElMessage.error('结束时间必须晚于开始时间')
        return
      }
      const baseMin = startHour * 60
      if (startMin < baseMin || endMin > endHour * 60) {
        ElMessage.error(`时间范围请控制在 ${startHour}:00 - ${endHour}:00 之间`)
        return
      }
    }

    if (!editForm.value.plan_date) {
      ElMessage.error('请选择计划日期')
      return
    }

    if (!editForm.value.id) {
      ElMessage.error('无效的任务 ID')
      return
    }

    isLoading.value = true
    try {
      const updatedTask = await updateTask(editForm.value.id, {
        name: editForm.value.name,
        plan_date: editForm.value.plan_date,
        start_time: editForm.value.start_time || undefined,
        end_time: editForm.value.end_time || undefined,
        description: editForm.value.description || undefined,
        user_id: getCurrentUserId(),
      })

      const index = tasks.value.findIndex((item) => item.id === updatedTask.id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      refreshStatuses()
      ElMessage.success('任务已更新')
      editDialogVisible.value = false
    } catch (err: any) {
      const msg = err.message || '更新任务失败'
      ElMessage.error(msg)
      emit('error', msg)
    } finally {
      isLoading.value = false
    }
  })
}

// 保存备注
const handleSaveRemark = async ({ id, content }: RemarkData): Promise<boolean> => {
  try {
    const result = await updateTaskRemark(
      id,
      {
        remark: content,
        user_id: getCurrentUserId(),
      }
    )

    console.log('保存成功：', result)
    ElMessage.success('备注保存成功')
    return true
  } catch (error) {
    console.error('保存失败：', error)
    ElMessage.error('保存失败，请重试')
    return false
  }
}

// 打开编辑器
const handleOpen = ({ id, content }: RemarkData): void => {
  console.log('打开编辑器：', id, content)
}

// 关闭编辑器
const handleClose = ({ id }: RemarkData): void => {
  console.log('关闭编辑器：', id)
}

// ===== 定时刷新 =====
let refreshTimer: number | null = null

// ===== 生命周期 =====
onMounted(() => {
  // load tasks from API
  loadTasks()

  // load from local storage for demo purposes
  // tasks.value = loadData()

  // refresh every 60 seconds
  refreshTimer = window.setInterval(() => {
    refreshStatuses()
  }, 60000)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

// 日期变化时重新加载
watch(currentDate, () => {
  // loadTasks()
})
</script>

<style scoped lang="scss">
$breakpoint-tablet: 1024px;
$breakpoint-mobile: 768px;

.gantt-container {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 20px;
  background: white;
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid #edf0f5;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 12px;
  font-size: 15px;
  color: #5a6a7a;

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #eef0f5;
    border-top-color: #5a6a8a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}


.gantt-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 5px;

  .header-icon {
    font-size: 24px;
  }

  .header-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: rgba(2, 73, 11, 0.7);
    // color: #1a2332;
  }

  .header-divider {
    margin: 0 3px;
    color: rgb(87, 2, 95, 0.9);
    font-size: 28px;
    font-weight: 600;
  }

  .header-subtitle {
    margin: 0;
    color: rgba(2, 73, 11, 0.6);
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

    .today-text {
      margin-left: 5px;
    }
  }
}


/* ===== 图例 ===== */
.legend-bar {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
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

    &.done {
      background: #4a7a5c;
    }

    &.progress {
      background: #5a6a8a;
    }

    &.overdue {
      background: #b15353;
    }

    &.not-started {
      background: #8d8e91;
    }
  }

  .hint {
    margin-left: auto;
    font-size: 12px;
    color: #b0b8c5;
    user-select: none;

    .hint-text {
      margin-left: 10px;
    }
  }
}

.gantt-chart {
  overflow-x: auto;
  min-height: 260px;
  margin-bottom: 16px;
  border-radius: 14px;
  border: 1px solid #edf0f5;
  background: #fafbfd;
}

.timeline-header {
  display: flex;
  align-items: center;
  min-width: 750px;
  padding: 8px 12px;
  background: #f5f6f9;
  border-bottom: 2px solid #e2e6ed;
  font-size: 14px;
  font-weight: 600;
  color: #7a879a;

  .task-label-col {
    width: 160px;
    padding-left: 15px;
    flex-shrink: 0;
    text-align: left;
    color: rgb(1, 75, 145);
  }

  .hour-col {
    flex: 1;
    display: flex;
    justify-content: space-between;
    min-width: 300px;
    padding: 0 4px;

    .hour-label {
      flex: 1;
      font-family: "Segoe UI", Arial, "Liberation Sans", "DejaVu Sans", sans-serif;
      font-size: 14px;
      // color: #7a879a;
      color: #587702;
      text-align: center;
    }
  }

  // .time-range-col {
  //   width: 130px;
  //   flex-shrink: 0;
  //   text-align: center;
  // }

  .action-col {
    width: 60px;
    flex-shrink: 0;
    text-align: center;
    color: rgb(2, 121, 65);
  }
}

/* ===== 任务行 ===== */
.task-rows {
  min-height: 60px;

  .empty-state {
    padding: 50px 0;
    font-size: 32px;
    font-weight: 600;
    color: #b0b8c5;
    text-align: center;

    .empty-text {
      margin-left: 10px;
    }

    .empty-text-start {
      color: rgba(233, 76, 4, 0.7);
    }

    .empty-text-end {
      margin-left: 10px;
    }
  }
}

.task-row {
  display: flex;
  align-items: center;
  min-width: 750px;
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
  width: 160px;
  flex-shrink: 0;
  font-size: 14px;
  color: #1a2332;
  font-weight: 450;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  &.done {
    background: #4a7a5c;
  }

  &.in_progress {
    background: #5a6a8a;
  }

  &.overdue {
    background: #b15353;
  }

  &.not_started {
    background: #d5dce8;
  }
}

.task-name {
  font-family: "Microsoft YaHei", "SimHei", "Noto Sans CJK SC", "SimSun", sans-serif;
  font-size: 14px;
}

.bar-track {
  position: relative;
  flex: 1;
  min-width: 200px;
  height: 26px;
  margin: 0 4px;
  background: #eef0f5;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
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
    min-width: 12px;
    cursor: pointer;

    &.bar-done {
      background: linear-gradient(90deg, #4a7a5c, #6a9a7c);
    }

    &.bar-pending {
      background: linear-gradient(90deg, #5a6a8a, #7a8aaa);
    }

    &.bar-overdue {
      background: linear-gradient(90deg, #b15353, #d47373);
      animation: pulse-overdue 1.5s ease-in-out infinite;
    }

    &.bar-not-started {
      background: linear-gradient(90deg, #d5dce8, #8d8e91);
      opacity: 0.7;
    }
  }
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
  right: -10px;
  top: -10px;
  background: #4a7a5c;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(74, 122, 92, 0.35);
}

// /* ===== 时间范围 ===== */
// .time-range {
//   width: 130px;
//   flex-shrink: 0;
//   text-align: center;
//   font-size: 13px;
//   color: #5a6a7a;
//   font-weight: 450;
//   font-variant-numeric: tabular-nums;
// }


.action {
  display: flex;
  justify-content: center;
  width: 60px;
  flex-shrink: 1;

  .update-btn {
    background: none;
    border: none;
    border-radius: 8px;
    color: #c8ced8;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      color: rgb(94, 165, 1);
    }

    svg {
      width: 15px;
      height: 15px;
    }
  }

  .delete-btn {
    // display: flex;
    // align-items: center;
    // justify-content: center;
    // width: 44px;
    // height: 36px;
    // flex-shrink: 0;
    background: none;
    border: none;
    border-radius: 8px;
    color: #c8ced8;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      color: #b15353;
    }

    svg {
      width: 15px;
      height: 15px;
    }
  }
}

/* ===== 底部添加区 ===== */
.task-operate {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid #edf0f5;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
  }
}

.add-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  background: rgba(20, 99, 0, 0.8);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(20, 99, 0, 1);
    font-weight: 600;
    transform: scale(0.97);
  }

  .add-text {
    margin-left: 3px;
  }
}

.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  background: rgba(209, 50, 2, 0.2);
  color: #d44502;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(209, 50, 2, 1);
    font-weight: 600;
    color: #f1ebeb;
    transform: scale(0.97);
  }

  .clear-text {
    margin-left: 3px;
  }
}

/* ===== 响应式 ===== */
@media (max-width: 800px) {
  .gantt-container {
    padding: 16px 12px;
  }

  .gantt-header {
    flex-direction: column;
    align-items: stretch;
  }

  .date-nav {
    justify-content: center;
  }

  .stat-num {
    font-size: 15px;
  }

  .task-label {
    width: 80px;
    font-size: 12px;
  }

  // .time-range {
  //   width: 100px;
  //   font-size: 12px;
  // }

  .time-input {
    width: 90px;
  }

  .time-sep {
    display: none;
  }
}
</style>