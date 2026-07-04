# SiteScope

AI 驱动的网站审查服务。输入任意 URL，自动抓取网站数据（HTML、HTTP 头、robots.txt、sitemap、子页面），交给 GPT-4o 生成涵盖安全、前端设计、SEO、法务合规的结构化审查报告。

## 安装

需要 Node.js >= 20。

```bash
# 克隆仓库后进入项目目录
cd sitescope

# 安装依赖
npm install
```

## 配置

复制环境变量模板并填入你的值：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
OPENAI_API_KEY=sk-your-openai-key    # 必填，OpenAI API 密钥
ACCESS_TOKEN=your-passphrase          # 必填，扫描提交时的访问口令
```

- `OPENAI_API_KEY` — 用于调用 GPT-4o 生成审查报告
- `ACCESS_TOKEN` — 用户点击"开始审查"后需要输入此口令才能开始扫描，用于防止滥用

## 运行

```bash
npm run dev
```

访问 http://localhost:3000。

## 使用流程

1. 在输入框中输入目标网站 URL（例如 `example.com`）
2. 点击「开始审查」
3. 在弹出的口令验证框中输入访问口令
4. 口令验证通过后，服务开始抓取网站数据并调用 AI 生成报告
5. 报告实时流式显示，完成后可一键复制或下载为 `.md` 文件

## 审查维度

| 维度 | 检查内容 |
|------|----------|
| 安全 | HTTP 响应头（HSTS/CSP/X-Frame-Options 等）、信息泄露、SSRF 风险、表单安全 |
| 前端设计 | Meta 标签、WCAG 无障碍、移动端适配、内联样式 |
| SEO | robots.txt、sitemap.xml、死链、可索引性 |
| 法务合规 | 隐私政策、Cookie 同意、追踪脚本、品牌授权 |
| 关联分析 | 交叉比对各维度发现，识别矛盾和业务风险 |

## 技术栈

- **框架：** Next.js 16 (App Router)
- **UI：** React 19、Tailwind CSS 4、shadcn/ui
- **AI：** Vercel AI SDK + OpenAI GPT-4o（流式输出）
- **数据抓取：** cheerio + fetch（被动扫描，仅 GET 请求）
- **校验：** zod

## 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页 — URL 输入 + 报告展示
│   └── api/scan/route.ts       # POST — 口令验证 + 数据抓取 + 流式 AI 报告
├── components/
│   ├── url-form.tsx            # URL 表单 + 口令验证弹窗
│   └── report-view.tsx         # 流式报告渲染 + 复制/下载
└── lib/
    ├── fetch-site.ts           # 抓取 HTML、headers、robots.txt、sitemap、子页面
    ├── prompt.ts               # 系统提示词 + 用户提示词构建
    └── auth.ts                 # 口令校验
```

## 部署到 Vercel

```bash
npx vercel --env OPENAI_API_KEY=sk-xxx --env ACCESS_TOKEN=your-passphrase
```

或在 Vercel 控制台中设置对应的环境变量后连接 Git 仓库自动部署。
