"use client";

import { Autocomplete, AutocompleteItem, Chip } from "@heroui/react";

import { colorScale, formatEmp } from "@/lib/color";
import type { RawJob } from "@/types";

interface SearchBoxProps {
  jobs: RawJob[];
  /** 选中某个职业时触发（点击下拉项） */
  onSelect: (code: string) => void;
  /** 搜索文本变化回调（实时高亮 Treemap） */
  onSearchChange?: (query: string) => void;
  /** 清除搜索时触发 */
  onClear?: () => void;
  /** 外层容器 className，用于控制宽度 */
  className?: string;
  /** 是否显示 label "搜索你的职业"，首页显示，全屏页隐藏 */
  showLabel?: boolean;
}

export default function SearchBox({
  jobs,
  onSelect,
  onSearchChange,
  onClear,
  className = "",
  showLabel = true,
}: SearchBoxProps) {
  return (
    <div className={className}>
      <Autocomplete
        label={showLabel ? "搜索你的职业" : undefined}
        labelPlacement="outside"
        placeholder="输入职业名称..."
        variant="bordered"
        allowsCustomValue
        size="lg"
        items={jobs}
        // 实时搜索：每次输入变化都通知父组件高亮 Treemap
        onInputChange={(v) => {
          if (v.trim()) {
            onSearchChange?.(v);
          } else {
            onClear?.();
          }
        }}
        // 选中下拉项 → 只高亮这一个 + 滚动到 Treemap
        onSelectionChange={(key) => {
          if (key) {
            onSelect(key as string);
            const treemapWrap = document.getElementById("treemap-wrap");

            if (treemapWrap) {
              treemapWrap.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }}
        // 关闭下拉时清除高亮
        onClose={() => {
          onClear?.();
        }}
        inputProps={{
          classNames: { inputWrapper: "rounded-lg" },
        }}
      >
        {(job: RawJob) => (
          <AutocompleteItem
            key={job.c}
            textValue={job.n}
            startContent={
              <span
                className="w-7 h-5 rounded text-white text-xs font-semibold flex items-center justify-center shrink-0"
                style={{ backgroundColor: colorScale(job.exp) }}
              >
                {job.exp}
              </span>
            }
            endContent={
              <div className="flex items-center gap-1.5 shrink-0">
                <Chip size="sm" variant="flat" color="primary" className="h-5 text-xs">
                  {formatEmp(job.emp)}
                </Chip>
                <Chip size="sm" variant="flat" color="success" className="h-5 text-xs">
                  {job.sal}K/月
                </Chip>
              </div>
            }
          >
            {job.n}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
}
