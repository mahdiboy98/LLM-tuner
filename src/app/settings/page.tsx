'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, AppSettings } from '@/lib/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    if (!settings) return;
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!settings) {
    return <div className="p-8 text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your LLM Tuner preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Connection Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Connection</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ollama URL
            </label>
            <input
              type="text"
              value={settings.ollamaUrl}
              onChange={(e) => handleChange('ollamaUrl', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="http://127.0.0.1:11434"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The URL where your Ollama server is running. Default: http://127.0.0.1:11434
            </p>
          </div>
        </div>

        {/* Default Parameters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Default Parameters</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            These values will be used as starting points when you open the Tweak Modal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={settings.defaultTemperature}
                onChange={(e) => handleChange('defaultTemperature', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Top P
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings.defaultTopP}
                onChange={(e) => handleChange('defaultTopP', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Top K
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={settings.defaultTopK}
                onChange={(e) => handleChange('defaultTopK', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Min P
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.defaultMinP}
                onChange={(e) => handleChange('defaultMinP', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Repeat Penalty
              </label>
              <input
                type="number"
                step="0.05"
                min="1"
                value={settings.defaultRepeatPenalty}
                onChange={(e) => handleChange('defaultRepeatPenalty', parseFloat(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Context Window (num_ctx)
              </label>
              <input
                type="number"
                step="1024"
                min="512"
                value={settings.defaultNumCtx}
                onChange={(e) => handleChange('defaultNumCtx', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                GPU Layers (num_gpu)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={settings.defaultNumGpu}
                onChange={(e) => handleChange('defaultNumGpu', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">About</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p><strong>Version:</strong> 0.1.0 Alpha</p>
            <p><strong>Built with:</strong> Next.js, React, TypeScript, Tailwind CSS</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/mahdiboy98/llm-tuner" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">github.com/mahdiboy98/llm-tuner</a></p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}