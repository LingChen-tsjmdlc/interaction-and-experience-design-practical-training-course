import PdfViewer from "@/components/pdf-viewer";

export const metadata = {
  title: "中国职业分类大典 (2022年版)",
};

export default function DictionaryPage() {
  return (
    <PdfViewer
      title="中国职业分类大典"
      subtitle="2022年版"
      remoteUrl="https://file.m12333.cn/upfile/download/063d5abb-fada-f27f-a1e8-3de63b44d5df.pdf"
      localUrl="/sources/01-occupation-dictionary-2022/occupation-dictionary-2022.pdf"
    />
  );
}
