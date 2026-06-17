# Blog Frontend

个人博客前端项目，基于 Vue 3、TypeScript、Vite 和 pnpm 构建。项目包含基础代码质量门、单元测试、E2E 测试、Docker 镜像构建、Sentry 监控和 Dependabot 依赖更新配置。

## 技术栈

- Vue 3 + Vue Router + Pinia
- TypeScript + Vite
- Element Plus、VueUse、Three.js
- Vitest + Testing Library
- Playwright
- ESLint、Stylelint、Prettier
- Commitlint、Commitizen、Husky、lint-staged
- Docker + Nginx
- Sentry + web-vitals

## 环境要求

- Node.js >= 24.16.0
- pnpm >= 10.8.0

建议使用 `.node-version` 或 `.nvmrc` 中声明的 Node 版本。

## 快速开始

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

默认开发服务地址：

```text
http://localhost:5173
```

## 常用命令

| 命令                  | 说明                         |
| --------------------- | ---------------------------- |
| `pnpm dev`            | 启动本地开发服务             |
| `pnpm build`          | 类型检查并构建生产产物       |
| `pnpm preview`        | 本地预览构建产物             |
| `pnpm format:check`   | 检查 Prettier 格式           |
| `pnpm lint`           | 检查 TypeScript/Vue 代码     |
| `pnpm stylelint`      | 检查样式文件                 |
| `pnpm typecheck`      | 运行 Vue/TypeScript 类型检查 |
| `pnpm test:unit`      | 运行单元测试                 |
| `pnpm test:coverage`  | 运行单元测试并生成覆盖率     |
| `pnpm test:e2e`       | 运行 Playwright E2E 测试     |
| `pnpm check:circular` | 检查循环依赖                 |
| `pnpm check:deps`     | 检查未使用依赖和导出         |
| `pnpm check:spell`    | 拼写检查                     |
| `pnpm run ci`         | 运行主要 CI 质量门           |
| `pnpm run ci:full`    | 运行完整质量检查             |
| `pnpm commit`         | 使用 Commitizen 生成提交信息 |

## 环境变量

本地开发从 `.env.local` 读取变量，示例见 `.env.example`。

| 变量                    | 说明                        |
| ----------------------- | --------------------------- |
| `VITE_APP_NAME`         | 应用名称                    |
| `VITE_APP_ENV`          | 应用运行环境                |
| `VITE_PORT`             | Vite 开发服务端口           |
| `VITE_API_BASE_URL`     | 前端请求 API 的基础路径     |
| `VITE_API_PROXY_TARGET` | 开发环境 API 代理目标       |
| `VITE_SENTRY_DSN`       | Sentry DSN                  |
| `VITE_SENTRY_RELEASE`   | Sentry release 标识         |
| `VITE_SOURCEMAP`        | 是否生成 sourcemap          |
| `SENTRY_ORG`            | Sentry organization         |
| `SENTRY_PROJECT`        | Sentry project              |
| `SENTRY_AUTH_TOKEN`     | Sentry sourcemap 上传 token |

不要把真实密钥提交到仓库。GitHub Actions 中应通过 repository variables 或 secrets 注入生产配置。

## 项目结构

```text
.
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml
│       └── docker.yml
├── .husky/
├── nginx/
│   └── default.conf
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   ├── main.ts
│   ├── router.ts
│   └── style.css
├── tests/
│   ├── e2e/
│   ├── unit/
│   └── setup.ts
├── Dockerfile
├── playwright.config.ts
├── vite.config.ts
└── vitest.config.ts
```

## 代码规范

提交前会通过 Husky 运行：

- `pre-commit`: `pnpm lint-staged`
- `commit-msg`: `pnpm commitlint --edit "$1"`

本地修复命令：

```bash
pnpm lint:fix
pnpm stylelint:fix
pnpm format
```

## 分支与提交规范

PR 分支名应使用以下格式之一：

```text
feat/*
fix/*
chore/*
docs/*
style/*
refactor/*
perf/*
test/*
ci/*
build/*
hotfix/*
release/*
dependabot/*
renovate/*
```

提交信息遵循 Conventional Commits：

```text
feat: add article list
fix: handle empty response
docs: update readme
build(deps): bump docker/login-action
```

推荐使用：

```bash
pnpm commit
```

## 测试

单元测试位于 `tests/unit`，E2E 测试位于 `tests/e2e`。

```bash
pnpm test:unit
pnpm test:coverage
pnpm test:e2e
```

覆盖率阈值在 `vitest.config.ts` 中维护。覆盖率报告会输出到 `coverage/`，该目录不应提交。

## PR 检查

PR 检查由 `.github/workflows/ci.yml` 维护，并按顺序执行：

1. `PR Checks / 01 Branch name`
2. `PR Checks / 02 Commit messages`
3. `PR Checks / 03 Basic checks`
4. `PR Checks / 04 Unit tests and coverage`
5. `PR Checks / 05 Build`
6. `PR Checks / 06 E2E`
7. `PR Checks / 07 Secret scan`

单元测试覆盖率会上传为 GitHub Actions artifact，并在同仓库 PR 中创建或更新覆盖率评论。

## 构建与部署

本地构建：

```bash
pnpm build
```

Docker 镜像构建：

```bash
docker build -t blog-frontend .
```

运行容器：

```bash
docker run --rm -p 8080:80 blog-frontend
```

GitHub Actions 中的 `Docker` workflow 会在 `master` 分支 push 后构建镜像并推送到 GHCR。

## 监控

项目通过 `src/config/monitor.config.ts` 接入 Sentry 和 web-vitals：

- 配置 `VITE_SENTRY_DSN` 后会启用前端异常采集
- `VITE_SENTRY_RELEASE` 或 `SENTRY_RELEASE` 用于关联 release
- `VITE_SOURCEMAP=true` 且提供 Sentry 相关 secrets 时，可上传 sourcemap

## 生成产物

以下目录为构建或测试生成产物，不应提交：

- `dist/`
- `coverage/`
- `playwright-report/`
- `test-results/`

`src/components.d.ts` 和 `src/auto-import.d.ts` 由 Vite 插件生成并已纳入仓库。若改动了自动导入或组件解析配置，运行开发服务或构建后可能会更新这些声明文件；通常不要手动编辑它们。

## 常见问题

### `pnpm test:e2e` 找不到浏览器

先安装 Playwright 浏览器：

```bash
pnpm exec playwright install chromium
```

### `format:check` 检查生成文件失败

确认生成文件是否应加入 `.prettierignore`。例如 `src/auto-import.d.ts` 是自动生成文件，不适合手动维护格式。

### PR 没有显示 Update branch

Dependabot PR 通常可以在 PR 评论区输入：

```text
@dependabot rebase
```

让 Dependabot 基于最新 `master` 重新生成分支。
