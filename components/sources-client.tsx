"use client";

import { motion } from "framer-motion";
import { Card, CardBody, CardFooter, Button } from "@heroui/react";
import NextLink from "next/link";
import { Icon } from "@iconify/react";

type SourceCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
  tags: string[];
};

const sources: SourceCard[] = [
  {
    id: "dictionary",
    title: "中国职业分类大典",
    subtitle: "2022年版",
    description:
      "由人力资源社会保障部、市场监管总局、国家统计局联合颁布。本项目的394个职业编码、名称及大类归属均基于此分类体系。",
    icon: "mdi:book-open-variant",
    gradient: "from-blue-500 to-cyan-500",
    href: "/sources/dictionary",
    tags: ["PDF文档", "8个大类", "394个细类"],
  },
  {
    id: "wage",
    title: "城镇单位就业人员\n年平均工资",
    subtitle: "2024年数据",
    description:
      "国家统计局2025年5月16日发布，包含分岗位、分注册类型、分行业的平均工资数据。本项目按职业大类映射月薪中位数来源。",
    icon: "mdi:currency-cny",
    gradient: "from-emerald-500 to-teal-500",
    href: "/sources/wage",
    tags: ["分行业", "分岗位", "8张表格"],
  },
  {
    id: "bulletin",
    title: "国民经济和社会\n发展统计公报",
    subtitle: "2025年度",
    description:
      "国家统计局2026年2月28日发布，涵盖GDP、人口、就业、消费、贸易等全领域统计数据。本项目就业总量数据来源。",
    icon: "mdi:chart-bar",
    gradient: "from-orange-500 to-red-500",
    href: "/sources/bulletin",
    tags: ["12个章节", "16张表格", "25张图表"],
  },
];

export default function SourcesClient() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 返回首页 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            as={NextLink}
            href="/"
            startContent={<Icon icon="mdi:arrow-left" className="text-lg" />}
            className="bg-content2 hover:bg-content3"
            radius="full"
          >
            返回首页
          </Button>
        </motion.div>

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">数据来源</h1>
          <p className="text-lg text-default-500 max-w-2xl">
            本项目使用的全部官方数据来源，均可点击查看完整原始文档。
          </p>
        </motion.div>

        {/* 3个卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <Card
                as={NextLink}
                href={source.href}
                className="w-full h-full cursor-pointer group"
                shadow="sm"
              >
                {/* 顶部渐变区域 */}
                <div
                  className={`h-32 bg-gradient-to-br ${source.gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon={source.icon}
                      className="text-6xl text-white/90 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      {source.subtitle}
                    </span>
                  </div>
                </div>

                <CardBody className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-2 whitespace-pre-line">
                    {source.title}
                  </h3>
                  <p className="text-sm text-default-500 leading-relaxed line-clamp-4">
                    {source.description}
                  </p>
                </CardBody>

                <CardFooter className="px-5 pb-5 pt-0 flex-col items-start gap-3">
                  <div className="flex flex-wrap gap-2">
                    {source.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-default-600 bg-content2 rounded-full px-2.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span>查看完整文档</span>
                    <Icon
                      icon="mdi:arrow-right"
                      className="text-base transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
