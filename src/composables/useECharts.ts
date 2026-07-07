import { onMounted, onUnmounted, watch, type Ref } from "vue";
import * as echarts from "echarts";
import { useThemeStore } from "@/stores/theme";

// 预定义的主题颜色
export const chartColors = {
  light: {
    completed: "#4a9f7a",
    inProgress: "#6b7aa1",
    overdue: "#c75050",
    textPrimary: "#2c3e50",
    textSecondary: "#64748b",
    border: "#e0e0e0",
    cardBg: "#ffffff",
    bg: "#f0f2f5",
  },
  dark: {
    completed: "#6dd4a5",
    inProgress: "#94a3b8",
    overdue: "#f87171",
    textPrimary: "#e4e4e7",
    textSecondary: "#94a3b8",
    border: "#334155",
    cardBg: "#16213e",
    bg: "#1a1a2e",
  },
};

export const useECharts = (
  chartRef: Ref<HTMLElement | undefined>,
  getOption: (colors: typeof chartColors.light) => echarts.EChartsOption,
) => {
  let chartInstance: echarts.ECharts | null = null;
  const themeStore = useThemeStore();

  const initChart = () => {
    if (!chartRef.value) return;

    chartInstance = echarts.init(chartRef.value);

    const colors = chartColors[themeStore.theme];
    const option = getOption(colors);
    chartInstance.setOption(option);
  };

  const updateChart = () => {
    if (chartInstance) {
      const colors = chartColors[themeStore.theme];
      const option = getOption(colors);
      chartInstance.setOption(option, true);
    }
  };

  const resizeChart = () => {
    chartInstance?.resize();
  };

  // 监听主题变化
  watch(
    () => themeStore.theme,
    () => {
      updateChart();
    },
  );

  onMounted(() => {
    setTimeout(initChart, 100);
    window.addEventListener("resize", resizeChart);
  });

  onUnmounted(() => {
    chartInstance?.dispose();
    window.removeEventListener("resize", resizeChart);
  });

  return {
    chartInstance,
    initChart,
    updateChart,
    resizeChart,
  };
};
