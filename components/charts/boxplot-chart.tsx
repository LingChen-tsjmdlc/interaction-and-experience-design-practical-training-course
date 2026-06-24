"use client";

import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts/core";
import { BoxplotChart, ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";

import { colorScale, eduOrder } from "@/lib/color";
import type { RawJob } from "@/types";

echarts.use([BoxplotChart, ScatterChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default function BoxplotChartComponent({
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

  // 计算箱线图数据
  const { boxData, outlierData, medians } = useMemo(() => {
    const groups: Record<string, number[]> = {};
    for (const edu of eduOrder) {
      groups[edu] = [];
    }
    for (const j of jobs) {
      if (groups[j.edu]) {
        groups[j.edu].push(j.exp);
      }
    }

    const box: Array<[number, number, number, number, number]> = [];
    const outliers: Array<[number, number]> = [];
    const meds: number[] = [];

    eduOrder.forEach((edu, idx) => {
      const vals = groups[edu].sort((a, b) => a - b);
      if (vals.length === 0) {
        box.push([0, 0, 0, 0, 0]);
        meds.push(0);
        return;
      }
      const q1 = quantile(vals, 0.25);
      const med = quantile(vals, 0.5);
      const q3 = quantile(vals, 0.75);
      const iqr = q3 - q1;
      const lo = Math.max(vals[0], q1 - 1.5 * iqr);
      const hi = Math.min(vals[vals.length - 1], q3 + 1.5 * iqr);

      box.push([lo, q1, med, q3, hi]);
      meds.push(med);

      // 离群点
      for (const v of vals) {
        if (v < lo || v > hi) {
          outliers.push([idx, v]);
        }
      }
    });

    return { boxData: box, outlierData: outliers, medians: meds };
  }, [jobs]);

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

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: isDark ? "#161b22" : "#fff",
        borderColor: isDark ? "#30363d" : "#e5e7eb",
        textStyle: { color: isDark ? "#e6edf3" : "#1f2937" },
        formatter: (params: { name: string; value: number[] }) => {
          const v = params.value;
          return `
            <div style="font-size:14px;font-weight:600">${params.name}</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"};margin-top:4px">最高: ${v[4]}</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">Q3: ${v[3]}</div>
            <div style="font-size:12px;color:${colorScale(v[2])};font-weight:700">中位数: ${v[2]}</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">Q1: ${v[1]}</div>
            <div style="font-size:12px;color:${isDark ? "#8b949e" : "#6b7280"}">最低: ${v[0]}</div>
          `;
        },
      },
      grid: { top: 20, right: 20, bottom: 60, left: 50 },
      xAxis: {
        type: "category",
        data: eduOrder,
        axisLabel: {
          color: isDark ? "#8b949e" : "#6b7280",
          fontSize: 10,
          rotate: 20,
        },
        axisLine: { lineStyle: { color: isDark ? "#30363d" : "#e5e7eb" } },
        splitLine: { show: false },
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
          name: "boxplot",
          type: "boxplot",
          data: boxData,
          itemStyle: {
            color: (params: { dataIndex: number }) => {
              const med = medians[params.dataIndex] ?? 5;
              const c = colorScale(med);
              return c + "40"; // 25% opacity
            },
            borderColor: (params: { dataIndex: number }) => {
              const med = medians[params.dataIndex] ?? 5;
              return colorScale(med);
            },
            borderWidth: 1.5,
          },
        },
        {
          name: "outlier",
          type: "scatter",
          data: outlierData,
          symbolSize: 4,
          itemStyle: {
            color: isDark ? "#8b949e80" : "#9ca3af80",
          },
        },
      ],
    });
  }, [boxData, outlierData, medians, isDark]);

  return <div ref={chartRef} style={{ width: "100%", height: fullscreen ? "100%" : 300 }} />;
}

/** 简易分位数计算 */
function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}
