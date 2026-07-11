<template>
  <div class="charts-view">
    <div class="page-header">
      <h1>图表中心</h1>
      <p>多种数据可视化展示</p>
    </div>

    <div class="query-panel card">
      <div class="query-header">
        <div>
          <h2>历史规划查询</h2>
          <p>按时间范围和状态查看历史任务统计。</p>
        </div>
        <div class="query-controls">
          <div class="range-buttons">
            <button :class="{ active: range === '7d' }" @click="range = '7d'">近7天</button>
            <button :class="{ active: range === '30d' }" @click="range = '30d'">近30天</button>
            <button :class="{ active: range === '90d' }" @click="range = '90d'">近90天</button>
          </div>
          <select v-model="statusFilter" class="status-select">
            <option value="all">全部状态</option>
            <option value="completed">已完成</option>
            <option value="in-progress">进行中</option>
            <option value="todo">待处理</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
      </div>

      <div class="query-summary">
        <div class="summary-item">
          <div class="summary-value">{{ queryStats.total }}</div>
          <div class="summary-label">总任务</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">{{ queryStats.completed }}</div>
          <div class="summary-label">已完成</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">{{ queryStats.pending }}</div>
          <div class="summary-label">待处理</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">{{ queryStats.overdue }}</div>
          <div class="summary-label">已逾期</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>任务分布（饼图）</h3>
        </div>
        <v-chart :option="pieChartOption" class="chart-wrapper" autoresize />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>周任务统计（柱状图）</h3>
        </div>
        <v-chart :option="barChartOption" class="chart-wrapper" autoresize />
      </div>

      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>任务完成趋势（折线图）</h3>
        </div>
        <v-chart :option="lineChartOption" class="chart-wrapper" autoresize />
      </div>

      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>任务优先级分布（雷达图）</h3>
        </div>
        <v-chart :option="radarChartOption" class="chart-wrapper" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, BarChart, LineChart, RadarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { useThemeStore } from "@/stores/theme";
import { chartColors } from "@/composables/useECharts";

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
]);

const themeStore = useThemeStore();
const range = ref<'7d' | '30d' | '90d'>('7d');
const statusFilter = ref<'all' | 'completed' | 'in-progress' | 'todo' | 'overdue'>('all');

const queryStats = computed(() => {
  const base = {
    total: 24,
    completed: 14,
    pending: 6,
    overdue: 4,
  };

  if (statusFilter.value === 'all') {
    return base;
  }

  return {
    total: base.total,
    completed: statusFilter.value === 'completed' ? base.completed : 0,
    pending: statusFilter.value === 'in-progress' || statusFilter.value === 'todo' ? base.pending : 0,
    overdue: statusFilter.value === 'overdue' ? base.overdue : 0,
  };
});

const pieChartOption = computed(() => {
  const colors = chartColors[themeStore.theme];
  return {
    tooltip: {
      trigger: "item",
      backgroundColor: colors.cardBg,
      borderColor: colors.border,
      textStyle: {
        color: colors.textPrimary,
      },
    },
    legend: {
      top: "bottom",
      textStyle: {
        color: colors.textSecondary,
      },
    },
    series: [
      {
        name: "任务状态",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: colors.cardBg,
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
            color: colors.textPrimary,
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 4, name: "已完成", itemStyle: { color: colors.completed } },
          { value: 3, name: "进行中", itemStyle: { color: colors.inProgress } },
          { value: 2, name: "待处理", itemStyle: { color: "#9e9e9e" } },
          { value: 1, name: "已逾期", itemStyle: { color: colors.overdue } },
        ],
      },
    ],
  };
});

const barChartOption = computed(() => {
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
        name: "任务数量",
        type: "bar",
        data: [5, 7, 6, 8, 5, 3, 2],
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colors.completed },
              { offset: 1, color: colors.inProgress },
            ],
          },
        },
      },
    ],
  };
});

const lineChartOption = computed(() => {
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
    legend: {
      textStyle: {
        color: colors.textSecondary,
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
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
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
        data: [120, 132, 101, 134, 90, 230, 210],
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
        name: "新增任务",
        type: "line",
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: {
          color: colors.inProgress,
        },
      },
    ],
  };
});

const radarChartOption = computed(() => {
  const colors = chartColors[themeStore.theme];
  return {
    tooltip: {
      backgroundColor: colors.cardBg,
      borderColor: colors.border,
      textStyle: {
        color: colors.textPrimary,
      },
    },
    radar: {
      indicator: [
        { name: "工作", max: 10 },
        { name: "学习", max: 10 },
        { name: "健康", max: 10 },
        { name: "社交", max: 10 },
        { name: "娱乐", max: 10 },
        { name: "休息", max: 10 },
      ],
      axisName: {
        color: colors.textSecondary,
      },
      splitArea: {
        areaStyle: {
          color: colors.border,
          opacity: 0.2,
        },
      },
      axisLine: {
        lineStyle: {
          color: colors.border,
        },
      },
      splitLine: {
        lineStyle: {
          color: colors.border,
        },
      },
    },
    series: [
      {
        name: "任务分布",
        type: "radar",
        data: [
          {
            value: [8, 6, 5, 4, 3, 7],
            name: "本周",
            areaStyle: {
              color: colors.completed,
              opacity: 0.3,
            },
            lineStyle: {
              color: colors.completed,
            },
            itemStyle: {
              color: colors.completed,
            },
          },
        ],
      },
    ],
  };
});
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.charts-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.query-panel {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
  padding: 24px;
}

.chart-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-card .chart-wrapper {
  flex: 1;
  min-height: 300px;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.chart-header {
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.query-panel {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.query-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.range-buttons {
  display: flex;
  gap: 10px;
}

.range-buttons button,
.status-select {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.range-buttons button.active {
  background: var(--text-primary);
  color: var(--card-bg);
  border-color: transparent;
}

.status-select {
  min-width: 160px;
}

.query-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-item {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
  text-align: center;
}

.chart-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.chart-card.full-width {
  grid-column: span 2;
}

.chart-card .chart-wrapper {
  flex: 1;
  min-height: 300px;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.chart-header {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.chart-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);

  &.full-width {
    grid-column: span 2;
  }
}

.chart-header {
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
  }
}

.chart-wrapper {
  width: 100%;
  height: 300px;
}

.full-width .chart-wrapper {
  height: 350px;
}
</style>
