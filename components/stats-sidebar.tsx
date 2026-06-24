"use client";

import { useMemo } from "react";

import { colorScale, eduOrder, formatEmp, rtLabels, tlLabels } from "@/lib/color";
import type { RawJob, ReplacementType, Timeline } from "@/types";

interface StatsSidebarProps {
  jobs: RawJob[];
  totalJobs: number;
}

export default function StatsSidebar({ jobs, totalJobs }: StatsSidebarProps) {
  // 计算所有统计指标
  const stats = useMemo(() => {
    const totalEmp = jobs.reduce((s, j) => s + j.emp, 0);
    const weightedSum = jobs.reduce((s, j) => s + j.exp * j.emp, 0);
    const weightedAvg = totalEmp > 0 ? weightedSum / totalEmp : 0;

    // 冲击等级分布（按就业人数加权）
    const bands = [
      { label: "极低 (0-1)", min: 0, max: 1.99 },
      { label: "较低 (2-3)", min: 2, max: 3.99 },
      { label: "中等 (4-5)", min: 4, max: 5.99 },
      { label: "较高 (6-7)", min: 6, max: 7.99 },
      { label: "极高 (8-10)", min: 8, max: 10 },
    ];
    const breakdown = bands.map((b) => {
      const emp = jobs
        .filter((j) => j.exp >= b.min && j.exp <= b.max)
        .reduce((s, j) => s + j.emp, 0);
      return {
        label: b.label,
        emp,
        pct: totalEmp > 0 ? (emp / totalEmp) * 100 : 0,
        colorMid: (b.min + b.max) / 2,
      };
    });

    // 按薪资分桶
    const salaryBands = [
      { label: "<5K", min: 0, max: 4.99 },
      { label: "5-8K", min: 5, max: 8.99 },
      { label: "8-12K", min: 8, max: 12.99 },
      { label: "12-20K", min: 12, max: 20.99 },
      { label: "20K+", min: 21, max: Infinity },
    ];
    const exposureByPay = salaryBands.map((b) => {
      const filtered = jobs.filter((j) => j.sal >= b.min && j.sal <= b.max);
      const emp = filtered.reduce((s, j) => s + j.emp, 0);
      const wSum = filtered.reduce((s, j) => s + j.exp * j.emp, 0);
      return { label: b.label, avg: emp > 0 ? wSum / emp : 0 };
    });

    // 按学历分桶
    const exposureByEdu = eduOrder.map((edu) => {
      const filtered = jobs.filter((j) => j.edu === edu);
      const emp = filtered.reduce((s, j) => s + j.emp, 0);
      const wSum = filtered.reduce((s, j) => s + j.exp * j.emp, 0);
      return { label: edu, avg: emp > 0 ? wSum / emp : 0 };
    });

    // 按替代类型分桶（按就业人数）
    const rtOrder: ReplacementType[] = ["augment", "partial", "full"];
    const exposureByRt = rtOrder.map((rt) => {
      const filtered = jobs.filter((j) => j.rt === rt);
      const emp = filtered.reduce((s, j) => s + j.emp, 0);
      const wSum = filtered.reduce((s, j) => s + j.exp * j.emp, 0);
      return {
        label: rtLabels[rt],
        count: filtered.length,
        emp,
        avg: emp > 0 ? wSum / emp : 0,
        pct: totalEmp > 0 ? (emp / totalEmp) * 100 : 0,
      };
    });

    // 按时间窗口分桶（按就业人数）
    const tlOrder: Timeline[] = ["1-3y", "3-5y", "5-10y", "10y+"];
    const exposureByTl = tlOrder.map((tl) => {
      const filtered = jobs.filter((j) => j.tl === tl);
      const emp = filtered.reduce((s, j) => s + j.emp, 0);
      const wSum = filtered.reduce((s, j) => s + j.exp * j.emp, 0);
      return {
        label: tlLabels[tl],
        count: filtered.length,
        emp,
        avg: emp > 0 ? wSum / emp : 0,
        pct: totalEmp > 0 ? (emp / totalEmp) * 100 : 0,
      };
    });

    // 按大类聚合 → Top 5
    const catMap = new Map<string, { emp: number; wSum: number; count: number }>();
    jobs.forEach((j) => {
      const entry = catMap.get(j.cat) ?? { emp: 0, wSum: 0, count: 0 };
      entry.emp += j.emp;
      entry.wSum += j.exp * j.emp;
      entry.count += 1;
      catMap.set(j.cat, entry);
    });
    const topCategories = [...catMap.entries()]
      .map(([name, v]) => ({
        name,
        count: v.count,
        emp: v.emp,
        avg: v.emp > 0 ? v.wSum / v.emp : 0,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    // Top 5 高冲击职业
    const topJobs = [...jobs]
      .sort((a, b) => b.exp - a.exp || b.emp - a.emp)
      .slice(0, 5)
      .map((j) => ({ name: j.n, cat: j.cat, exp: j.exp, emp: j.emp, sal: j.sal }));

    // 高冲击就业人数 & 工资总额
    const highExpJobs = jobs.filter((j) => j.exp >= 7);
    const highExpEmp = highExpJobs.reduce((s, j) => s + j.emp, 0);
    const wagesExposed = highExpJobs.reduce((s, j) => s + j.sal * j.emp * 12, 0); // 万元/年

    return {
      totalEmp,
      weightedAvg,
      breakdown,
      exposureByPay,
      exposureByEdu,
      exposureByRt,
      exposureByTl,
      topCategories,
      topJobs,
      highExpEmp,
      wagesExposed,
    };
  }, [jobs]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-sm">
      {/* 统计指标 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-content2 rounded-lg p-3 text-center">
          <div className="text-xs text-default-400">总职业数</div>
          <div className="text-lg font-bold text-foreground">{totalJobs}</div>
        </div>
        <div className="bg-content2 rounded-lg p-3 text-center">
          <div className="text-xs text-default-400">总就业人口</div>
          <div className="text-lg font-bold text-foreground">{formatEmp(stats.totalEmp)}</div>
        </div>
        <div className="bg-content2 rounded-lg p-3 text-center col-span-2">
          <div className="text-xs text-default-400">加权平均冲击指数（按就业人数）</div>
          <div className="text-2xl font-bold" style={{ color: colorScale(stats.weightedAvg) }}>
            {stats.weightedAvg.toFixed(1)}
            <span className="text-sm text-default-400 ml-1">/ 10</span>
          </div>
        </div>
      </div>

      {/* 冲击等级分布 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          冲击等级分布（按就业人数）
        </h3>
        <div className="space-y-1.5">
          {stats.breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-xs text-default-400 w-20 shrink-0">{b.label}</span>
              <div className="flex-1 h-4 bg-content2 rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${b.pct}%`,
                    backgroundColor: colorScale(b.colorMid),
                  }}
                />
              </div>
              <span className="text-xs text-default-400 w-20 text-right shrink-0">
                {formatEmp(b.emp)} · {b.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 按薪资 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          不同薪资段的冲击指数
        </h3>
        <div className="space-y-1">
          {stats.exposureByPay.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="text-xs text-default-400 w-12 shrink-0">{p.label}</span>
              <div className="flex-1 h-3 bg-content2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p.avg / 10) * 100}%`,
                    backgroundColor: colorScale(p.avg),
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-6 text-right shrink-0"
                style={{ color: colorScale(p.avg) }}
              >
                {p.avg.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 按学历 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          不同学历的冲击指数
        </h3>
        <div className="space-y-1">
          {stats.exposureByEdu.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="text-xs text-default-400 w-16 shrink-0 truncate">{p.label}</span>
              <div className="flex-1 h-3 bg-content2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p.avg / 10) * 100}%`,
                    backgroundColor: colorScale(p.avg),
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-6 text-right shrink-0"
                style={{ color: colorScale(p.avg) }}
              >
                {p.avg.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 替代类型分布 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          替代类型分布
        </h3>
        <div className="space-y-1.5">
          {stats.exposureByRt.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-xs text-default-400 w-20 shrink-0">{r.label}</span>
              <div className="flex-1 h-4 bg-content2 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${r.pct}%`,
                    backgroundColor: colorScale(r.avg),
                  }}
                />
              </div>
              <span className="text-xs text-default-400 w-24 text-right shrink-0">
                {formatEmp(r.emp)} · {r.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 时间窗口分布 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          预计冲击时间窗口
        </h3>
        <div className="space-y-1.5">
          {stats.exposureByTl.map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <span className="text-xs text-default-400 w-16 shrink-0">{t.label}</span>
              <div className="flex-1 h-4 bg-content2 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${t.pct}%`,
                    backgroundColor: colorScale(t.avg),
                  }}
                />
              </div>
              <span className="text-xs text-default-400 w-24 text-right shrink-0">
                {formatEmp(t.emp)} · {t.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 高冲击大类 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          Top 5 高冲击职业大类
        </h3>
        <div className="space-y-2">
          {stats.topCategories.map((c, i) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="text-xs font-bold w-4 shrink-0" style={{ color: colorScale(c.avg) }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{c.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-2 bg-content2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.avg / 10) * 100}%`,
                        backgroundColor: colorScale(c.avg),
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: colorScale(c.avg) }}>
                    {c.avg.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 高冲击职业 */}
      <div>
        <h3 className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          Top 5 高冲击具体职业
        </h3>
        <div className="space-y-2">
          {stats.topJobs.map((j, i) => (
            <div key={j.name} className="flex items-start gap-2">
              <span
                className="text-xs font-bold w-4 shrink-0 mt-0.5"
                style={{ color: colorScale(j.exp) }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{j.name}</div>
                <div className="text-[10px] text-default-400 truncate">{j.cat}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold" style={{ color: colorScale(j.exp) }}>
                    {j.exp.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-default-400">
                    {formatEmp(j.emp)} · ¥{(j.sal * 1000).toLocaleString()}/月
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 高冲击工资总额 */}
      <div className="bg-content2 rounded-lg p-3">
        <div className="text-xs text-default-400">高冲击（≥7）就业人口</div>
        <div className="text-lg font-bold text-foreground mt-0.5">
          {formatEmp(stats.highExpEmp)}
        </div>
        <div className="text-xs text-default-400 mt-2">对应年薪总额（估算）</div>
        <div className="text-lg font-bold text-foreground mt-0.5">
          {stats.wagesExposed >= 10000
            ? (stats.wagesExposed / 10000).toFixed(1) + "万亿元"
            : stats.wagesExposed.toFixed(0) + "亿元"}
        </div>
      </div>
    </div>
  );
}
