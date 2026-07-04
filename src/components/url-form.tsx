'use client';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UrlFormProps {
  onReport: (report: string, url: string) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string) => void;
}

export function UrlForm({ onReport, onLoading, onError }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const passcodeInputRef = useRef<HTMLInputElement>(null);

  const startScan = useCallback(async (urlToScan: string, token: string) => {
    onError('');
    onLoading(true);
    onReport('', '');

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan, token }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setPasscodeError(data.error || '口令无效');
          onLoading(false);
          return;
        }
        onError(data.error || '请求失败');
        onLoading(false);
        return;
      }

      setShowPasscode(false);
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
                onReport(fullText, urlToScan);
              } catch {}
            }
          }
        }
      }
      onReport(fullText, urlToScan);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onError(err instanceof Error ? err.message : '未知错误');
    } finally {
      onLoading(false);
    }
  }, [onReport, onLoading, onError]);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setPasscode('');
    setPasscodeError('');
    setShowPasscode(true);
    setTimeout(() => passcodeInputRef.current?.focus(), 100);
  }

  function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError('请输入访问口令');
      return;
    }
    startScan(url, passcode.trim());
  }

  function handleCancel() {
    setShowPasscode(false);
    setPasscode('');
    setPasscodeError('');
  }

  return (
    <>
      <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
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

      {showPasscode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold mb-1">验证访问口令</h2>
            <p className="text-sm text-gray-400 mb-4">请输入访问口令以开始审查</p>
            <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-3">
              <Input
                ref={passcodeInputRef}
                type="password"
                placeholder="访问口令"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setPasscodeError(''); }}
                className="h-12"
                autoFocus
              />
              {passcodeError && <p className="text-red-400 text-sm">{passcodeError}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={handleCancel}>取消</Button>
                <Button type="submit" className="flex-1 h-11">确认</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
