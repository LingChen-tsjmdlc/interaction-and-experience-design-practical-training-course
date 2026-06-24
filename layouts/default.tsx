"use client";
import { Image } from "@heroui/react";
import NextLink from "next/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="w-full flex flex-col items-center justify-center gap-1.5 py-3">
        <span className="text-default-600 text-sm">
          &copy; {new Date().getFullYear()} jerrylu. All rights reserved.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <NextLink
            href="https://beian.miit.gov.cn/"
            target="_blank"
            className="text-default-500 text-xs hover:text-primary"
          >
            鄂ICP备2025154483号-2
          </NextLink>
          <NextLink
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42050002421012"
            target="_blank"
            className="flex items-center gap-1 text-default-500 text-xs hover:text-primary"
          >
            <Image
              src="/beian.png"
              alt="公安备案"
              width={16}
              height={16}
              className="inline-block"
            />
            <span className="mt-0.5">鄂公网安备42050002421012号</span>
          </NextLink>
        </div>
      </footer>
    </div>
  );
}
