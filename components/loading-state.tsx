"use client";

import { Spinner } from "@heroui/react";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" label="加载职业数据..." />
    </div>
  );
}
