'use client';

import { useState, useEffect } from 'react';

interface SystemInfo {
  ram: { total: number; used: number; percent: number };
  cpu: { cores: number; model: string; percent: number };
  gpu: { name: string; vramTotal: number; vramUsed: number; percent: number } | null;
}

function ProgressBar({ percent, label, detail, color }: { 
  percent: number; 
  label: string; 
  detail: string;
  color: 'sky' | 'amber' | 'red' | 'emerald';
}) {
  const colorClasses = {
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{detail}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function getColor(percent: number): 'sky' | 'amber' | 'red' | 'emerald' {
  if (percent >= 90) return 'red';
  if (percent >= 70) return 'amber';
  return 'sky';
}

export default function SystemMonitor() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('/api/system-info');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setInfo(data);
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 3000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">System Monitor</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Unable to read system info.</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">System Monitor</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">System Monitor</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="space-y-4">
        <ProgressBar 
          label="System RAM" 
          detail={`${info.ram.used} / ${info.ram.total} GB`}
          percent={info.ram.percent}
          color={getColor(info.ram.percent)}
        />

        <ProgressBar 
          label={`CPU (${info.cpu.cores} cores)`} 
          detail={`${info.cpu.percent}%`}
          percent={info.cpu.percent}
          color={getColor(info.cpu.percent)}
        />

        {info.gpu && (
          <ProgressBar 
            label={`GPU VRAM — ${info.gpu.name}`} 
            detail={`${info.gpu.vramUsed} / ${info.gpu.vramTotal} MB`}
            percent={info.gpu.percent}
            color={getColor(info.gpu.percent)}
          />
        )}

        {!info.gpu && (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
            No NVIDIA GPU detected (requires nvidia-smi)
          </div>
        )}
      </div>
    </div>
  );
}