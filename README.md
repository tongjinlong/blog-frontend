# Blog Frontend

个人博客前端项目，基于 Vue 3、TypeScript、Vite 和 pnpm 构建。项目包含代码质量门、单元测试、E2E 测试、Docker 镜像构建与扫描、runtime config、Sentry 监控、自动 release notes 和 Dependabot 依赖分组策略。

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
| `pnpm check:bundle`   | 检查构建产物 gzip 体积       |
| `pnpm check:deps`     | 检查未使用依赖和导出         |
| `pnpm check:spell`    | 拼写检查                     |
| `pnpm run ci`         | 运行主要 CI 质量门           |
| `pnpm run ci:full`    | 运行完整质量检查             |
| `pnpm commit`         | 使用 Commitizen 生成提交信息 |

## 环境变量

本地开发从 `.env.local` 读取变量，示例见 `.env.example`。Docker 运行时会在容器启动时生成 `/config.js`，前端优先读取 `window.__APP_CONFIG__`，再回退到 `VITE_*` 构建期变量。

构建期变量：

| 变量                    | 说明                          |
| ----------------------- | ----------------------------- |
| `VITE_APP_NAME`         | 应用名称默认值                |
| `VITE_APP_ENV`          | 应用运行环境默认值            |
| `VITE_PORT`             | Vite 开发服务端口             |
| `VITE_API_BASE_URL`     | 前端请求 API 的基础路径默认值 |
| `VITE_API_PROXY_TARGET` | 开发环境 API 代理目标         |
| `VITE_SENTRY_DSN`       | Sentry DSN 默认值             |
| `VITE_SENTRY_RELEASE`   | Sentry release 默认值         |
| `VITE_SOURCEMAP`        | 是否生成 sourcemap            |
| `SENTRY_ORG`            | Sentry organization           |
| `SENTRY_PROJECT`        | Sentry project                |
| `SENTRY_AUTH_TOKEN`     | Sentry sourcemap 上传 token   |

运行时变量：

| 变量              | 说明                                        |
| ----------------- | ------------------------------------------- |
| `APP_NAME`        | Runtime 应用名称                            |
| `APP_ENV`         | Runtime 环境，`development` 或 `production` |
| `API_BASE_URL`    | Runtime API 基础路径                        |
| `SENTRY_DSN`      | Runtime Sentry DSN                          |
| `SENTRY_RELEASE`  | Runtime Sentry release 标识                 |
| `APP_CONFIG_FILE` | 可选。覆盖容器内 `config.js` 输出路径       |

不要把真实密钥提交到仓库。GitHub Actions 中应通过 repository variables 或 secrets 注入生产配置。

## 项目结构

```text
.
├── .github/
│   ├── actions/
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml
│       ├── release.yml
│       └── release-please.yml
├── .husky/
├── nginx/
│   ├── default.conf
│   └── runtime-config.sh
├── public/
├── scripts/
├── src/
│   ├── api/
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
5. `PR Checks / 05 Build`，包含 bundle size 检查
6. `PR Checks / 06 E2E`
7. `PR Checks / 07 Secret scan`
8. `PR Checks / 08 Docker build check`

单元测试覆盖率会上传为 GitHub Actions artifact，并在同仓库 PR 中创建或更新覆盖率评论。构建阶段会上传 `dist/stats.html`，用于查看 bundle 组成。

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
docker run --rm -p 8080:80 \
  -e APP_ENV=development \
  -e API_BASE_URL=/api \
  blog-frontend
```

PR 阶段只验证 Dockerfile 是否能构建，不推送镜像。PR 合并到 `master` 后，`Release` workflow 会在 `PR Checks` 成功后顺序执行：

1. 构建并推送 GHCR 镜像
2. 使用 Trivy 扫描镜像
3. 通过 SSH + docker compose 自动部署 `development`
4. 对 `development` 执行 smoke test
5. 通过 GitHub Environment 审批后部署 `production`
6. 对 `production` 执行 smoke test
7. 上传 release metadata，记录 source SHA、image 和 digest

服务器上的 `docker-compose.yml` 推荐使用 `IMAGE_REF` 指向精确镜像版本：

```yaml
services:
  blog-frontend:
    image: ${IMAGE_REF}
    restart: unless-stopped
    environment:
      APP_NAME: ${APP_NAME:-Blog Frontend}
      APP_ENV: ${APP_ENV:-production}
      API_BASE_URL: ${API_BASE_URL:-/api}
      SENTRY_DSN: ${SENTRY_DSN:-}
      SENTRY_RELEASE: ${SENTRY_RELEASE:-}
    ports:
      - '8080:80'
```

`development` 和 `production` 两个 GitHub Environment 需要分别配置：

| 类型   | 名称              | 说明                               |
| ------ | ----------------- | ---------------------------------- |
| secret | `SSH_PRIVATE_KEY` | 连接服务器的 SSH 私钥              |
| secret | `GHCR_TOKEN`      | 服务器拉取 GHCR 私有镜像的 token   |
| var    | `SSH_HOST`        | 服务器地址                         |
| var    | `SSH_PORT`        | SSH 端口，通常为 `22`              |
| var    | `SSH_USER`        | SSH 用户                           |
| var    | `DEPLOY_PATH`     | 服务器上的 docker compose 项目目录 |
| var    | `COMPOSE_SERVICE` | docker compose service 名称        |
| var    | `GHCR_USERNAME`   | GHCR 登录用户名                    |
| var    | `APP_URL`         | smoke test 访问地址                |
| var    | `APP_NAME`        | Runtime 应用名称                   |
| var    | `API_BASE_URL`    | Runtime API 基础路径               |
| secret | `SENTRY_DSN`      | Runtime Sentry DSN，可为空         |

`APP_ENV` 由 workflow 自动设置：`development` 部署为 `development`，`production` 部署为 `production`。`production` environment 建议开启 required reviewers，用于上线前人工审批。

## 发布说明

`.github/workflows/release-please.yml` 会在 `master` 推送后根据 Conventional Commits 创建或更新 release PR。合并该 PR 后会生成 changelog、tag 和 GitHub Release。

## API 层

HTTP 请求入口位于 `src/api/http.ts`：

- `http`: 默认 axios instance，`baseURL` 来自 runtime config
- `createApiClient`: 用于测试或特殊场景创建独立 client
- `request`: 返回 `response.data` 的轻量封装
- `ApiError`: 统一错误模型，区分 `http`、`network`、`timeout`、`unknown`

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
