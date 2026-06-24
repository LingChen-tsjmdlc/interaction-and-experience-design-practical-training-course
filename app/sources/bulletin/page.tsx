import MarkdownViewer from "@/components/markdown-viewer";

export const metadata = {
  title: "国民经济和社会发展统计公报 (2025)",
};

export default function BulletinPage() {
  return (
    <MarkdownViewer
      title="国民经济和社会发展统计公报"
      subtitle="2025年度 · 国家统计局"
      mdUrl="/sources/03-statistics-bulletin-2025/国民经济和社会发展统计公报-2025.md"
      imageBasePath="/sources/03-statistics-bulletin-2025"
    />
  );
}
