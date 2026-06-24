"use client";

import * as React from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

/**
 * 从 React 子节点中递归提取纯文本
 */
function extractText(node: React.ReactNode): string {
  if (node === null || node === false) {
    return "";
  }
  if (typeof node === "string") {
    return node;
  }
  if (typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (React.isValidElement(node)) {
    return extractText(node.props?.children);
  }
  return "";
}

/**
 * 从 <tr> React 元素中提取各单元格文本
 */
function extractRowCells(trElement: React.ReactElement): string[] {
  const cells = React.Children.toArray(trElement.props?.children);
  return cells
    .filter((c): c is React.ReactElement => React.isValidElement(c))
    .map((cell) => extractText(cell.props?.children).trim());
}

/**
 * react-markdown table 自定义渲染器
 * 将 Markdown table 转为 HeroUI Table 组件
 */
export default function MdTable({ children }: { children?: React.ReactNode }) {
  const headers: string[] = [];
  const rows: string[][] = [];

  const childArray = React.Children.toArray(children).filter((c) =>
    React.isValidElement(c),
  ) as React.ReactElement[];

  for (const child of childArray) {
    const tag = child.type;
    const trs = React.Children.toArray(child.props?.children).filter((c) =>
      React.isValidElement(c),
    ) as React.ReactElement[];

    if (tag === "thead") {
      for (const tr of trs) {
        const cells = extractRowCells(tr);
        for (const cell of cells) {
          if (cell.trim()) {
            headers.push(cell);
          }
        }
      }
    } else if (tag === "tbody") {
      for (const tr of trs) {
        const cells = extractRowCells(tr);
        if (cells.some((c) => c.trim())) {
          rows.push(cells);
        }
      }
    }
  }

  if (headers.length === 0 && rows.length === 0) {
    return null;
  }

  return (
    <Card className="my-6 p-4" shadow="sm">
      <Table
        aria-label="数据表格"
        removeWrapper
        fullWidth
        isStriped
        classNames={{
          base: "w-full overflow-visible",
          th: "bg-content2 text-default-500 text-xs uppercase tracking-wide whitespace-nowrap",
          td: "text-sm whitespace-nowrap",
          tr: "hover:bg-content2/50",
        }}
      >
        <TableHeader>
          {headers.map((h, i) => (
            <TableColumn key={i}>{h}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
