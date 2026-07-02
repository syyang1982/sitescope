'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UrlFormProps {
  token: string;
  onReport: (report: string, url: string) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

export function UrlForm({ token, onReport, onLoading, onError }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError('');
    onLoading(true);
    onReport('', '');

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        onError(data.error || '请求失败');
        onLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.slice(2));
                fullText += text;
                onReport(fullText, url);
              } catch {}
            }
          }
        }
      }
      onReport(fullText, url);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onError(err instanceof Error ? err.message : '未知错误');
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      <Input
        type="text"
        placeholder="输入网站 URL，例如 example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 h-12 text-base"
        required
      />
      <Button type="submit" className="h-12 px-8">开始审查</Button>
    </form>
  );
}
