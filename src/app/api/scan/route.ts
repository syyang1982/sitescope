import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { fetchSiteData } from '@/lib/fetch-site';
import { verifyToken } from '@/lib/auth';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt';
import { z } from 'zod';

const mimo = createOpenAI({
  baseURL: 'https://api.xiaomimimo.com/v1',
  apiKey: process.env.MIMO_API_KEY,
});

const bodySchema = z.object({
  url: z.string().min(1, '请输入 URL'),
  token: z.string().min(1, '请输入访问口令'),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Verify access token
  if (!verifyToken(parsed.data.token)) {
    return Response.json({ error: '访问口令无效' }, { status: 401 });
  }

  // Fetch site data
  let siteData;
  try {
    siteData = await fetchSiteData(parsed.data.url);
  } catch (err) {
    return Response.json(
      { error: `无法获取网站数据: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }

  // Stream LLM response via MiMo v2.5 Pro
  const result = streamText({
    model: mimo('mimo-v2.5-pro'),
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(siteData),
    temperature: 0.1,
  });

  return result.toTextStreamResponse();
}
