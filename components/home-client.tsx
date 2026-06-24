"use client";

import { useState } from "react";
import { Card, Button, Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import NextLink from "next/link";

import StatCards from "@/components/stat-cards";
import SearchBox from "@/components/search-box";
import ColorLegend from "@/components/color-legend";
import CategoryTable from "@/components/category-table";
import LoadingState from "@/components/loading-state";
import HistogramChart from "@/components/charts/histogram-chart";
import TreemapChartComponent from "@/components/charts/treemap-chart";
import ScatterChartComponent from "@/components/charts/scatter-chart";
import BoxplotChartComponent from "@/components/charts/boxplot-chart";
import { useJobsData } from "@/hooks/use-jobs-data";

type ChartModal = "histogram" | "scatter" | "boxplot" | null;

export default function HomeClient() {
  const { data, error } = useJobsData();
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chartModal, setChartModal] = useState<ChartModal>(null);

  function handleClear() {
    setHighlightCode(null);
    setSearchQuery("");
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-16">
        <Card className="p-6 bg-danger-50 border border-danger-200">
          <h2 className="text-lg font-bold text-danger mb-2">数据加载失败</h2>
          <p className="text-sm text-danger-600">无法加载 data.json：{error.message}</p>
          <p className="text-sm text-danger-600 mt-2">
            请确认 <code className="px-1 bg-danger-100 rounded">public/data.json</code> 文件存在。
          </p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return <LoadingState />;
  }

  const { meta, categories, jobs } = data;

  return (
    <div className="space-y-2 pb-16">
      {/* Header */}
      <header className="relative text-center pt-16 pb-6 overflow-hidden">
        {/* 背景光晕 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative">
          {/* 标签 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4"
          >
            <Icon icon="mdi:chart-treemap" className="text-sm" />
            AI Job Impact Visualization
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-1.5 text-foreground"
          >
            中国职业 AI 替代指数
          </motion.h1>

          {/* 英文副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-base md:text-lg text-default-400 font-light tracking-wide mb-4"
          >
            AI Replacement Index of the Chinese Job Market
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-px bg-default-200 mx-auto mb-5"
          />

          {/* 指标说明 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="text-sm text-default-500"
          >
            {meta.total_jobs}个职业 · 面积 = 就业人数 · 颜色 = AI冲击指数
          </motion.p>

          {/* 数据来源 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-default-400"
          >
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:database" className="text-default-300" />
              中国职业分类大典(2022)
            </span>
            <span className="text-default-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:chart-line" className="text-default-300" />
              国家统计局2024年工资数据
            </span>
            <span className="text-default-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:robot" className="text-default-300" />
              评分：Claude (Anthropic)
            </span>
          </motion.div>
        </div>
      </header>

      <SearchBox
        jobs={jobs}
        onSelect={setHighlightCode}
        onSearchChange={setSearchQuery}
        onClear={handleClear}
        className="max-w-md mx-auto mt-6"
      />

      {/* Stats */}
      <StatCards meta={meta} />

      {/* Histogram */}
      <section className="max-w-8xl mx-auto px-4">
        <Card className="px-8 pb-2">
          <div className="flex items-center justify-between mt-10 mb-4">
            <h2 className="text-lg font-bold border-l-4 border-primary pl-3">
              冲击指数分布（按就业人数）
            </h2>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setChartModal("histogram")}
              aria-label="放大查看"
            >
              <Icon icon="mdi:arrow-expand" className="text-lg" />
            </Button>
          </div>
          <HistogramChart jobs={jobs} />
        </Card>
      </section>

      {/* Treemap — 预览 + 全屏按钮 */}
      <section className="max-w-8xl mx-auto px-4">
        <div className="flex items-center justify-between mt-10 mb-1">
          <h2 className="text-lg font-bold border-l-4 border-primary pl-3">职业冲击全景图</h2>
          <Button
            as="a"
            href="/treemap"
            color="primary"
            variant="flat"
            size="sm"
            startContent={<Icon icon="mdi:fullscreen" className="text-lg" />}
          >
            全屏查看
          </Button>
        </div>
        <ColorLegend />
        <div
          id="treemap-wrap"
          className="mt-3 rounded-lg overflow-hidden scroll-mt-20 max-w-[500px] mx-auto sm:max-w-none"
        >
          <TreemapChartComponent
            jobs={jobs}
            searchQuery={searchQuery}
            highlightCode={highlightCode}
          />
        </div>
      </section>

      {/* Scatter + Boxplot */}
      <section className="max-w-8xl mx-auto px-4">
        <h2 className="text-lg font-bold border-l-4 border-primary pl-3 mt-10 mb-4">多维分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5" radius="lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">薪资 vs AI冲击指数</h3>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setChartModal("scatter")}
                aria-label="放大查看"
              >
                <Icon icon="mdi:arrow-expand" className="text-lg" />
              </Button>
            </div>
            <ScatterChartComponent jobs={jobs} />
          </Card>
          <Card className="p-5" radius="lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">学历 vs AI冲击指数</h3>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setChartModal("boxplot")}
                aria-label="放大查看"
              >
                <Icon icon="mdi:arrow-expand" className="text-lg" />
              </Button>
            </div>
            <BoxplotChartComponent jobs={jobs} />
          </Card>
        </div>
      </section>

      {/* Category Table */}
      <section className="max-w-8xl mx-auto px-4">
        <h2 className="text-lg font-bold border-l-4 border-primary pl-3 mt-10 mb-4">大类排名</h2>
        <CategoryTable categories={categories} />
      </section>

      {/* Footer / Methodology */}
      <footer className="border-t border-default-200 mt-16 pt-8 pb-12 text-center text-xs text-default-400 leading-relaxed max-w-3xl mx-auto px-4">
        <div className="text-left mb-4">
          <strong className="text-default-500">方法论</strong>
          ：数据来源：
          <NextLink href="/sources/dictionary" className="text-primary hover:underline">
            中国职业分类大典(2022版)
          </NextLink>
          、
          <NextLink href="/sources/wage" className="text-primary hover:underline">
            国家统计局《2024年城镇单位就业人员年平均工资》（分行业×分岗位）
          </NextLink>
          、
          <NextLink href="/sources/bulletin" className="text-primary hover:underline">
            《2025年国民经济和社会发展统计公报》（就业总量）
          </NextLink>
          。AI冲击评分由 Claude (Anthropic)
          生成。评分综合考量当前AI技术能力、任务可替代性、中国特有制度与市场因素。本图谱仅供参考，不构成任何职业建议。
        </div>
      </footer>

      {/* 图表放大模态窗 */}
      <Modal
        isOpen={chartModal !== null}
        onClose={() => setChartModal(null)}
        size="lg"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "h-[50vh] w-[60vw] max-w-none sm:h-[50vh] sm:w-[60vw] max-[640px]:w-screen max-[640px]:h-[80vh] max-[640px]:max-w-none max-[640px]:rounded-none",
          body: "p-0",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {chartModal === "histogram" && "冲击指数分布（按就业人数）"}
            {chartModal === "scatter" && "薪资 vs AI冲击指数"}
            {chartModal === "boxplot" && "学历 vs AI冲击指数"}
          </ModalHeader>
          <ModalBody>
            <div className="w-full h-full">
              {chartModal === "histogram" && <HistogramChart jobs={jobs} fullscreen />}
              {chartModal === "scatter" && <ScatterChartComponent jobs={jobs} fullscreen />}
              {chartModal === "boxplot" && <BoxplotChartComponent jobs={jobs} fullscreen />}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
