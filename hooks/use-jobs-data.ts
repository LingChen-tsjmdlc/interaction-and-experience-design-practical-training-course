"use client";

import { useEffect, useState } from "react";

import type { JobsData } from "@/types";

/**
 * 加载 public/data.json
 * SSR 安全：初始 state 为 null，客户端 mount 后 fetch
 */
export function useJobsData() {
  const [data, setData] = useState<JobsData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<JobsData>;
      })
      .then(setData)
      .catch(setError);
  }, []);

  return { data, error };
}
