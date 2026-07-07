<template>
  <div class="charts-view">
    <div class="page-header">
      <h1>图表中心</h1>
      <p>多种数据可视化展示</p>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>任务分布（饼图）</h3>
        </div>
        <v-chart
          :option="pieChartOption"
          class="chart-wrapper"
          autoresize
        />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>周任务统计（柱状图）</h3>
        </div>
        <v-chart
          :option="barChartOption"
          class="chart-wrapper"
          autoresize
        />
      </div>

      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>任务完成趋势（折线图）</h3>
        </div>
        <v-chart
          :option="lineChartOption"
          class="chart-wrapper"
          autoresize
        />
      </div>

      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>任务优先级分布（雷达图）</h3>
        </div>
        <v-chart
          :option="radarChartOption"
          class="chart-wrapper"
          autoresize
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
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
