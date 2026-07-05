'use client';
import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import { useT, type Lang } from '@/lib/i18n';

interface ReportViewProps {
  report: string;
  url: string;
  loading: boolean;
  lang: Lang;
}

export function ReportView({ report, url, loading, lang }: ReportViewProps) {
  const t = useT(lang);
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => report ? marked(report) as string : '', [report]);

  function handleDownload() {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      a.download = `sitescope-${hostname}-${new Date().toISOString().split('T')[0]}.md`;
    } catch {
      a.download = `sitescope-report-${new Date().toISOString().split('T')[0]}.md`;
    }
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleCopy() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!report && !loading) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Report header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">
            {t('target')}: <span className="text-white font-medium">{url}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {loading && report && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{t('generating')}</span>
            </div>
          )}
          {report && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {t('copy')}
                  </>
                )}
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('download')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Report content */}
      <div className="relative">
        <div
          className="report-content prose prose-invert max-w-none bg-gray-900/50 border border-gray-800 rounded-lg p-6 overflow-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {loading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {t('analyzing')}
          </div>
        )}
      </div>

      {/* Report legend */}
      {report && !loading && (
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">{t('reportLegend')}</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• <span className="text-red-400">🔴 Critical</span> — {t('criticalDesc')}</li>
            <li>• <span className="text-orange-400">🟠 Important</span> — {t('importantDesc')}</li>
            <li>• <span className="text-gray-400">⚪ Minor</span> — {t('minorDesc')}</li>
            <li>• {t('downloadHint')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
