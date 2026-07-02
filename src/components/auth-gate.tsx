'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthGateProps {
  onAuthenticated: (token: string) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setError('请输入访问口令');
      return;
    }
    onAuthenticated(token.trim());
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SiteScope</CardTitle>
          <CardDescription className="text-gray-400">请输入访问口令以使用审查服务</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="访问口令"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(''); }}
              className="h-12"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="h-12">进入</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
