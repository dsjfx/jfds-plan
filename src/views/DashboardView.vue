<template>
  <div class="dashboard-view">
    <div class="page-header">
      <h1>仪表盘</h1>
      <p>今日任务概览</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card completion-card">
        <div class="completion-ring">
          <svg viewBox="0 0 100 100">
            <circle
              class="bg"
              cx="50"
              cy="50"
              r="40"
            />
            <circle
              class="progress"
              cx="50"
              cy="50"
              r="40"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="completion-text">
            <div class="percentage">
              {{ taskStore.stats.completionRate }}%
            </div>
            <div class="label">
              完成率
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="value">
          {{ taskStore.stats.totalTasks }}
        </div>
        <div class="label">
          总任务
        </div>
      </div>

      <div class="stat-card">
        <div class="value">
          {{ taskStore.stats.completedTasks }}
        </div>
        <div class="label">
          已完成
        </div>
      </div>

      <div class="stat-card">
        <div class="value">
          {{ taskStore.stats.pendingTasks }}
        </div>
        <div class="label">
          待完成
        </div>
      </div>

      <div class="stat-card">
        <div class="value">
          {{ taskStore.stats.overdueTasks }}
        </div>
        <div class="label">
          已逾期
        </div>
      </div>
    </div>

    <div class="task-section">
      <div class="section-header">
        <span class="section-title">📋 任务列表</span>
        <div class="task-filters">
          <button
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
          >
            全部
          </button>
          <button
            :class="{ active: filter === 'in-progress' }"
            @click="filter = 'in-progress'"
          >
            进行中
          </button>
          <button
            :class="{ active: filter === 'completed' }"
            @click="filter = 'completed'"
          >
            已完成
          </button>
        </div>
      </div>

      <div class="task-list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="task.status"
        >
          <input
            type="checkbox"
            :checked="task.status === 'completed'"
            @change="taskStore.toggleTaskStatus(task)"
          >
          <span class="task-title">{{ task.title }}</span>
          <span
            v-if="task.status === 'in-progress' || task.status === 'overdue'"
            class="priority-dot"
          />
          <span class="task-time">{{ task.startTime }}</span>
          <button
            class="delete-btn"
            @click="taskStore.deleteTask(task.id)"
          >
            ×
          </button>
        </div>
      </div>

      <div class="add-task">
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="添加新任务..."
          @keyup.enter="addNewTask"
        >
        <input
          v-model="newTaskTime"
          type="time"
        >
        <button
          class="add-btn"
          @click="addNewTask"
        >
          添加
        </button>
      </div>

      <button
        class="clear-completed"
        @click="taskStore.clearCompleted"
      >
        🗑️ 清除已完成
      </button>
    </div>

    <div class="chart-section">
      <div class="section-header">
        <span class="section-title">📈 任务趋势</span>
      </div>
      <v-chart
        :option="chartOption"
        class="chart-container"
        autoresize
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { useTaskStore } from "@/stores/task";
import { useThemeStore } from "@/stores/theme";
import { today } from "@/data/staticData";
import { chartColors } from "@/composables/useECharts";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const taskStore = useTaskStore();
const themeStore = useThemeStore();
const filter = ref<"all" | "in-progress" | "completed">("all");
const newTaskTitle = ref("");
const newTaskTime = ref("18:00");

const circumference = 251.2;
const dashOffset = computed(() => {
  const progress = taskStore.stats.completionRate / 100;
  return circumference * (1 - progress);
});

const filteredTasks = computed(() => {
  if (filter.value === "all") return taskStore.tasks;
  return taskStore.tasks.filter((t) => t.status === filter.value);
});

const addNewTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  await taskStore.addTask({
    title: newTaskTitle.value.trim(),
    status: "todo",
    startTime: newTaskTime.value,
    endTime: newTaskTime.value,
    date: today,
  });
  newTaskTitle.value = "";
};

const chartOption = computed(() => {
  const colors = chartColors[themeStore.theme];
  return {
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.cardBg,
      borderColor: colors.border,
      textStyle: {
        color: colors.textPrimary,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      axisLine: {
        lineStyle: {
          color: colors.border,
        },
      },
      axisLabel: {
        color: colors.textSecondary,
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: colors.border,
        },
      },
      axisLabel: {
        color: colors.textSecondary,
      },
      splitLine: {
        lineStyle: {
          color: colors.border,
        },
      },
    },
    series: [
      {
        name: "完成任务",
        type: "line",
        smooth: true,
        data: [3, 5, 4, 6, 5, 2, 1],
        itemStyle: {
          color: colors.completed,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colors.completed },
              { offset: 1, color: "rgba(255,255,255,0)" },
            ],
          },
        },
      },
      {
        name: "待完成",
        type: "line",
        smooth: true,
        data: [2, 1, 3, 2, 3, 4, 5],
        itemStyle: {
          color: colors.inProgress,
        },
      },
    ],
  };
});

onMounted(() => {
  taskStore.loadTasks();
});
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.dashboard-view {
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

.stats-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 20px;
  box-shadow: var(--shadow);
  text-align: center;

  .value {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  .label {
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.completion-card {
  display: flex;
  justify-content: center;
  align-items: center;
}

.completion-ring {
  position: relative;
  width: 120px;
  height: 120px;

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);

    circle {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
    }

    .bg {
      stroke: var(--border-color);
    }

    .progress {
      stroke: var(--color-completed);
      transition: stroke-dashoffset 0.5s ease;
    }
  }

  .completion-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    .percentage {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

.task-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-filters {
  display: flex;
  gap: 8px;

  button {
    background: transparent;
    border: none;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 14px;

    &.active {
      background: var(--border-color);
      color: var(--text-primary);
    }
  }
}

.task-list {
  margin-bottom: 20px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  &.completed .task-title {
    text-decoration: line-through;
    color: var(--text-secondary);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .task-title {
    flex: 1;
    color: var(--text-primary);
  }

  .priority-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-overdue);
  }

  .task-time {
    color: var(--text-secondary);
    font-size: 14px;
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
}

.add-task {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  input[type="text"] {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: var(--bg-color);
    color: var(--text-primary);
    font-size: 16px;
  }

  input[type="time"] {
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: var(--bg-color);
    color: var(--text-primary);
    font-size: 16px;
  }

  .add-btn {
    background: var(--text-primary);
    color: var(--card-bg);
    border: none;
    padding: 12px 24px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
  }
}

.clear-completed {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 8px;

  &:hover {
    color: var(--text-primary);
  }
}

.chart-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
