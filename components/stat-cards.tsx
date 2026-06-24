"use client";

import { Card } from "@heroui/react";

import type { SiteMeta } from "@/types";

export default function StatCards({ meta }: { meta: SiteMeta }) {
  const cards = [
    {
      value: String(meta.total_jobs),
      label: "总职业数",
    },
    {
      value: meta.weighted_avg_exp.toFixed(1),
      suffix: "/ 10",
      label: "加权平均冲击指数",
    },
    {
      value: meta.high_exp_pct.toFixed(1) + "%",
      label: "高冲击(≥7)就业占比",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto my-8">
      {cards.map((c) => (
        <Card key={c.label} className="p-5 text-center bg-content2" shadow="none" radius="lg">
          <div className="text-3xl font-bold text-foreground">
            {c.value}
            {c.suffix && <span className="text-xs text-default-400 ml-1">{c.suffix}</span>}
          </div>
          <div className="text-xs text-default-500 mt-1">{c.label}</div>
        </Card>
      ))}
    </div>
  );
}
