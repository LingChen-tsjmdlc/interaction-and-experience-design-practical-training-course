"use client";

import { useState, useEffect } from "react";
import { Button, Tooltip, Modal, ModalContent, ModalBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeSwitch } from "@/components/theme-switch";
import SearchBox from "@/components/search-box";
import ColorLegend from "@/components/color-legend";
import StatsSidebar from "@/components/stats-sidebar";
import TreemapChartComponent from "@/components/charts/treemap-chart";
import LoadingState from "@/components/loading-state";
import { useJobsData } from "@/hooks/use-jobs-data";

export default function TreemapFullscreen() {
  const { data, error } = useJobsData();
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRotateHint, setShowRotateHint] = useState(false);

  // 检测是否为竖屏手机
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // 首次进入全屏页且为竖屏手机时，弹出横屏提示
  useEffect(() => {
    if (isPortraitMobile) {
      setShowRotateHint(true);
    }
  }, [isPortraitMobile]);

  function handleClear() {
    setHighlightCode(null);
    setSearchQuery("");
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-danger">数据加载失败：{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return <LoadingState />;
  }

  const { jobs, meta } = data;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* 顶栏：移动端精简布局 */}
      <div className="shrink-0 px-3 py-2 border-b border-default-200">
        {/* 第一行：返回 + 标题 + 主题切换 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="sm"
              onPress={() => window.history.back()}
              aria-label="返回"
              className="shrink-0"
            >
              <Icon icon="mdi:arrow-left" className="text-xl" />
            </Button>
            <h1 className="text-sm font-bold whitespace-nowrap truncate">职业冲击全景图</h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden lg:inline">
              <ColorLegend />
            </span>
            <ThemeSwitch />
          </div>
        </div>

        {/* 第二行：搜索框（移动端独占一行，避免挤压） */}
        <div className="mt-2">
          <SearchBox
            jobs={jobs}
            onSelect={setHighlightCode}
            onSearchChange={setSearchQuery}
            onClear={handleClear}
            className="w-full"
            showLabel={false}
          />
        </div>
      </div>

      {/* 主体：侧边栏 + Treemap */}
      <div className="flex-1 min-h-0 flex">
        {/* 侧边栏 — 移动端隐藏默认侧边栏 */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
              className="shrink-0 border-r border-default-200 overflow-hidden hidden md:block"
            >
              <div className="w-96 h-full flex flex-col">
                {/* 统计内容 */}
                <div className="flex-1 min-h-0">
                  <StatsSidebar jobs={jobs} totalJobs={meta.total_jobs} />
                </div>
                {/* 底部收起按钮 */}
                <div className="shrink-0 border-t border-default-200 p-2">
                  <Button
                    fullWidth
                    variant="light"
                    size="sm"
                    radius="sm"
                    startContent={<Icon icon="mdi:chevron-left" className="text-lg" />}
                    onPress={() => setSidebarOpen(false)}
                  >
                    收起侧边栏
                  </Button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Treemap 区域 */}
        <div className="flex-1 min-h-0 min-w-0 p-2 relative">
          <TreemapChartComponent
            jobs={jobs}
            searchQuery={searchQuery}
            highlightCode={highlightCode}
            fullscreen
          />
          {/* 侧边栏收起时显示展开按钮（仅桌面） */}
          <AnimatePresence>
            {!sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-3 bottom-3 z-[9999] hidden md:block"
              >
                <Tooltip content="展开侧边栏" placement="right" showArrow>
                  <Button
                    isIconOnly
                    size="md"
                    radius="full"
                    className="bg-blue-300/80 backdrop-blur-md border border-default-300 shadow-lg hover:scale-110 hover:bg-blu-700/70 transition-all"
                    onPress={() => setSidebarOpen(true)}
                    aria-label="展开侧边栏"
                  >
                    <Icon icon="mdi:chevron-right" className="text-xl" />
                  </Button>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 移动端统计侧边栏按钮（浮动，点击弹出底部抽屉） */}
          <MobileStatsButton jobs={jobs} totalJobs={meta.total_jobs} />
        </div>
      </div>

      {/* 横屏提示弹窗 */}
      <Modal
        isOpen={showRotateHint}
        onClose={() => setShowRotateHint(false)}
        size="sm"
        backdrop="blur"
        classNames={{ base: "max-w-[90vw]" }}
      >
        <ModalContent>
          <ModalBody className="py-8 px-6 text-center">
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4"
            >
              <Icon icon="mdi:phone-rotate-landscape" className="text-5xl text-primary" />
            </motion.div>
            <h2 className="text-lg font-bold mb-2">建议横屏查看</h2>
            <p className="text-sm text-default-400 leading-relaxed">
              全景图包含大量职业数据，横置手机可以获得更好的浏览体验
            </p>
            <Button color="primary" className="mt-5" onPress={() => setShowRotateHint(false)}>
              我知道了
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

/**
 * 移动端浮动统计按钮 + 底部抽屉
 */
function MobileStatsButton({ jobs, totalJobs }: { jobs: any[]; totalJobs: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        radius="full"
        className="md:hidden absolute right-3 bottom-3 z-[9999] bg-primary/80 backdrop-blur-md text-white shadow-lg"
        onPress={() => setOpen(true)}
        aria-label="查看统计"
      >
        <Icon icon="mdi:chart-box" className="text-xl" />
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="full"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "md:hidden h-[80vh] mt-auto rounded-t-2xl",
          body: "p-0",
        }}
        motionProps={{
          variants: {
            enter: { y: "100%", opacity: 0 },
            center: { y: 0, opacity: 1 },
            exit: { y: "100%", opacity: 0 },
          },
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        <ModalContent>
          <ModalBody>
            <div className="h-full overflow-y-auto">
              <div className="sticky top-0 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-default-200">
                <h3 className="text-sm font-bold">统计概览</h3>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setOpen(false)}
                  aria-label="关闭"
                >
                  <Icon icon="mdi:close" className="text-lg" />
                </Button>
              </div>
              <StatsSidebar jobs={jobs} totalJobs={totalJobs} />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
