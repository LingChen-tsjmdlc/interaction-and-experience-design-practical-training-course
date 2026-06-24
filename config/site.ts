export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "中国职业 AI 替代指数",
  description: "基于中国职业分类大典，使用 Claude 评估394个职业的AI冲击指数。交互式可视化。",
  navItems: [
    { label: "首页", href: "/" },
    { label: "来源", href: "/sources" },
  ],
  links: {
    github: "",
    docs: "",
  },
};
