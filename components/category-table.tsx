"use client";

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import { colorScale, formatEmp } from "@/lib/color";
import type { Category } from "@/types";

export default function CategoryTable({ categories }: { categories: Category[] }) {
  // 按平均冲击指数降序
  const sorted = [...categories].sort((a, b) => b.avg_exp - a.avg_exp);

  return (
    <Card className="p-6">
      <Table
        aria-label="大类排名"
        removeWrapper
        classNames={{
          th: "bg-content2 text-default-500 text-xs uppercase tracking-wide",
          td: "text-sm",
        }}
      >
        <TableHeader>
          <TableColumn>大类</TableColumn>
          <TableColumn>职业数</TableColumn>
          <TableColumn>就业人数</TableColumn>
          <TableColumn>平均冲击指数</TableColumn>
          <TableColumn className="hidden md:table-cell" align="end">
            可视化
          </TableColumn>
        </TableHeader>
        <TableBody items={sorted}>
          {(cat) => (
            <TableRow key={cat.name}>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell>{cat.count}</TableCell>
              <TableCell>{formatEmp(cat.emp)}</TableCell>
              <TableCell className="font-semibold" style={{ color: colorScale(cat.avg_exp) }}>
                {cat.avg_exp.toFixed(1)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="w-32 h-1.5 bg-content2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(cat.avg_exp / 10) * 100}%`,
                      backgroundColor: colorScale(cat.avg_exp),
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
