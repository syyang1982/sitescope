import * as cheerio from 'cheerio';

export interface SiteData {
  url: string;
  html: string;
  headers: Record<string, string>;
  robotsTxt: string | null;
  sitemap: string | null;
  subpages: { url: string; html: string }[];
}

function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

async function safeFetch(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SiteScope/1.0 (Website Review Bot)' },
    });
    clearTimeout(timer);
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    return { status: res.status, headers, body: await res.text(), error: null };
  } catch (err) {
    clearTimeout(timer);
    return { status: 0, headers: {}, body: '', error: err instanceof Error ? err.message : String(err) };
  }
}

export async function fetchSiteData(rawUrl: string): Promise<SiteData> {
  const url = normalizeUrl(rawUrl);
  const origin = new URL(url).origin;

  // Fetch main page + robots.txt + sitemap in parallel
  const [mainRes, robotsRes, sitemapRes] = await Promise.all([
    safeFetch(url),
    safeFetch(`${origin}/robots.txt`),
    safeFetch(`${origin}/sitemap.xml`),
  ]);

  // Extract internal links from main page (max 5 subpages)
  const $ = cheerio.load(mainRes.body);
  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/') && !href.startsWith('//') && href !== '/') {
      links.add(href);
    }
  });

  const subpagePaths = [...links].slice(0, 5);
  const subpages = await Promise.all(
    subpagePaths.map(async (path) => {
      const res = await safeFetch(`${origin}${path}`);
      return { url: `${origin}${path}`, html: res.body };
    })
  );

  return {
    url,
    html: mainRes.body,
    headers: mainRes.headers,
    robotsTxt: robotsRes.status === 200 ? robotsRes.body : null,
    sitemap: sitemapRes.status === 200 ? sitemapRes.body : null,
    subpages,
  };
}
