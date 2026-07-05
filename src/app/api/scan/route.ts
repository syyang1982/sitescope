import { streamText } from 'ai';
import { fetchSiteData } from '@/lib/fetch-site';
import { verifyToken } from '@/lib/auth';
import { buildSystemPrompt, buildUserPrompt, type ReportLang } from '@/lib/prompt';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { logAudit, getClientIp } from '@/lib/logger';
import { getModel, getCustomModel, isValidModel } from '@/lib/models';
import { z } from 'zod';

export const maxDuration = 60; // max for Vercel hobby plan
export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().min(1, '请输入网站 URL'),
  token: z.string().min(1, '请输入访问口令'),
  model: z.string().optional(),
  lang: z.enum(['en', 'zh']).optional(),
  // BYOK fields — never logged or persisted
  endpoint: z.string().url('请输入有效的 API 地址').optional().or(z.literal('')),
  apiKey: z.string().optional(),
  customModel: z.string().optional(),
});

export async function POST(req: Request) {
  const clientIp = getClientIp(req);

  // Rate limit check (before parsing body to save resources)
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    const retryMinutes = Math.ceil((rateLimit.retryAfterMs ?? 0) / 60000);
    logAudit({ ip: clientIp, url: 'N/A', status: 'failed', error: 'rate_limited' });
    return Response.json(
      { error: `请求过于频繁，每小时最多10次审查。请${retryMinutes}分钟后再试` },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0].message;
    return Response.json(
      { error: message === '请输入网站 URL' ? '请输入要审查的网站 URL' : message },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  // Verify access token
  if (!verifyToken(parsed.data.token)) {
    logAudit({ ip: clientIp, url: parsed.data.url, status: 'failed', error: 'invalid_token' });
    return Response.json(
      { error: '访问口令无效，请检查口令是否正确' },
      { status: 401, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  // Validate URL format
  let normalizedUrl = parsed.data.url;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return Response.json(
      { error: 'URL 格式不正确，请输入有效的网站地址（如 example.com）' },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  // Log audit: scan started
  logAudit({ ip: clientIp, url: normalizedUrl, status: 'started' });

  // Fetch site data
  let siteData;
  try {
    siteData = await fetchSiteData(parsed.data.url);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logAudit({ ip: clientIp, url: normalizedUrl, status: 'failed', error: errorMsg });

    if (errorMsg.includes('不允许访问内部网络')) {
      return Response.json(
        { error: '不允许扫描内部网络地址' },
        { status: 403, headers: getRateLimitHeaders(rateLimit) }
      );
    }
    if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
      return Response.json(
        { error: '无法找到该网站，请检查域名是否正确' },
        { status: 502, headers: getRateLimitHeaders(rateLimit) }
      );
    }
    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ETIMEDOUT')) {
      return Response.json(
        { error: '无法连接到该网站，网站可能已关闭或网络不通' },
        { status: 502, headers: getRateLimitHeaders(rateLimit) }
      );
    }
    return Response.json(
      { error: `获取网站数据失败: ${errorMsg}` },
      { status: 502, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  // Resolve model — BYOK or built-in
  const isByok = !!(parsed.data.endpoint && parsed.data.apiKey && parsed.data.customModel);

  let model: ReturnType<typeof getModel>;
  let modelId: string;

  if (isByok) {
    // BYOK: create a one-off provider from user credentials
    modelId = parsed.data.customModel!;
    try {
      model = getCustomModel(parsed.data.endpoint!, parsed.data.apiKey!, modelId);
    } catch {
      return Response.json(
        { error: '无法使用自定义 API 配置，请检查地址和密钥' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }
  } else {
    // Built-in model
    modelId = parsed.data.model && isValidModel(parsed.data.model)
      ? parsed.data.model
      : 'mimo-v2.5-pro';
    model = getModel(modelId);
    if (!model) {
      return Response.json(
        { error: '所选模型不可用，请检查配置' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }
  }

  // Stream LLM response — apiKey is never included in logs
  const lang: ReportLang = parsed.data.lang === 'zh' ? 'zh' : 'en';
  const result = streamText({
    model,
    system: buildSystemPrompt(lang),
    prompt: buildUserPrompt(siteData, lang),
    temperature: 0.1,
    onFinish: () => {
      logAudit({ ip: clientIp, url: normalizedUrl, status: 'completed', model: modelId });
    },
  });

  return result.toTextStreamResponse({ headers: getRateLimitHeaders(rateLimit) });
}
