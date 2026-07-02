'use client';
import { useState } from 'react';
import { AuthGate } from '@/components/auth-gate';
import { UrlForm } from '@/components/url-form';
import { ReportView } from '@/components/report-view';

export default function HomePage() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return <AuthGate onAuthenticated={setToken} />;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">SiteScope</h1>
          <p className="text-xl text-gray-400 mb-8">
            AI 驱动的网站安全 · 前端 · 合规全面审查
          </p>
          <UrlForm
            token={token}
            onReport={(r, u) => { setReport(r); setUrl(u); }}
            onLoading={setLoading}
            onError={setError}
          />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <ReportView report={report} url={url} loading={loading} />
      </div>
    </main>
  );
}
