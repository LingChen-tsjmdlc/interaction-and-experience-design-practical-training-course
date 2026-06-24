import type { Education, ReplacementType, Timeline } from "@/types";

/**
 * AI 冲击指数颜色方案（绿 → 黄 → 红）
 * 与原项目 d3.scaleLinear domain [0, 2.5, 5, 7.5, 10] 完全一致
 */
const COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [0, [26, 150, 65]], // #1a9641 绿
  [2.5, [166, 217, 106]], // #a6d96a 浅绿
  [5, [254, 224, 139]], // #fee08b 黄
  [7.5, [244, 109, 67]], // #f46d43 橙
  [10, [215, 48, 39]], // #d73027 红
];

function interpolate(
  t: number,
  c1: [number, number, number],
  c2: [number, number, number],
): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

/**
 * 根据 AI 冲击指数返回 hex 颜色
 * @param exp 0-10
 */
export function colorScale(exp: number): string {
  const clamped = Math.max(0, Math.min(10, exp));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [d1, c1] = COLOR_STOPS[i];
    const [d2, c2] = COLOR_STOPS[i + 1];
    if (clamped >= d1 && clamped <= d2) {
      const t = (clamped - d1) / (d2 - d1);
      const [r, g, b] = interpolate(t, c1, c2);
      return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    }
  }
  return "#d73027";
}

/** 替代类型 → 中文标签 */
export const rtLabels: Record<ReplacementType, string> = {
  full: "完全替代",
  partial: "部分替代",
  augment: "辅助增强",
};

/** 时间窗口 → 中文标签 */
export const tlLabels: Record<Timeline, string> = {
  "1-3y": "1-3年",
  "3-5y": "3-5年",
  "5-10y": "5-10年",
  "10y+": "10年以上",
};

/** 学历排序（用于箱线图 X 轴） */
export const eduOrder: Education[] = ["初中及以下", "高中/中专", "大专", "本科", "硕士及以上"];

/** 就业人数格式化（万 → 亿） */
export function formatEmp(emp: number): string {
  if (emp >= 10000) {
    return (emp / 10000).toFixed(1) + "亿";
  }
  return emp.toLocaleString() + "万";
}
