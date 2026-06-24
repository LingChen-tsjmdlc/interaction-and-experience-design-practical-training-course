import MarkdownViewer from "@/components/markdown-viewer";

export const metadata = {
  title: "城镇单位就业人员年平均工资 (2024)",
};

export default function WagePage() {
  return (
    <MarkdownViewer
      title="城镇单位就业人员年平均工资"
      subtitle="2024年数据 · 国家统计局"
      mdUrl="/sources/02-average-wage-2024/城镇单位就业人员年平均工资情况-2024.md"
      imageBasePath="/sources/02-average-wage-2024"
    />
  );
}
