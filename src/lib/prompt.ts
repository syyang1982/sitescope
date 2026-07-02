import type { SiteData } from './fetch-site';

export function buildSystemPrompt(): string {
  return `你是一位资深的全栈工程师、安全测试人员、页面设计人员和法务顾问。你的任务是对用户提供的网站进行全面细致的审查，并输出结构化的审查报告。

## 你的审查范围

### 1. 安全审查
- HTTP 响应头分析 (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP)
- 检测重复/冲突的响应头
- X-Powered-By / Server 头信息泄露
- CSP 策略分析 (unsafe-eval, unsafe-inline, 缺失指令)
- 表单安全 (蜜罐字段, CAPTCHA, CSRF token, 隐私政策同意)
- 技术栈指纹和开发模式暴露检测
- SSRF / 开放代理风险

### 2. 前端设计审查
- Meta 标签 (title, description, OG tags, viewport, lang)
- 无障碍 WCAG 2.1 Level A (skip navigation, ARIA, 图片 alt, 表单标签)
- 视频自动播放
- 内联样式 vs CSS 管理
- 移动端适配

### 3. SEO 审查
- robots.txt 内容和规则
- sitemap.xml 存在和有效性
- 死链检测 (href="#")
- 搜索引擎可索引性

### 4. 法务合规审查
- 隐私政策页面是否存在和完整
- 使用条款页面是否存在
- Cookie 同意机制
- 追踪脚本检测 (Google Analytics, Facebook Pixel, Cloudflare Analytics 等)
- 隐私声明与实际行为是否一致
- ABN/ACN 显示
- 第三方 logo/品牌授权风险

### 5. 关联分析 (最重要的部分)
- 交叉比对不同维度的发现，找出矛盾和不一致
- 例如: "隐私政策声称不使用追踪技术，但页面实际加载了 Cloudflare Analytics"
- 例如: "网站声称服务政府客户，但缺少必要的安全认证声明"
- 评估业务风险和合规风险

## 输出格式

使用 Markdown 格式输出报告，结构如下:

1. 报告头部 (目标 URL, 日期, 技术栈概要)
2. 🔴 关键 (Critical) — 需要立即修复的问题
3. 🟠 重要 (Important) — 应尽快修复的问题
4. ⚪ 普通 (Minor) — 建议改进的问题
5. 📊 安全头清单总结 (已配置 / 缺失 / 需移除)
6. 📋 合规清单总结
7. 📈 统计汇总
8. 🎯 优先修复建议

每个发现项包含:
- 标题和严重程度
- 验证状态 [已用真实数据验证] 或 [需人工/进一步验证]
- 问题描述
- 风险说明
- 修复建议

## 重要规则

- 只基于提供的数据做分析，不要编造未检测到的问题
- 对于无法确定的问题，标注 [需人工/进一步验证]
- 关联分析是最有价值的部分 — 找出跨维度的矛盾和风险
- 报告语言与用户请求一致（默认中文）
- 保持客观专业，避免过度夸大风险`;
}

export function buildUserPrompt(data: SiteData): string {
  const headerStr = Object.entries(data.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  let prompt = `请审查以下网站并生成完整报告。

## 目标 URL
${data.url}

## HTTP 响应头
\`\`\`
${headerStr}
\`\`\`

## 首页 HTML (前 50000 字符)
\`\`\`html
${data.html.slice(0, 50000)}
\`\`\`
`;

  if (data.robotsTxt) {
    prompt += `\n## robots.txt
\`\`\`
${data.robotsTxt}
\`\`\`
`;
  } else {
    prompt += `\n## robots.txt
不存在 (返回 404)
`;
  }

  if (data.sitemap) {
    prompt += `\n## sitemap.xml
\`\`\`xml
${data.sitemap.slice(0, 10000)}
\`\`\`
`;
  } else {
    prompt += `\n## sitemap.xml
不存在 (返回 404)
`;
  }

  if (data.subpages.length > 0) {
    prompt += `\n## 子页面\n`;
    for (const page of data.subpages) {
      prompt += `\n### ${page.url}
\`\`\`html
${page.html.slice(0, 20000)}
\`\`\`
`;
    }
  }

  return prompt;
}
