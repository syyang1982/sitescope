'use client';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';

interface ReportViewProps {
  report: string;
  url: string;
  loading: boolean;
}

export function ReportView({ report, url, loading }: ReportViewProps) {
  const html = report ? marked(report) as string : '';

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
  }

  if (!report && !loading) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">审查目标: {url}</span>
        <div className="flex gap-2">
          {loading && <span className="text-sm text-blue-400 animate-pulse">生成中...</span>}
          {report && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy}>复制</Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>下载 .md</Button>
            </>
          )}
        </div>
      </div>
      <div
        className="prose prose-invert prose-sm max-w-none bg-gray-900/50 border border-gray-800 rounded-lg p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
