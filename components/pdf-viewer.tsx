"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import NextLink from "next/link";
import { Icon } from "@iconify/react";
import { ThemeSwitch } from "@/components/theme-switch";

type PdfViewerProps = {
  title: string;
  subtitle?: string;
  remoteUrl: string;
  localUrl: string;
};

export default function PdfViewer({ title, subtitle, remoteUrl, localUrl }: PdfViewerProps) {
  const [currentUrl, setCurrentUrl] = useState(remoteUrl);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部栏 */}
      <div className="border-b border-content2 bg-content1/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              as={NextLink}
              href="/sources"
              startContent={<Icon icon="mdi:arrow-left" className="text-lg" />}
              className="bg-content2 hover:bg-content3 shrink-0"
              radius="full"
              size="sm"
            >
              返回来源
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-xs text-default-400">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              as={NextLink}
              href="/"
              startContent={<Icon icon="mdi:home" className="text-lg" />}
              className="bg-content2 hover:bg-content3"
              radius="full"
              size="sm"
            >
              首页
            </Button>
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* PDF 内容区 */}
      <div className="flex-1 relative">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <p className="text-default-400 text-sm">正在加载 PDF 文档...</p>
          </div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8"
          >
            <Icon icon="mdi:file-document-alert" className="text-6xl text-default-300" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">PDF 加载失败</p>
              <p className="text-sm text-default-400 max-w-md">
                在线文档可能暂时无法访问。您可以尝试直接下载 PDF 文件查看。
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                as="a"
                href={localUrl}
                download
                startContent={<Icon icon="mdi:download" />}
                color="primary"
              >
                下载本地 PDF
              </Button>
              <Button
                as={NextLink}
                href="/sources"
                startContent={<Icon icon="mdi:arrow-left" />}
                className="bg-content2"
              >
                返回来源
              </Button>
            </div>
          </motion.div>
        )}

        {status !== "error" && (
          <iframe
            key={currentUrl}
            src={`${currentUrl}#toolbar=1&view=FitH`}
            className="w-full h-full min-h-[calc(100vh-64px)] border-0"
            onLoad={() => setStatus("loaded")}
            onError={() => {
              if (currentUrl !== localUrl) {
                setCurrentUrl(localUrl);
                setStatus("loading");
              } else {
                setStatus("error");
              }
            }}
            title={title}
          />
        )}
      </div>
    </div>
  );
}
