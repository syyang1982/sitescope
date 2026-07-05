export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <p><em>Last updated: July 5, 2026</em></p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>
            When you use SiteScope, we collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Website URLs</strong> you submit for audit — these are processed to generate your audit report.</li>
            <li><strong>Access codes</strong> — verified against our server but never stored or logged.</li>
            <li><strong>API keys</strong> (if you use BYOK mode) — used only for the single request, never saved or logged.</li>
            <li><strong>IP addresses</strong> — used solely for rate limiting (10 requests per hour) and audit logging.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Website URLs are sent to our AI provider for analysis and are not retained after the report is generated.</li>
            <li>IP addresses are stored in server logs for abuse prevention and are automatically purged.</li>
            <li>We do not use cookies for tracking purposes.</li>
            <li>We do not sell, share, or transfer your data to third parties.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Third-Party Services</h2>
          <p>
            SiteScope uses the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI Providers</strong> (Xiaomi MiMo, OpenAI, Anthropic, DeepSeek) — your submitted URL and site data are sent to the selected AI model for analysis. These providers have their own privacy policies.</li>
            <li><strong>Vercel</strong> — our hosting provider. Vercel may collect standard server logs including IP addresses.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Audit reports are generated in real-time and delivered to your browser. We do not store reports on our servers.</li>
            <li>Server audit logs (IP, URL, timestamp) are retained for rate-limiting purposes and automatically purged.</li>
            <li>API keys provided via BYOK are never stored — they exist only in memory during the request.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Security</h2>
          <p>
            We implement the following security measures:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>HTTPS encryption for all communications</li>
            <li>Content Security Policy (CSP) headers</li>
            <li>Rate limiting to prevent abuse</li>
            <li>SSRF protection to prevent scanning of internal networks</li>
            <li>Access code verification for service access</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">6. Your Rights</h2>
          <p>
            Under applicable privacy laws (GDPR, CCPA, APPs), you have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Know what data is collected about you</li>
            <li>Request deletion of your data</li>
            <li>Opt out of data collection (by not using the service)</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">7. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us via our{' '}
            <a href="https://github.com/syyang1982/sitescope/issues" className="text-blue-400 hover:underline">
              GitHub repository
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <a href="/" className="text-blue-400 hover:underline text-sm">&larr; Back to SiteScope</a>
        </div>
      </div>
    </main>
  );
}
