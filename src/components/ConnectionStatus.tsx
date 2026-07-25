'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from '@/lib/toast';
import { getSettings } from '@/lib/settings';

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

        // Show toast only when status CHANGES
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
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
        Checking...
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg mx-2 ${
      connected 
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    }`}>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
      {connected ? 'Ollama Connected' : 'Ollama Offline'}
    </div>
  );
}