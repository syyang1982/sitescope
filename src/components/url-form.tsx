'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT, type Lang } from '@/lib/i18n';

interface ProgressItem {
  name: string;
  status: 'pending' | 'running' | 'done';
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  descriptionEn: string;
  badge?: string;
  badgeEn?: string;
}

interface UrlFormProps {
  onReport: (report: string, url: string) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string) => void;
  onProgress?: (progress: ProgressItem[]) => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export function UrlForm({ onReport, onLoading, onError, onProgress, lang, onLangChange }: UrlFormProps) {
  const t = useT(lang);
  const [url, setUrl] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState('mimo-v2.5-pro');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  // BYOK state
  const [useByok, setUseByok] = useState(false);
  const [byokEndpoint, setByokEndpoint] = useState('');
  const [byokModel, setByokModel] = useState('');
  const [byokApiKey, setByokApiKey] = useState('');
  const [showByokKey, setShowByokKey] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const passcodeInputRef = useRef<HTMLInputElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available models on mount
  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then((data: ModelOption[]) => {
        setModels(data);
        // Default to first model if current selection not available
        if (data.length > 0 && !data.find(m => m.id === selectedModel)) {
          setSelectedModel(data[0].id);
        }
      })
      .catch(() => {
        // Fallback: at least show the default model
        setModels([{
          id: 'mimo-v2.5-pro',
          name: 'MiMo v2.5 Pro',
          provider: 'Xiaomi',
          description: '默认模型',
          descriptionEn: 'Default model',
        }]);
      });
  }, []);

  // Close model dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updateProgress = useCallback((items: ProgressItem[]) => {
    setProgressItems(items);
    onProgress?.(items);
  }, [onProgress]);

  const startScan = useCallback(async (urlToScan: string, token: string) => {
    onError('');
    onLoading(true);
    setScanning(true);

    const initialProgress: ProgressItem[] = [
      { name: t('fetchHomepage'), status: 'running' },
      { name: t('fetchRobots'), status: 'pending' },
      { name: t('fetchSitemap'), status: 'pending' },
      { name: t('fetchSubpages'), status: 'pending' },
      { name: t('securityReview'), status: 'pending' },
      { name: t('frontendReview'), status: 'pending' },
      { name: t('seoReview'), status: 'pending' },
      { name: t('complianceReview'), status: 'pending' },
      { name: t('crossAnalysis'), status: 'pending' },
    ];
    updateProgress(initialProgress);

    abortRef.current = new AbortController();

    try {
      const payload: Record<string, string> = { url: urlToScan, token, lang };
      if (useByok) {
        payload.endpoint = byokEndpoint;
        payload.apiKey = byokApiKey;
        payload.customModel = byokModel;
      } else {
        payload.model = selectedModel;
      }

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: '请求失败' }));
        if (res.status === 401) {
          setPasscodeError(data.error || (lang === 'zh' ? '口令无效，请检查后重试' : 'Invalid access code, please try again'));
          setScanning(false);
          onLoading(false);
          return;
        }
        if (res.status === 429) {
          setPasscodeError(data.error || (lang === 'zh' ? '请求过于频繁，请稍后再试' : 'Too many requests, please try again later'));
          setScanning(false);
          onLoading(false);
          return;
        }
        onError(data.error || '请求失败');
        setScanning(false);
        onLoading(false);
        return;
      }

      // Read response — try streaming first, fallback to full text
      let fullText = '';

      if (res.body) {
        try {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            onReport(fullText, urlToScan);
            updateProgressFromReport(fullText, initialProgress, updateProgress);
          }
          fullText += decoder.decode();
        } catch {
          // Stream reading failed, try reading as full text
          fullText = await res.text();
          onReport(fullText, urlToScan);
        }
      } else {
        // No body stream — read as full text
        fullText = await res.text();
        onReport(fullText, urlToScan);
      }

      // 全部完成
      updateProgress(initialProgress.map(item => ({ ...item, status: 'done' as const })));

      // Final report update
      onReport(fullText, urlToScan);

      // 延迟关闭弹窗，让用户看到完成状态
      setTimeout(() => {
        setShowPasscode(false);
        setScanning(false);
        onLoading(false);
      }, 1500);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onError(err instanceof Error ? err.message : '未知错误');
      setShowPasscode(false);
      setScanning(false);
      onLoading(false);
    }
  }, [onReport, onLoading, onError, updateProgress, selectedModel, useByok, byokEndpoint, byokApiKey, byokModel, lang, t]);

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
      setPasscodeError(t('passcodeRequired'));
      return;
    }
    startScan(url, passcode.trim());
  }

  function handleCancel() {
    setShowPasscode(false);
    setPasscode('');
    setPasscodeError('');
    setShowPassword(false);
    setScanning(false);
  }

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  // BYOK validation
  const byokValid = useByok
    ? byokEndpoint.trim() && byokModel.trim() && byokApiKey.trim()
    : true;

  return (
    <>
      <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
        {/* URL input row */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={t('urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-base pl-4 pr-10 input-dark"
              required
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Button type="submit" className="h-12 px-6 gap-2 shrink-0 btn-primary" disabled={!byokValid}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t('startAudit')}
          </Button>
        </div>

        {/* Model & language row */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 shrink-0">{t('aiModel')}:</span>
            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600 transition-colors"
              >
                {useByok ? (
                  <span className="text-white">{byokModel || t('customModel')}</span>
                ) : (
                  <>
                    <span className="text-white">{selectedModelInfo?.name || selectedModel}</span>
                    {selectedModelInfo?.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
                        {lang === 'en' ? (selectedModelInfo.badgeEn || selectedModelInfo.badge) : selectedModelInfo.badge}
                      </span>
                    )}
                  </>
                )}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showModelDropdown && models.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-2 border-b border-gray-800">
                    <p className="text-xs text-gray-400 px-2">{t('selectModel')}</p>
                  </div>
                  <div className="p-1 max-h-64 overflow-y-auto">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id);
                          setUseByok(false);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                          !useByok && model.id === selectedModel
                            ? 'bg-blue-500/10 border border-blue-500/30'
                            : 'hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                          <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{model.name}</span>
                            <span className="text-[10px] text-gray-500">{model.provider}</span>
                            {model.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded ml-auto">
                                {lang === 'en' ? (model.badgeEn || model.badge) : model.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {lang === 'en' ? (model.descriptionEn || model.description) : model.description}
                          </p>
                        </div>
                        {!useByok && model.id === selectedModel && (
                          <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                    {/* BYOK divider */}
                    <div className="border-t border-gray-800 mx-2 my-1" />
                    {/* BYOK option */}
                    <button
                      type="button"
                      onClick={() => {
                        setUseByok(true);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                        useByok
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span className="text-sm font-medium text-purple-400">{t('customModel')}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{t('customModelDesc')}</p>
                      </div>
                      {useByok && (
                        <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          {/* Language toggle — right next to model selector */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg border border-gray-700 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                lang === 'en'
                  ? 'bg-blue-500/20 text-blue-400 font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLangChange('zh')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                lang === 'zh'
                  ? 'bg-blue-500/20 text-blue-400 font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* BYOK config area */}
        {useByok && (
            <div className="w-full max-w-lg bg-gray-900/80 border border-gray-700 rounded-xl p-4 space-y-3 mt-1">
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('customApiConfig')}
              </div>

              <Input
                type="url"
                placeholder={t('apiEndpointPlaceholder')}
                value={byokEndpoint}
                onChange={(e) => setByokEndpoint(e.target.value)}
                className="h-10 text-sm input-dark"
              />

              <Input
                type="text"
                placeholder={t('modelNamePlaceholder')}
                value={byokModel}
                onChange={(e) => setByokModel(e.target.value)}
                className="h-10 text-sm input-dark"
              />

              <div className="relative">
                <Input
                  type={showByokKey ? 'text' : 'password'}
                  placeholder={t('apiKeyPlaceholder')}
                  value={byokApiKey}
                  onChange={(e) => setByokApiKey(e.target.value)}
                  className="h-10 text-sm pr-10 input-dark"
                />
                <button
                  type="button"
                  onClick={() => setShowByokKey(!showByokKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label={showByokKey ? t('hideKey') : t('showKey')}
                >
                  {showByokKey ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg p-2.5">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>
                  <strong className="text-gray-300">{t('privacyPromise')}:</strong> {t('privacyNotice')}
                </span>
              </div>
            </div>
          )}
        {/* URL hint */}
        <p className="text-xs text-gray-500 mt-1">{t('urlHint')}</p>
      </form>

      {showPasscode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl">
            {!scanning ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{t('verifyPasscode')}</h2>
                    <p className="text-sm text-gray-400">{t('enterPasscodeToStart')} <span className="text-white">{url}</span></p>
                  </div>
                </div>

                <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <Input
                      ref={passcodeInputRef}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('passcodePlaceholder')}
                      value={passcode}
                      onChange={(e) => { setPasscode(e.target.value); setPasscodeError(''); }}
                      className="h-12 pr-10 input-dark"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label={showPassword ? t('hideKey') : t('showKey')}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passcodeError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{passcodeError}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 h-11" onClick={handleCancel}>{t('cancel')}</Button>
                    <Button type="submit" className="flex-1 h-11 gap-2 btn-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('confirm')}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-400">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div>
                    <span className="font-medium">{t('auditing')}</span>
                    <p className="text-xs text-gray-400">{t('auditingHint')}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {progressItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm py-1">
                      {item.status === 'done' ? (
                        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : item.status === 'running' ? (
                        <svg className="animate-spin w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full flex-shrink-0" />
                      )}
                      <span className={
                        item.status === 'done' ? 'text-green-400' :
                        item.status === 'running' ? 'text-blue-400 font-medium' :
                        'text-gray-500'
                      }>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500 text-center">
                  {t('progressHint')}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    abortRef.current?.abort();
                    handleCancel();
                  }}
                >
                  {t('cancelAudit')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function updateProgressFromReport(
  report: string,
  progress: ProgressItem[],
  update: (items: ProgressItem[]) => void
) {
  const updated = [...progress];

  // 获取网站主页 + robots.txt + sitemap.xml → 报告头部出现即完成
  if (report.includes('目标 URL') || report.includes('技术栈') || report.includes('审查日期')) {
    updated[0] = { ...updated[0], status: 'done' };
    updated[1] = { ...updated[1], status: 'done' };
    updated[2] = { ...updated[2], status: 'done' };
  }

  // 子页面
  if (report.includes('子页面') || report.includes('robots.txt') || report.includes('robots.')) {
    updated[3] = { ...updated[3], status: 'done' };
  }

  // 安全审查 — 出现严重程度标记即完成
  if (report.includes('🔴') || report.includes('🟠') || report.includes('⚪') || report.includes('安全头')) {
    updated[4] = { ...updated[4], status: 'done' };
  }

  // 前端设计审查
  if (report.includes('前端') || report.includes('Meta') || report.includes('无障碍') || report.includes('OG') || report.includes('viewport')) {
    updated[5] = { ...updated[5], status: 'done' };
  }

  // SEO 审查
  if (report.includes('SEO') || report.includes('sitemap') || report.includes('索引') || report.includes('canonical')) {
    updated[6] = { ...updated[6], status: 'done' };
  }

  // 法务合规审查
  if (report.includes('隐私') || report.includes('合规') || report.includes('Cookie') || report.includes('GDPR') || report.includes('条款')) {
    updated[7] = { ...updated[7], status: 'done' };
  }

  // 关联分析
  if (report.includes('关联') || report.includes('交叉') || report.includes('矛盾') || report.includes('优先修复')) {
    updated[8] = { ...updated[8], status: 'done' };
  }

  // 设置下一个运行中的项目
  const nextRunning = updated.findIndex(item => item.status === 'pending');
  if (nextRunning !== -1) {
    updated[nextRunning] = { ...updated[nextRunning], status: 'running' };
  }

  update(updated);
}
