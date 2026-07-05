export type Lang = 'en' | 'zh';

const t = {
  // Page
  subtitle: {
    en: 'AI-Powered Website Security · Frontend · Compliance Audit',
    zh: 'AI 驱动的网站安全 · 前端 · 合规全面审查',
  },

  // Errors
  auditError: { en: 'Audit Error', zh: '审查出现问题' },
  rateLimited: { en: 'Rate Limited', zh: '请求受限' },

  // Form
  urlPlaceholder: { en: 'Enter website URL, e.g. example.com', zh: '输入网站 URL，例如 example.com' },
  startAudit: { en: 'Start Audit', zh: '开始审查' },
  aiModel: { en: 'AI Model', zh: 'AI 模型' },
  selectModel: { en: 'Select a model for the audit', zh: '选择用于审查的 AI 模型' },
  customModel: { en: 'Custom Model (BYOK)', zh: '自定义模型 (BYOK)' },
  customModelDesc: { en: 'Use your own API endpoint, model, and key', zh: '使用你自己的 API 地址、模型和密钥' },
  customApiConfig: { en: 'Custom API Configuration', zh: '自定义 API 配置' },
  apiEndpointPlaceholder: { en: 'API endpoint, e.g. https://api.openai.com/v1', zh: 'API 地址，如 https://api.openai.com/v1' },
  modelNamePlaceholder: { en: 'Model name, e.g. gpt-4o, claude-sonnet-4-20250514', zh: '模型名称，如 gpt-4o、claude-sonnet-4-20250514' },
  apiKeyPlaceholder: { en: 'API Key', zh: 'API Key' },
  privacyNotice: {
    en: 'Your API Key is used only for this request. It is never saved or logged by the server.',
    zh: '你的 API Key 仅用于本次请求，不会被服务器保存或记录。请求完成后立即从内存中清除。',
  },
  privacyPromise: { en: 'Privacy Promise', zh: '隐私承诺' },
  urlHint: { en: 'Supports domain or full URL, e.g. example.com or https://example.com', zh: '支持输入域名或完整 URL，如 example.com 或 https://example.com' },

  // Passcode dialog
  verifyPasscode: { en: 'Verify Access Code', zh: '验证访问口令' },
  enterPasscodeToStart: { en: 'Enter access code to start the audit', zh: '输入口令以开始审查' },
  passcodePlaceholder: { en: 'Enter access code', zh: '请输入访问口令' },
  passcodeRequired: { en: 'Please enter the access code', zh: '请输入访问口令' },
  confirm: { en: 'Confirm', zh: '确认开始' },
  cancel: { en: 'Cancel', zh: '取消' },

  // Progress
  auditing: { en: 'Auditing in progress', zh: '正在审查中' },
  auditingHint: { en: 'AI is analyzing the website, please wait...', zh: 'AI 正在分析网站，请稍候...' },
  progressHint: { en: 'The report will appear on the page when complete', zh: '审查完成后报告将自动显示在页面上' },
  cancelAudit: { en: 'Cancel Audit', zh: '取消审查' },

  // Progress items
  fetchHomepage: { en: 'Fetching homepage', zh: '获取网站主页' },
  fetchRobots: { en: 'Fetching robots.txt', zh: '获取 robots.txt' },
  fetchSitemap: { en: 'Fetching sitemap.xml', zh: '获取 sitemap.xml' },
  fetchSubpages: { en: 'Fetching subpages', zh: '获取子页面' },
  securityReview: { en: 'Security review', zh: '安全审查' },
  frontendReview: { en: 'Frontend design review', zh: '前端设计审查' },
  seoReview: { en: 'SEO review', zh: 'SEO 审查' },
  complianceReview: { en: 'Legal compliance review', zh: '法务合规审查' },
  crossAnalysis: { en: 'Cross-dimensional analysis', zh: '关联分析' },

  // Report view
  target: { en: 'Target', zh: '审查目标' },
  generating: { en: 'Generating...', zh: '生成中...' },
  copy: { en: 'Copy', zh: '复制报告' },
  copied: { en: 'Copied', zh: '已复制' },
  download: { en: 'Download .md', zh: '下载 .md 报告' },
  analyzing: { en: 'AI is analyzing, report updates in real-time...', zh: 'AI 正在分析中，报告内容将实时更新...' },
  reportLegend: { en: 'Report Legend', zh: '报告说明' },
  criticalDesc: { en: 'Security or compliance issues requiring immediate remediation', zh: '需要立即修复的安全或合规问题' },
  importantDesc: { en: 'Issues that should be addressed soon', zh: '建议尽快处理的问题' },
  minorDesc: { en: 'Improvement suggestions', zh: '改进建议' },
  downloadHint: { en: 'Click "Download .md" to save the full report locally', zh: '点击「下载 .md 报告」可保存完整报告到本地' },
  technicalDimension: { en: '🔧 Technical Findings', zh: '🔧 技术维度发现' },
  technicalDimensionDesc: { en: 'Issues engineers care about — security, performance, code quality, infrastructure', zh: '工程师关注的问题 — 安全、性能、代码质量、基础设施' },
  businessDimension: { en: '💼 Business Findings', zh: '💼 商务维度发现' },
  businessDimensionDesc: { en: 'Issues product managers care about — compliance, brand trust, legal risk, user experience', zh: '产品经理关注的问题 — 合规、品牌信任、法律风险、用户体验' },

  // Footer
  hideKey: { en: 'Hide key', zh: '隐藏密钥' },
  showKey: { en: 'Show key', zh: '显示密钥' },
} as const;

export type Key = keyof typeof t;

export function useT(lang: Lang) {
  return (key: Key): string => t[key][lang];
}
