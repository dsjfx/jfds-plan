<template>
  <div class="page">
    <GanttChart @task-toggle="onTaskToggle" @task-add="onTaskAdd" @task-delete="onTaskDelete"
      @date-change="onDateChange" @error="onError" />
  </div>
</template>

<script setup lang="ts">
import GanttChart from '@/components/core/GanttChart.vue'
import type { GanttTask } from '@/types/task'

const onTaskToggle = (task: GanttTask) => {
  console.log('任务切换:', task)
}

const onTaskAdd = (task: GanttTask) => {
  console.log('任务添加:', task)
}

const onTaskDelete = (taskId: number) => {
  console.log('任务删除:', taskId)
}

const onDateChange = (date: string) => {
  console.log('日期切换:', date)
}

const onError = (message: string | null) => {
  console.error('错误:', message)
}
</script>

<style scoped>
.page {
  max-width: 1200px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 24px 20px;
  /* background: #f5f7fb; */
}
</style>