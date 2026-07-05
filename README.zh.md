# SiteScope

**AI 驱动的网站审查平台** — 分钟级完成安全、前端设计、SEO 和法务合规全面审查。

> SiteScope 用 AI 取代数周的人工审查。提交任意 URL，即可获得涵盖安全漏洞、无障碍缺陷、SEO 问题和合规风险的结构化报告，并附带可操作的修复建议。

---

## 为什么选择 SiteScope？

### 安全团队
- **即时漏洞评估** — 秒级检测缺失的安全头（CSP、HSTS、X-Frame-Options）、信息泄露、SSRF 风险和表单安全问题
- **跨维度关联分析** — AI 交叉比对安全、合规和前端维度的发现，揭示单一维度工具无法发现的隐藏风险
- **零基础设施** — SaaS 就绪，一条命令部署到 Vercel

### 合规团队
- **隐私法规就绪** — 自动检查 GDPR、CCPA 和澳大利亚隐私法合规标记（隐私政策、Cookie 同意、追踪披露）
- **品牌风险检测** — 识别未授权的第三方 Logo 使用和误导性合作声明
- **审计追踪** — 每次扫描记录 IP、时间戳和使用的模型，可作为监管证据

### 市场与产品团队
- **SEO 健康检查** — 验证 robots.txt、sitemap.xml、canonical URL、Open Graph 标签和可爬取性
- **前端质量审查** — WCAG 2.1 无障碍检查、移动端适配、Meta 标签完整性
- **社交分享就绪** — 验证 Open Graph 和 Twitter Card 元数据，确保最佳链接预览

### 工程团队
- **CI/CD 集成就绪** — RESTful API + 流式响应，适合自动化流水线
- **多模型支持** — 内置 MiMo 模型 + BYOK（自带密钥）支持 OpenAI、Claude、DeepSeek 或任何 OpenAI 兼容端点
- **双语输出** — 报告支持中英文，按请求选择

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **五维审查** | 安全、前端设计、SEO、法务合规、跨维度关联分析 |
| **实时流式** | 报告实时生成 — 观看 AI 逐项分析您的网站 |
| **多模型 AI** | MiMo v2.5 Pro（推荐）、MiMo v2.5（快速），或通过 BYOK 使用自定义模型 |
| **双语界面** | 完整的中英文界面，一键切换 |
| **双语报告** | 选择中文或英文生成审查报告 |
| **BYOK 模式** | 使用自己的 API Key、端点和模型 — 密钥不会被存储或记录 |
| **频率限制** | 每 IP 每小时 10 次审查，防止滥用 |
| **审计日志** | 每次扫描记录（IP、URL、模型、时间戳） |
| **SSRF 防护** | 阻止内网扫描（localhost、私有 IP） |
| **下载与复制** | 一键下载 `.md` 文件或复制到剪贴板 |
| **进度追踪** | 实时显示每个审查维度的进度 |
| **访问控制** | 口令验证，防止未授权使用 |

---

## 快速开始

### 前置条件
- Node.js >= 20
- [小米 MiMo](https://api.xiaomimimo.com) API 密钥

### 安装

```bash
git clone https://github.com/syyang1982/sitescope.git
cd sitescope
npm install
```

### 配置

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
MIMO_API_KEY=sk-your-mimo-key         # 必填 — MiMo API 密钥
ACCESS_TOKEN=your-passphrase          # 必填 — 审查提交的访问口令
```

### 运行

```bash
npm run dev
```

访问 http://localhost:3000。

---

## 使用流程

1. 输入目标网站 URL（如 `example.com`）
2. 点击 **开始审查**
3. 在弹出的验证框中输入访问口令
4. 选择 AI 模型和报告语言（中/英）
5. 实时查看每个审查维度的进度
6. 查看结构化报告（🔴 关键 / 🟠 重要 / ⚪ 普通）
7. 一键下载 `.md` 或复制到剪贴板

---

## 审查维度

| 维度 | 检查内容 |
|------|----------|
| **安全** | HTTP 响应头（HSTS、CSP、X-Frame-Options 等）、信息泄露、SSRF 风险、表单安全、技术栈指纹 |
| **前端设计** | Meta 标签、WCAG 2.1 无障碍、移动端适配、内联样式、视频自动播放 |
| **SEO** | robots.txt、sitemap.xml、死链、可索引性、canonical URL |
| **法务合规** | 隐私政策、使用条款、Cookie 同意、追踪脚本、品牌授权、ABN/ACN 显示 |
| **跨维度分析** | 交叉比对各维度发现（如"隐私政策声称不追踪，但检测到 Cloudflare Analytics"） |

---

## API 接口

### POST `/api/scan`

发起审查。

**请求体：**
```json
{
  "url": "https://example.com",
  "token": "your-access-code",
  "model": "mimo-v2.5-pro",
  "lang": "en",
  "endpoint": "https://api.openai.com/v1",  // 可选，BYOK
  "apiKey": "sk-...",                         // 可选，BYOK
  "customModel": "gpt-4o"                     // 可选，BYOK
}
```

**响应：** 流式 text/plain，Markdown 格式的审查报告。

**响应头：**
- `X-RateLimit-Limit: 10`
- `X-RateLimit-Remaining: <count>`
- `X-RateLimit-Window: 3600`

### GET `/api/models`

返回可用的内置模型列表。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| UI | React 19、Tailwind CSS 4、shadcn/ui |
| AI | Vercel AI SDK + 小米 MiMo v2.5 Pro（流式输出） |
| 数据抓取 | cheerio + fetch（被动扫描，仅 GET 请求） |
| 校验 | zod |
| 部署 | Vercel（Serverless，Edge-ready） |

---

## 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局 + 元数据 + OG 标签
│   ├── page.tsx                # 首页 — URL 输入 + 报告展示
│   ├── privacy/page.tsx        # 隐私政策页面
│   ├── robots.ts               # 动态 robots.txt
│   ├── sitemap.ts              # 动态 sitemap.xml
│   └── api/
│       ├── scan/route.ts       # POST — 口令验证 + 数据抓取 + 流式 AI 报告
│       └── models/route.ts     # GET — 可用模型列表
├── components/
│   ├── url-form.tsx            # URL 表单 + 口令弹窗 + 模型选择 + BYOK
│   └── report-view.tsx         # 流式报告渲染 + 复制/下载
└── lib/
    ├── models.ts               # 模型注册 + BYOK Provider
    ├── prompt.ts               # 系统提示词 + 用户提示词（中/英）
    ├── fetch-site.ts           # HTML、headers、robots.txt、sitemap、子页面
    ├── auth.ts                 # 口令校验
    ├── rate-limit.ts           # IP 频率限制（10次/小时）
    ├── logger.ts               # 审计日志（IP、URL、模型、时间戳）
    ├── ssrf-guard.ts           # 内网拦截
    └── i18n.ts                 # UI 翻译（中/英）
```

---

## 部署到 Vercel

```bash
# 一键部署
vercel deploy --prod

# 设置环境变量
vercel env add MIMO_API_KEY production
vercel env add ACCESS_TOKEN production
```

或连接 GitHub 仓库到 Vercel，推送即自动部署。

---

## 许可证

MIT
