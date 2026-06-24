"use client";

import { colorScale } from "@/lib/color";

export default function ColorLegend() {
  const stops = Array.from({ length: 21 }, (_, i) => {
    const v = (i / 20) * 10;
    return `${colorScale(v)} ${(i / 20) * 100}%`;
  }).join(", ");

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-default-500 mt-3">
      <span>低冲击 0</span>
      <div
        className="w-48 h-3 rounded-full shrink-0"
        style={{ background: `linear-gradient(to right, ${stops})` }}
      />
      <span>10 高冲击</span>
      <span className="ml-6">面积 = 从业人数（万人）</span>
    </div>
  );
}
