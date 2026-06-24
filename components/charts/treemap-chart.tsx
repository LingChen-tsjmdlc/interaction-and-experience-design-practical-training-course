"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { TreemapChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "next-themes";

import { colorScale, formatEmp, rtLabels, tlLabels } from "@/lib/color";
import type { RawJob } from "@/types";

echarts.use([TreemapChart, TooltipComponent, CanvasRenderer]);

interface TreemapProps {
  jobs: RawJob[];
  /** 搜索关键词，匹配的职业会高亮 */
  searchQuery?: string;
  /** 高亮的职业 code，优先于 searchQuery */
  highlightCode?: string | null;
  /** 全屏模式：撑满父容器高度 */
  fullscreen?: boolean;
}

interface TreemapLeafNode {
  name: string;
  value: number;
  itemStyle: { color: string; borderColor?: string };
  _job: RawJob;
}

interface TreemapCatNode {
  name: string;
  value: number;
  children: TreemapLeafNode[];
  _avgExp?: number;
  _count?: number;
}

const DIM_COLOR = "#3a3a3a";

export default function TreemapChartComponent({
  jobs,
  searchQuery = "",
  highlightCode = null,
  fullscreen = false,
}: TreemapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [containerWidth, setContainerWidth] = useState(0);

  // 测量容器宽度，用于响应式高度
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }
    const el = chartRef.current;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 构建搜索匹配集合
  const matchSet = useMemo(() => {
    if (highlightCode) {
      return new Set([highlightCode]);
    }
    if (!searchQuery.trim()) {
      return null;
    }
    const q = searchQuery.trim().toLowerCase();
    const set = new Set<string>();
    for (const j of jobs) {
      if (j.n.toLowerCase().includes(q) || j.sub.toLowerCase().includes(q)) {
        set.add(j.c);
      }
    }
    return set;
  }, [searchQuery, highlightCode, jobs]);

  // 构建树数据（搜索时变暗未匹配的格子）
  const treeData = useMemo(() => {
    const grouped = new Map<string, RawJob[]>();
    for (const job of jobs) {
      if (!grouped.has(job.cat)) {
        grouped.set(job.cat, []);
      }
      grouped.get(job.cat)!.push(job);
    }

    const children: TreemapCatNode[] = [];

    for (const [cat, items] of grouped) {
      const catChildren: TreemapLeafNode[] = items
        .map((j) => {
          const isMatch = !matchSet || matchSet.has(j.c);
          return {
            name: j.n,
            value: Math.max(j.emp, 1),
            itemStyle: {
              color: isMatch ? colorScale(j.exp) : DIM_COLOR,
              borderColor: matchSet && isMatch ? "#fff" : undefined,
              borderWidth: matchSet && isMatch ? 2 : 0,
            },
            _job: j,
          } as TreemapLeafNode;
        })
        .sort((a, b) => b.value - a.value);

      children.push({
        name: cat,
        value: catChildren.reduce((s, c) => s + c.value, 0),
        children: catChildren,
        _avgExp: catChildren.reduce((s, c) => s + c._job.exp, 0) / catChildren.length,
        _count: catChildren.length,
      });
    }

    children.sort((a, b) => b.value - a.value);
    return children;
  }, [jobs, matchSet]);

  // 响应式高度：全屏模式撑满容器，否则按比例计算
  const chartHeight = useMemo(() => {
    if (fullscreen) {
      return "100%";
    }
    if (containerWidth === 0) {
      return 600;
    }
    const isMobile = containerWidth < 768;
    return isMobile ? Math.max(400, containerWidth * 0.8) : Math.max(600, containerWidth * 0.55);
  }, [containerWidth, fullscreen]);

  // 初始化 chart
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
    });
    chartInstance.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, []);

  // 更新 option
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) {
      return;
    }

    const isMobile = (chartRef.current?.clientWidth ?? 0) < 768;

    // tooltip 移动端样式适配
    const ttPad = isMobile ? 10 : 16;
    const ttFs = isMobile ? 11 : 13;
    const ttTitleFs = isMobile ? 13 : 15;
    const ttGridFs = isMobile ? 10 : 12;
    const ttDescFs = isMobile ? 9 : 11;
    const ttFootFs = isMobile ? 8 : 10;
    const ttMaxW = isMobile ? 200 : 280;
    const ttGap = isMobile ? "3px 8px" : "4px 12px";

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: isDark ? "#161b22" : "#fff",
        borderColor: isDark ? "#30363d" : "#e5e7eb",
        borderWidth: 1,
        borderRadius: isMobile ? 8 : 10,
        padding: ttPad,
        textStyle: {
          color: isDark ? "#e6edf3" : "#1f2937",
          fontSize: ttFs,
        },
        extraCssText: isMobile
          ? "box-shadow: 0 4px 16px rgba(0,0,0,.4); max-width: 210px;"
          : "box-shadow: 0 8px 30px rgba(0,0,0,.4);",
        formatter: (params: { data: TreemapLeafNode | TreemapCatNode }) => {
          const d = params.data as TreemapLeafNode;
          // 叶子节点（职业）
          if ((d as TreemapLeafNode)._job) {
            const j = (d as TreemapLeafNode)._job;
            return `
              <div style="font-size:${ttTitleFs}px;font-weight:700;margin-bottom:${isMobile ? 4 : 8}px">${j.n}</div>
              <div style="display:flex;justify-content:space-between;font-size:${ttGridFs}px;margin-bottom:4px">
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">${j.sub}</span>
                <span style="font-weight:700;color:${colorScale(j.exp)}">${j.exp}/10</span>
              </div>
              <div style="background:${isDark ? "#21262d" : "#f3f4f6"};border-radius:4px;height:${isMobile ? 6 : 8}px;margin:4px 0 ${isMobile ? 6 : 10}px;overflow:hidden">
                <div style="height:100%;width:${j.exp * 10}%;background:${colorScale(j.exp)};border-radius:4px"></div>
              </div>
              <div style="display:grid;grid-template-columns:auto auto;gap:${ttGap};font-size:${ttGridFs}px">
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">替代类型</span><span style="font-weight:500">${rtLabels[j.rt]}</span>
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">时间窗口</span><span style="font-weight:500">${tlLabels[j.tl]}</span>
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">从业人数</span><span style="font-weight:500">${formatEmp(j.emp)}</span>
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">月薪中位</span><span style="font-weight:500">${j.sal}K</span>
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">学历要求</span><span style="font-weight:500">${j.edu}</span>
                <span style="color:${isDark ? "#8b949e" : "#6b7280"}">中国因素</span><span style="font-weight:500">${j.cf}</span>
              </div>
              <div style="margin-top:${isMobile ? 6 : 10}px;padding-top:${isMobile ? 6 : 10}px;border-top:1px solid ${isDark ? "#30363d" : "#e5e7eb"};font-size:${ttDescFs}px;line-height:1.5;color:${isDark ? "#8b949e" : "#6b7280"};max-width:${ttMaxW}px">${j.ra}</div>
              <div style="margin-top:6px;font-size:${ttFootFs}px;color:${isDark ? "#8b949e" : "#9ca3af"}">薪资金额为行业×岗位统计均值，实际因地区/企业差异较大</div>
            `;
          }
          // 大类节点
          const cat = params.data as TreemapCatNode;
          if (cat.children) {
            const avgExp = cat._avgExp ?? 0;
            const count = cat._count ?? cat.children.length;
            return `<div style="font-size:${ttTitleFs - 1}px;font-weight:600">${cat.name}</div>
              <div style="font-size:${ttGridFs}px;color:${isDark ? "#8b949e" : "#6b7280"};margin-top:4px">
                ${count} 个职业 · 从业 ${formatEmp(cat.value)} · 平均冲击 ${avgExp.toFixed(1)}
              </div>`;
          }
          return (params.data as TreemapCatNode).name ?? "";
        },
      },
      series: [
        {
          name: "职业冲击",
          type: "treemap",
          data: treeData,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          top: 4,
          bottom: 4,
          left: 4,
          right: 4,
          // 大类层标签
          upperLabel: {
            show: true,
            height: isMobile ? 16 : 22,
            color: isDark ? "#8b949e" : "#6b7280",
            fontSize: isMobile ? 9 : 11,
            fontWeight: 600,
            backgroundColor: "transparent",
            borderColor: "transparent",
          },
          // 叶子节点标签
          label: {
            show: true,
            formatter: (params: { data: TreemapLeafNode; value: number }) => {
              // 大格子才显示文字
              return params.data.name;
            },
            fontSize: isMobile ? 9 : 11,
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,.8)",
            overflow: "truncate",
            ellipsis: "…",
          },
          itemStyle: {
            borderColor: isDark ? "#0d1117" : "#fff",
            borderWidth: 1,
            gapWidth: 2,
          },
          emphasis: {
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              fontSize: isMobile ? 10 : 12,
            },
          },
          levels: [
            // 大类层
            {
              itemStyle: {
                borderColor: isDark ? "#161b22" : "#f3f4f6",
                borderWidth: 0,
                gapWidth: 2,
              },
              upperLabel: {
                show: true,
                height: isMobile ? 16 : 22,
              },
            },
            // 叶子层
            {
              colorSaturation: [0.35, 0.5],
              itemStyle: {
                borderColor: isDark ? "#0d1117" : "#fff",
                borderWidth: 1,
                gapWidth: 1,
              },
            },
          ],
        },
      ],
    });
  }, [treeData, isDark]);

  // 容器尺寸变化时 resize
  useEffect(() => {
    chartInstance.current?.resize();
  }, [chartHeight, containerWidth]);

  return <div ref={chartRef} style={{ width: "100%", height: chartHeight }} />;
}
