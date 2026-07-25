'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';
import { getSettings } from '@/lib/settings';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function ConnectionStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const prevConnected = useRef<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const settings = getSettings();
        const res = await fetch(`${settings.ollamaUrl}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });
        const isUp = res.ok;

        if (prevConnected.current !== null && prevConnected.current !== isUp) {
          if (isUp) {
            toast.success('Ollama Connected', 'Server is back online.');
          } else {
            toast.error('Ollama Disconnected', 'Server is not responding.');
          }
        }

        prevConnected.current = isUp;
        setConnected(isUp);
      } catch {
        if (prevConnected.current !== null && prevConnected.current !== false) {
          toast.error('Ollama Disconnected', 'Server is not responding.');
        }
        prevConnected.current = false;
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (connected === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-medium">Checking...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
      connected 
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
    }`}>
      {connected ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4 animate-pulse" />
      )}
      <span>{connected ? 'Ollama Connected' : 'Ollama Offline'}</span>
    </div>
  );
}