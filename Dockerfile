# ============================================
# 阶段 1：依赖安装阶段
# ============================================

# 重要：Node.js 版本维护
# 本 Dockerfile 使用 Node.js 24.13.0-slim，为编写时的最新 LTS 版本。
# 为确保安全性和兼容性，请定期将 NODE_VERSION ARG 更新为最新的 LTS 版本。
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

# 设置工作目录
WORKDIR /app

# 先复制包相关文件，以利用 Docker 的缓存机制
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

# 使用锁定文件安装项目依赖，确保构建的可复现性
# 优先使用锁定文件（pnpm-lock.yaml），找不到则回退到 pnpm install
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  else \
    corepack enable pnpm && pnpm install; \
  fi

# ============================================
# 阶段 2：以 standalone 模式构建 Next.js 应用
# ============================================

FROM node:${NODE_VERSION} AS builder

# 设置工作目录
WORKDIR /app

# 从 dependencies 阶段复制项目依赖
COPY --from=dependencies /app/node_modules ./node_modules

# 复制应用源代码
COPY . .

ENV NODE_ENV=production

# Next.js 会收集完全匿名的通用使用遥测数据。
# 了解更多信息：https://nextjs.org/telemetry
# 如果想在构建期间禁用遥测，请取消以下行的注释。
ENV NEXT_TELEMETRY_DISABLED=1

# 构建 Next.js 应用
# 如果想加速 Docker 重建，可以通过添加以下参数来缓存构建产物：
# --mount=type=cache,target=/app/.next/cache
# 这会在多次构建间缓存 .next/cache 目录，但也会导致
# .next/cache/fetch-cache 不会被包含在最终镜像中，意味着
# 构建时缓存的 fetch 响应在运行时将不可用。
RUN if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  elif [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn build; \
  else \
    corepack enable pnpm && pnpm build; \
  fi

# ============================================
# 阶段 3：运行 Next.js 应用
# ============================================

FROM node:${NODE_VERSION} AS runner

# 设置工作目录
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js 会收集完全匿名的通用使用遥测数据。
# 了解更多信息：https://nextjs.org/telemetry
# 如果想在运行时禁用遥测，请取消以下行的注释。
ENV NEXT_TELEMETRY_DISABLED=1

# 复制生产资源文件
COPY --from=builder --chown=node:node /app/public ./public

# 为预渲染缓存设置正确的权限
RUN mkdir .next
RUN chown node:node .next

# 自动利用输出追踪来减小镜像体积
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 如果想在启动时即可使用构建期间生成的 fetch 缓存，
# 使缓存的响应立即可用，请取消以下行的注释：
# COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

# 出于安全最佳实践，切换到非 root 用户
USER node

# 暴露 3000 端口以允许 HTTP 流量
EXPOSE 3000

# 启动 Next.js standalone 服务器
CMD ["node", "server.js"]