import DefaultLayout from "@/layouts/default";
import SourcesClient from "@/components/sources-client";

export const metadata = {
  title: "数据来源",
};

export default function SourcesPage() {
  return (
    <DefaultLayout>
      <SourcesClient />
    </DefaultLayout>
  );
}
