"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Button, Spinner, Image } from "@heroui/react";
import NextLink from "next/link";
import { Icon } from "@iconify/react";
import MdTable from "@/components/md-table";
import { ThemeSwitch } from "@/components/theme-switch";

type MarkdownViewerProps = {
  title: string;
  subtitle?: string;
  /** fetch 的 md 文件路径，相对于 public 目录，如 /sources/02-average-wage-2024/xxx.md */
  mdUrl: string;
  /** md 中相对图片路径的前缀，用于正确解析 images/xxx.png */
  imageBasePath: string;
};

export default function MarkdownViewer({
  title,
  subtitle,
  mdUrl,
  imageBasePath,
}: MarkdownViewerProps) {
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(mdUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setStatus("loaded");
      })
      .catch(() => setStatus("error"));
  }, [mdUrl]);

  // 返回时滚回顶部
  useEffect(() => {
    if (status === "loaded" && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部栏 */}
      <div className="border-b border-content2 bg-content1/80 backdrop-blur-md sticky top-0 z-50">
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

      {/* Markdown 内容区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
        <div className="max-w-8xl mx-auto px-6 py-8">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner size="lg" />
              <p className="text-default-400 text-sm">正在加载文档...</p>
            </div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <Icon icon="mdi:file-document-alert" className="text-6xl text-default-300" />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">文档加载失败</p>
                <p className="text-sm text-default-400">无法加载 Markdown 文件：{mdUrl}</p>
              </div>
              <Button
                as={NextLink}
                href="/sources"
                startContent={<Icon icon="mdi:arrow-left" />}
                className="bg-content2"
              >
                返回来源
              </Button>
            </motion.div>
          )}

          {status === "loaded" && (
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="md-article"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 使用 HeroUI Table 渲染 markdown 表格
                  table: ({ children }) => <MdTable>{children}</MdTable>,
                  // paragraph：如果段落包含图片（通过 hast node 检测），去掉 <p> 包裹
                  p: ({ children, node }) => {
                    const hasImage = node?.children?.some(
                      (child: any) => child.type === "element" && child.tagName === "img",
                    );
                    if (hasImage) {
                      return <>{children}</>;
                    }
                    return <p>{children}</p>;
                  },
                  // 自定义图片渲染：拼接完整路径
                  img: ({ src, alt }) => {
                    const fullSrc = src?.startsWith("http") ? src : `${imageBasePath}/${src}`;
                    return (
                      <figure className="my-8 text-center">
                        <Image
                          src={fullSrc}
                          alt={alt || ""}
                          className="max-w-full h-auto rounded-xl mx-auto"
                        />
                        {alt && (
                          <figcaption className="mt-2 text-sm text-default-400">{alt}</figcaption>
                        )}
                      </figure>
                    );
                  },
                  // 自定义链接：新窗口打开
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </motion.article>
          )}
        </div>
      </div>
    </div>
  );
}
