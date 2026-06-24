"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";

import { colorScale, formatEmp } from "@/lib/color";
import type { RawJob } from "@/types";

echarts.use([ScatterChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default function ScatterChartComponent({
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

    const maxSal = Math.max(...jobs.map((j) => j.sal));

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: isDark ? "#161b22" : "#fff",
        borderColor: isDark ? "#30363d" : "#e5e7eb",
        textStyle: { color: isDark ? "#e6edf3" : "#1f2937" },
        formatter: (params: { data: [number, number, number, string, string] }) => {
          const [, exp, emp, name, sub] = params.data;
          return `
            <div style="font-size:14px;font-weight:600">${name}</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">${sub}</div>
            <div style="font-size:12px;margin-top:6px">月薪中位: <strong>${params.data[0]}K</strong></div>
            <div style="font-size:12px">AI冲击: <strong style="color:${colorScale(exp)}">${exp}/10</strong></div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">从业: ${formatEmp(emp)}</div>
          `;
        },
      },
      grid: { top: 20, right: 20, bottom: 50, left: 50 },
      xAxis: {
        type: "value",
        name: "月薪中位数(K)",
        nameLocation: "middle",
        nameGap: 32,
        min: 0,
        max: maxSal + 2,
        nameTextStyle: { color: isDark ? "#8b949e" : "#6b7280", fontSize: 11 },
        axisLabel: { color: isDark ? "#8b949e" : "#6b7280" },
        axisLine: { lineStyle: { color: isDark ? "#30363d" : "#e5e7eb" } },
        splitLine: { lineStyle: { color: isDark ? "#21262d" : "#f3f4f6" } },
      },
      yAxis: {
        type: "value",
        name: "AI冲击指数",
        nameTextStyle: { color: isDark ? "#8b949e" : "#6b7280", fontSize: 11 },
        min: 0,
        max: 10.5,
        axisLabel: { color: isDark ? "#8b949e" : "#6b7280" },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: isDark ? "#21262d" : "#f3f4f6" } },
      },
      series: [
        {
          type: "scatter",
          data: jobs.map((j) => [j.sal, j.exp, j.emp, j.n, j.sub]),
          symbolSize: (data: number[]) => {
            const maxEmp = Math.max(...jobs.map((j) => j.emp));
            const base = fullscreen ? 72 : 36;
            const minSize = fullscreen ? 12 : 6;
            const maxSize = fullscreen ? 88 : 40;
            const scale = Math.sqrt(data[2] / maxEmp) * base + minSize;
            return Math.max(minSize, Math.min(maxSize, scale));
          },
          itemStyle: {
            opacity: 0.6,
            color: (params: { data: [number, number, number, string, string] }) =>
              colorScale(params.data[1]),
          },
        },
      ],
    });
  }, [jobs, isDark]);

  return <div ref={chartRef} style={{ width: "100%", height: fullscreen ? "100%" : 300 }} />;
}
