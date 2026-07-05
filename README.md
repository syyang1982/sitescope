# SiteScope

**AI-Powered Website Audit Platform** — Comprehensive security, frontend design, SEO, and legal compliance reviews in minutes, not days.

> SiteScope replaces weeks of manual audits with instant, AI-driven analysis. Submit any URL and receive a structured report covering security vulnerabilities, accessibility gaps, SEO issues, and legal compliance risks — all with actionable remediation steps.

---

## Why SiteScope?

### For Security Teams
- **Instant vulnerability assessment** — Detect missing security headers (CSP, HSTS, X-Frame-Options), information leakage, SSRF risks, and form security issues in seconds
- **Cross-dimensional analysis** — AI correlates findings across security, compliance, and frontend dimensions to surface hidden risks that single-dimension tools miss
- **No infrastructure to manage** — SaaS-ready, deploy to Vercel in one command

### For Compliance Officers
- **Privacy regulation readiness** — Automated checks for GDPR, CCPA, and Australian Privacy Act compliance markers (privacy policy, cookie consent, tracking disclosure)
- **Brand risk detection** — Identifies unauthorized third-party logo usage and misleading partnership claims
- **Audit trail** — Every scan is logged with IP, timestamp, and model used for regulatory evidence

### For Marketing & Product Teams
- **SEO health check** — Validates robots.txt, sitemap.xml, canonical URLs, Open Graph tags, and crawlability
- **Frontend quality audit** — WCAG 2.1 accessibility checks, mobile responsiveness, meta tag completeness
- **Social sharing readiness** — Verifies Open Graph and Twitter Card metadata for optimal link previews

### For Engineering Teams
- **CI/CD integration ready** — RESTful API with streaming responses, perfect for automated pipeline checks
- **Multi-model support** — Built-in MiMo models + BYOK (Bring Your Own Key) for OpenAI, Claude, DeepSeek, or any OpenAI-compatible endpoint
- **Bilingual output** — Reports in English or Chinese, selectable per request

---

## Key Features

| Feature | Description |
|---------|-------------|
| **5-Dimension Audit** | Security, Frontend Design, SEO, Legal Compliance, Cross-Dimensional Analysis |
| **Real-Time Streaming** | Reports generate live — watch the AI analyze your site in real time |
| **Multi-Model AI** | MiMo v2.5 Pro (recommended), MiMo v2.5 (fast), or bring your own model via BYOK |
| **Bilingual UI** | Full English/Chinese interface with one-click toggle |
| **Bilingual Reports** | Generate audit reports in English or Chinese |
| **BYOK Mode** | Use your own API key, endpoint, and model — your key is never stored or logged |
| **Rate Limiting** | 10 audits per IP per hour to prevent abuse |
| **Audit Logging** | Every scan logged (IP, URL, model, timestamp) for compliance |
| **SSRF Protection** | Blocks internal network scanning (localhost, private IPs) |
| **Download & Copy** | One-click download as `.md` file or copy to clipboard |
| **Progress Tracking** | Real-time progress indicators for each audit dimension |
| **Access Control** | Passcode-gated access to prevent unauthorized usage |

---

## Quick Start

### Prerequisites
- Node.js >= 20
- A MiMo API key from [Xiaomi MiMo](https://api.xiaomimimo.com)

### Installation

```bash
git clone https://github.com/syyang1982/sitescope.git
cd sitescope
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MIMO_API_KEY=sk-your-mimo-key         # Required — MiMo API key
ACCESS_TOKEN=your-passphrase          # Required — Access code for audit submission
```

### Run

```bash
npm run dev
```

Visit http://localhost:3000.

---

## Usage Flow

1. Enter the target website URL (e.g., `example.com`)
2. Click **Start Audit**
3. Enter the access code in the verification dialog
4. Select your preferred AI model and report language (EN/ZH)
5. Watch the real-time progress as AI analyzes each dimension
6. View the structured report with severity levels (Critical / Important / Minor)
7. Download as `.md` or copy to clipboard

---

## Audit Dimensions

| Dimension | What's Checked |
|-----------|----------------|
| **Security** | HTTP headers (HSTS, CSP, X-Frame-Options, etc.), info leakage, SSRF risk, form security, tech stack fingerprinting |
| **Frontend Design** | Meta tags, WCAG 2.1 accessibility, mobile responsiveness, inline styles, video autoplay |
| **SEO** | robots.txt, sitemap.xml, dead links, indexability, canonical URLs |
| **Legal Compliance** | Privacy policy, terms of service, cookie consent, tracking scripts, brand authorization, ABN/ACN display |
| **Cross-Dimensional** | Contradictions across dimensions (e.g., "privacy policy claims no tracking, but Cloudflare Analytics detected") |

---

## API Reference

### POST `/api/scan`

Initiate an audit.

**Request Body:**
```json
{
  "url": "https://example.com",
  "token": "your-access-code",
  "model": "mimo-v2.5-pro",
  "lang": "en",
  "endpoint": "https://api.openai.com/v1",  // optional, for BYOK
  "apiKey": "sk-...",                         // optional, for BYOK
  "customModel": "gpt-4o"                     // optional, for BYOK
}
```

**Response:** Streaming text/plain with the audit report in Markdown format.

**Headers:**
- `X-RateLimit-Limit: 10`
- `X-RateLimit-Remaining: <count>`
- `X-RateLimit-Window: 3600`

### GET `/api/models`

Returns available built-in models.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| AI | Vercel AI SDK + Xiaomi MiMo v2.5 Pro (streaming) |
| Data Fetching | cheerio + fetch (passive scan, GET only) |
| Validation | zod |
| Hosting | Vercel (serverless, edge-ready) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + metadata + OG tags
│   ├── page.tsx                # Homepage — URL input + report display
│   ├── privacy/page.tsx        # Privacy Policy page
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   └── api/
│       ├── scan/route.ts       # POST — auth + data fetch + streaming AI report
│       └── models/route.ts     # GET — available models
├── components/
│   ├── url-form.tsx            # URL form + passcode dialog + model selector + BYOK
│   └── report-view.tsx         # Streaming report renderer + copy/download
└── lib/
    ├── models.ts               # Model registry + BYOK provider
    ├── prompt.ts               # System + user prompt builder (EN/ZH)
    ├── fetch-site.ts           # HTML, headers, robots.txt, sitemap, subpages
    ├── auth.ts                 # Passcode verification
    ├── rate-limit.ts           # Per-IP rate limiting (10/hour)
    ├── logger.ts               # Audit logging (IP, URL, model, timestamp)
    ├── ssrf-guard.ts           # Internal network blocking
    └── i18n.ts                 # UI translations (EN/ZH)
```

---

## Deploy to Vercel

```bash
# One-command deploy
vercel deploy --prod

# Set environment variables
vercel env add MIMO_API_KEY production
vercel env add ACCESS_TOKEN production
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

---

## License

MIT
