# 交互与体验设计实训课程

> **中国职业 AI 替代指数** — 基于 394 个职业的可视化分析，面积 = 就业人数，颜色 = AI 冲击指数。

交互式数据可视化项目，综合运用 Next.js 15 + HeroUI v2 + ECharts + framer-motion，展示 AI 技术对中国职业市场的冲击全景。包含 Treemap 矩形树图、直方图、散点图、箱线图四种可视化维度，并集成完整的数据来源溯源系统。

---

## 核心功能

### 可视化看板

- **Treemap 矩形树图** — 394 个职业按大类分组，矩形面积反映就业人数，颜色深浅表示 AI 冲击指数（0-10）
- **直方图** — AI 冲击指数分布统计
- **散点图** — 薪资 vs AI 冲击关联性分析
- **箱线图** — 各行业 AI 冲击离散度对比
- **统计侧边栏** — 9 个维度数据板块（高风险职业、安全职业、行业排名等）
- **职业搜索** — 实时搜索定位，高亮目标职业

### 全屏 Treemap 页（`/treemap`）

- 独立全屏沉浸式体验
- 移动端横屏提示 + 自适应布局
- 点击职业弹出详情卡片（替代类型、时间窗口、薪资、学历等）

### 数据来源系统（`/sources`）

三个渐变 Card 入口，点击进入详情页：

| 来源                              | 格式                   | 渲染方式                      |
| --------------------------------- | ---------------------- | ----------------------------- |
| 中国职业分类大典 (2022)           | PDF                    | iframe 在线优先 + 本地回退    |
| 城镇单位就业人员年平均工资 (2024) | Markdown               | react-markdown + HeroUI Table |
| 国民经济和社会发展统计公报 (2025) | Markdown + 25 张统计图 | react-markdown + HeroUI Image |

### 交互体验

- **亮暗主题切换** — 默认暗色，View Transition 涟漪动画
- **framer-motion 动画** — 入场上浮、悬停弹性、滚动驱动
- **响应式适配** — 桌面 / 平板 / 手机三端适配，移动端浮动侧边栏抽屉

---

## 技术栈

| 类别     | 技术                                     | 版本  |
| -------- | ---------------------------------------- | ----- |
| 框架     | Next.js (App Router + Turbopack)         | 15.5  |
| 语言     | TypeScript                               | 5.6   |
| UI 组件  | HeroUI                                   | 2.8   |
| 样式     | Tailwind CSS                             | 4.1   |
| 图表     | ECharts                                  | 6.1   |
| 动画     | framer-motion                            | 11.x  |
| Markdown | react-markdown + remark-gfm + rehype-raw | —     |
| 3D       | Three.js                                 | 0.184 |
| 图标     | Iconify (@iconify/react)                 | —     |
| 主题     | next-themes                              | 0.4   |
| 包管理   | pnpm                                     | ≥ 9   |
| 代码规范 | ESLint + Prettier + Husky                | —     |

---

## 数据说明

| 数据集      | 来源                                           | 用途                 |
| ----------- | ---------------------------------------------- | -------------------- |
| 职业分类    | 中国职业分类大典 (2022版)                      | 394 个职业的基础分类 |
| 工资数据    | 国家统计局《2024年城镇单位就业人员年平均工资》 | 分行业 × 分岗位薪资  |
| 就业总量    | 《2025年国民经济和社会发展统计公报》           | 就业人数总量         |
| AI 冲击评分 | Claude (Anthropic) 生成                        | 综合评分 0-10        |

> 评分综合考量当前 AI 技术能力、任务可替代性、中国特有制度与市场因素。本图谱仅供参考，不构成任何职业建议。

---

## 项目结构

```
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 根布局：字体、metadata
│   ├── providers.tsx                 # 全局 Provider：HeroUI + next-themes
│   ├── page.tsx                      # 首页（Server Component 入口）
│   ├── treemap/                      # 全屏 Treemap 页面
│   │   └── page.tsx
│   └── sources/                      # 数据来源系统
│       ├── page.tsx                  # 来源入口（3 个 Card）
│       ├── dictionary/               # 职业分类大典 PDF
│       ├── wage/                     # 工资数据 Markdown
│       └── bulletin/                 # 统计公报 Markdown
│
├── components/                       # 组件库
│   ├── home-client.tsx               # 首页主客户端组件
│   ├── treemap-fullscreen.tsx        # 全屏 Treemap 容器
│   ├── stats-sidebar.tsx             # 统计侧边栏（9 个板块）
│   ├── stat-cards.tsx                # 统计卡片
│   ├── search-box.tsx                # 职业搜索框
│   ├── color-legend.tsx              # 颜色图例
│   ├── category-table.tsx            # 分类统计表
│   ├── sources-client.tsx            # 来源页 Card 入口
│   ├── pdf-viewer.tsx                # PDF 查看器（iframe）
│   ├── markdown-viewer.tsx           # Markdown 渲染器
│   ├── md-table.tsx                  # MD 表格（HeroUI Table 组件）
│   ├── navbar.tsx                    # 顶部导航栏
│   ├── theme-switch.tsx              # 主题切换按钮
│   ├── treemap-chart.tsx             # ECharts Treemap 封装
│   ├── charts/                       # ECharts 图表组件
│   │   ├── treemap-chart.tsx
│   │   ├── histogram-chart.tsx
│   │   ├── scatter-chart.tsx
│   │   └── boxplot-chart.tsx
│   ├── aceternity-ui/                # Aceternity UI 风格组件
│   ├── magic-ui/                     # Magic UI 风格组件
│   ├── reactbits-ui/                 # React Bits 风格组件
│   ├── loading-state.tsx             # 加载状态
│   ├── icons.tsx                     # SVG 图标
│   └── primitives.ts                 # tailwind-variants 样式原语
│
├── config/
│   ├── site.ts                       # 站点配置：名称、导航
│   └── fonts.ts                      # 字体配置
│
├── layouts/
│   └── default.tsx                   # 默认布局：Navbar + Main + Footer
│
├── hooks/
│   └── use-jobs-data.ts              # 职业数据 Hook
│
├── lib/
│   ├── color.ts                      # AI 冲击指数色阶映射
│   ├── http.ts                       # HTTP 客户端封装
│   ├── token.ts                      # Token 管理
│   └── utils.ts                      # cn() className 合并
│
├── public/
│   ├── data.json                     # 394 个职业数据集
│   ├── beian.png                     # 公安备案图标
│   └── sources/                      # 数据源原始文件
│       ├── 01-occupation-dictionary-2022/
│       ├── 02-average-wage-2024/
│       └── 03-statistics-bulletin-2025/
│
├── types/
│   └── index.ts                      # TypeScript 类型定义
│
├── styles/
│   └── globals.css                   # 全局样式 + Tailwind v4 导入
│
├── Dockerfile                        # 多阶段构建（standalone 模式）
├── .dockerignore
├── .github/workflows/CICD.yml        # GitHub Actions CI/CD
├── tailwind.config.ts
├── next.config.ts                    # output: "standalone"
└── package.json
```

---

## 快速开始

### 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### 安装

```bash
git clone <repo-url>
cd interaction-and-experience-design-practical-training-course
pnpm install
```

### 开发

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

### 构建验证

```bash
pnpm lint          # ESLint 检查
pnpm typecheck     # TypeScript 类型检查
pnpm build         # 生产构建
```

---

## Docker 部署

项目自带多阶段 Dockerfile（standalone 模式），镜像精简至仅包含运行时必要文件。

### 本地构建

```bash
docker build -t ai-job-impact:latest .
docker run -d -p 3000:3000 --name frontend ai-job-impact:latest
```

### CI/CD 自动构建

推送 `v*` 标签即触发 GitHub Actions：

```bash
git tag v1.0.0
git push origin v1.0.0
```

流水线执行：lint → typecheck → docker build → gzip -9 导出 → 上传到 GitHub Release。

### 从 Release 导入

```bash
# 1. 下载 tar.gz
# 2. 导入镜像
docker load < ai-job-impact-v1.0.0.tar.gz
# 3. 验证
docker images | grep ai-job-impact
# 4. 运行
docker run -d -p 3000:3000 --name frontend ai-job-impact:v1.0.0
```

### docker-compose

```yaml
frontend:
  image: ai-job-impact:v1.0.0
  ports:
    - "3000:3000"
  restart: unless-stopped
```

---

## 代码规范

| 命令              | 说明                |
| ----------------- | ------------------- |
| `pnpm lint`       | ESLint 检查         |
| `pnpm lint --fix` | ESLint 自动修复     |
| `pnpm typecheck`  | TypeScript 类型检查 |

提交前 Husky pre-commit 钩子自动执行 lint。

---

## License

MIT License
