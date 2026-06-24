import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// ===== china-ai-jobs 数据类型 =====

/** 替代类型 */
export type ReplacementType = "full" | "partial" | "augment";

/** 时间窗口 */
export type Timeline = "1-3y" | "3-5y" | "5-10y" | "10y+";

/** 学历要求 */
export type Education = "初中及以下" | "高中/中专" | "大专" | "本科" | "硕士及以上";

/** 原始 job 数据（data.json 中的压缩字段名） */
export interface RawJob {
  c: string; // 职业编码 code
  n: string; // 职业名称 name
  cat: string; // 所属大类 category
  sub: string; // 中类 subcategory
  emp: number; // 就业人数（万）
  sal: number; // 月薪中位（千元）
  edu: Education; // 学历要求
  exp: number; // AI 冲击指数 0-10
  rt: ReplacementType; // 替代类型
  tl: Timeline; // 时间窗口
  cf: string; // 中国特有因素
  ra: string; // 评分理由
}

/** 大类汇总 */
export interface Category {
  name: string;
  count: number;
  emp: number;
  avg_exp: number;
}

/** meta 统计信息 */
export interface SiteMeta {
  total_jobs: number;
  total_emp_wan: number;
  weighted_avg_exp: number;
  high_exp_emp_wan: number;
  high_exp_pct: number;
}

/** data.json 顶层结构 */
export interface JobsData {
  meta: SiteMeta;
  categories: Category[];
  jobs: RawJob[];
}
