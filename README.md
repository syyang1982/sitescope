# SiteScope

AI 驱动的网站安全 · 前端设计 · 法务合规全面审查服务。

## 快速开始

```bash
npm install
cp .env.example .env.local  # 填入 OPENAI_API_KEY 和 ACCESS_TOKEN
npm run dev
```

访问 http://localhost:3000，输入访问口令后即可开始审查。

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | 是 |
| `ACCESS_TOKEN` | 服务访问口令 (防滥用) | 否 (留空则无需口令) |

## 部署到 Vercel

```bash
npx vercel --env OPENAI_API_KEY=sk-xxx --env ACCESS_TOKEN=your-passphrase
```

## 架构

```
用户 → 输入口令 → 输入 URL → POST /api/scan
                               ↓
                          fetch-site.ts (抓取 HTML + headers + robots + sitemap + 子页面)
                               ↓
                          prompt.ts (构建 system + user prompt)
                               ↓
                          OpenAI GPT-4o (流式生成审查报告)
                               ↓
                          前端实时渲染 + 下载 .md 文件
```

## 功能

- 口令保护，防止滥用
- 流式报告生成，实时查看进度
- 一键下载 Markdown 报告
- 覆盖安全、前端、SEO、法务合规多维度审查
