"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";

import { colorScale, formatEmp } from "@/lib/color";
import type { RawJob } from "@/types";

echarts.use([BarChart, GridComponent, TooltipComponent, VisualMapComponent, CanvasRenderer]);

export default function HistogramChart({
  jobs,
  fullscreen = false,
}: {
  jobs: RawJob[];
  fullscreen?: boolean;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) {
      return;
    }

    // 按冲击指数 0-10 分桶
    const bins = Array.from({ length: 11 }, (_, i) => ({
      exp: i,
      emp: 0,
      cnt: 0,
    }));
    for (const j of jobs) {
      if (bins[j.exp]) {
        bins[j.exp].emp += j.emp;
        bins[j.exp].cnt++;
      }
    }

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: isDark ? "#161b22" : "#fff",
        borderColor: isDark ? "#30363d" : "#e5e7eb",
        textStyle: { color: isDark ? "#e6edf3" : "#1f2937" },
        formatter: (params: Array<{ dataIndex: number }>) => {
          const b = bins[params[0].dataIndex];
          if (!b.cnt) {
            return "";
          }
          return `
            <div style="font-size:14px;font-weight:600;margin-bottom:4px">AI冲击指数: ${b.exp} 分</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">职业数量: ${b.cnt} 个</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">涉及就业: ${formatEmp(b.emp)}</div>
          `;
        },
      },
      grid: { top: 30, right: 30, bottom: 50, left: 60 },
      xAxis: {
        type: "category",
        data: bins.map((b) => `${b.exp}`),
        name: "AI冲击指数",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { color: isDark ? "#8b949e" : "#6b7280", fontSize: 12 },
        axisLabel: { color: isDark ? "#8b949e" : "#6b7280" },
        axisLine: { lineStyle: { color: isDark ? "#30363d" : "#e5e7eb" } },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "就业人数（万）",
        nameTextStyle: { color: isDark ? "#8b949e" : "#6b7280", fontSize: 12 },
        axisLabel: {
          color: isDark ? "#8b949e" : "#6b7280",
          formatter: (v: number) => (v >= 10000 ? v / 10000 + "亿" : v + "万"),
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: isDark ? "#21262d" : "#f3f4f6" } },
      },
      series: [
        {
          type: "bar",
          data: bins.map((b) => ({
            value: b.emp,
            itemStyle: { color: colorScale(b.exp), borderRadius: [4, 4, 0, 0] },
          })),
          barWidth: "80%",
          label: {
            show: true,
            position: "top",
            color: isDark ? "#8b949e" : "#6b7280",
            fontSize: 11,
            formatter: (p: { value: number }) =>
              p.value > 0
                ? p.value >= 10000
                  ? (p.value / 10000).toFixed(1) + "亿"
                  : p.value.toLocaleString()
                : "",
          },
        },
      ],
    });
  }, [jobs, isDark]);

  return <div ref={chartRef} style={{ width: "100%", height: fullscreen ? "100%" : 280 }} />;
}
