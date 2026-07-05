'use client';
import { useState } from 'react';
import { UrlForm } from '@/components/url-form';
import { ReportView } from '@/components/report-view';
import { useT, type Lang } from '@/lib/i18n';

export default function HomePage() {
  const [report, setReport] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const t = useT(lang);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-center text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              SiteScope
            </span>
          </h1>
          <p className="text-center text-xl text-gray-400 mb-8">{t('subtitle')}</p>
          <UrlForm
            onReport={(r, u) => { setReport(r); setUrl(u); }}
            onLoading={setLoading}
            onError={setError}
            lang={lang}
            onLangChange={setLang}
          />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className={`p-4 border rounded-lg ${
              error.includes('频繁') || error.includes('429') || error.includes('Rate')
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  error.includes('频繁') || error.includes('429') || error.includes('Rate')
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className={`font-medium ${
                    error.includes('频繁') || error.includes('429') || error.includes('Rate')
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {error.includes('频繁') || error.includes('429') || error.includes('Rate')
                      ? t('rateLimited')
                      : t('auditError')}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    error.includes('频繁') || error.includes('429') || error.includes('Rate')
                      ? 'text-yellow-300/80'
                      : 'text-red-300/80'
                  }`}>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <ReportView report={report} url={url} loading={loading} lang={lang} />
      </div>
    </main>
  );
}
