# 交互与体验设计实训课程

基于 **Next.js 15** + **HeroUI v2** + **Tailwind CSS v4** + **GSAP / Motion** 构建。

> 亮暗主题自适应 · View Transition 平滑切换

---

## ✨ 特性

- **Next.js 15** — App Router + Turbopack
- **TypeScript** — 端到端类型安全
- **Tailwind CSS v4** + **HeroUI v2**
- **GSAP / Motion** — 滚动驱动动画
- **亮暗主题自适应** — View Transition 涟漪动画
- **内置组件库** — Aceternity UI / Magic UI / React Bits 风格组件
- **HTTP 客户端** — `lib/http.ts`（支持流式、上传、自动 Token 刷新）
- **Standalone 构建** — 适合容器化部署
- **Husky + ESLint + Prettier**

---

## 🛠️ 技术栈

| 类别 | 技术                               |
| ---- | ---------------------------------- |
| 框架 | Next.js 15 (App Router) + React 18 |
| 语言 | TypeScript 5.6                     |
| 样式 | Tailwind CSS v4                    |
| UI   | HeroUI v2                          |
| 动画 | GSAP + ScrollTrigger / Motion      |
| 3D   | Three.js                           |
| 图标 | Iconify                            |
| 主题 | next-themes                        |

---

## 📁 项目结构

```
├── app/                          # Next.js App Router 目录
│   ├── providers.tsx             # 全局 Provider：HeroUI + next-themes
│   ├── layout.tsx                # 根布局：字体、metadata、全局 HTML 结构
│   └── page.tsx                  # 首页
│
├── components/                   # 组件目录
│   ├── aceternity-ui/            # Aceternity UI 风格组件
│   ├── magic-ui/                 # Magic UI 风格组件
│   ├── reactbits-ui/             # React Bits 风格组件
│   ├── navbar.tsx                # 顶部导航栏（基于 HeroUI Navbar）
│   ├── theme-switch.tsx          # 主题切换按钮（View Transition API 涟漪动画）
│   ├── icons.tsx                 # 基础 SVG 图标
│   └── primitives.ts             # tailwind-variants 样式原语
│
├── config/
│   ├── site.ts                   # 站点配置：名称、描述、导航链接
│   └── fonts.ts                  # 字体配置（Inter / Fira Code）
│
├── layouts/
│   └── default.tsx               # 默认布局：Navbar + Main + Footer
│
├── lib/
│   ├── http.ts                   # HTTP 客户端封装（详见 README-http.md）
│   ├── token.ts                  # Token 管理工具（详见 README-token.md）
│   ├── utils.ts                  # cn() className 合并工具
│   ├── README-http.md            # http.ts 使用文档
│   └── README-token.md           # token.ts 使用文档
│
├── styles/
│   └── globals.css               # 全局样式、Tailwind v4 导入、CSS 变量
│
├── types/
│   └── index.ts                  # 共享 TypeScript 类型定义
│
├── tailwind.config.ts            # Tailwind CSS 配置
├── next.config.ts                # Next.js 配置（output: "standalone"）
└── postcss.config.mjs            # PostCSS 配置
```

---

## 🚀 使用

### 1. 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

> 配置 `NEXT_PUBLIC_API_BASE_URL` 为后端 API 地址（`lib/http.ts` 使用）。

> ⚠️ pnpm 用户请确保项目根目录 `.npmrc` 包含：
> ```
> public-hoist-pattern[]=*@heroui/*
> ```

### 4. 启动开发

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。

### 5. 打包

```bash
pnpm build
```

项目已配置 `output: "standalone"`（`next.config.ts`），打包后会生成自包含的 `.next/standalone/` 目录。

---

## 📝 规范

```bash
pnpm tsc --noEmit    # 类型检查（必须通过）
pnpm lint --fix      # Lint 自动修复
```

---

MIT License
