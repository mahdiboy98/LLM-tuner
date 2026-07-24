'use client';

import { useState } from 'react';
import { getSettings } from '@/lib/settings';

interface ImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export default function ImportModal({ onClose, onImportSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deleteOriginal, setDeleteOriginal] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  // Advanced settings state (simplified for import)
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [numCtx, setNumCtx] = useState(4096);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-fill model name from filename (remove .gguf extension)
      setModelName(selectedFile.name.replace(/\.gguf$/i, '').toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const generateModelfile = () => {
    if (!file) return '';
    let mf = `FROM ./${file.name}\n\n`; // Points to the uploaded file
    if (systemPrompt.trim()) mf += `SYSTEM """${systemPrompt.trim()}"""\n\n`;
    mf += `PARAMETER temperature ${temperature}\n`;
    mf += `PARAMETER num_ctx ${numCtx}\n`;
    return mf;
  };

  const handleImport = async () => {
    if (!file || !modelName) return;
    setIsImporting(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelName', modelName);
    formData.append('modelfile', showAdvanced ? generateModelfile() : '');
    formData.append('deleteOriginal', deleteOriginal.toString());

    try {
      const response = await fetch('/api/import-gguf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      onImportSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isImporting && onClose()} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Import GGUF Model</h2>
          <button onClick={() => !isImporting && onClose()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input type="file" accept=".gguf" onChange={handleFileChange} className="hidden" id="gguf-upload" disabled={isImporting} />
            <label htmlFor="gguf-upload" className="cursor-pointer block">
              {file ? (
                <div className="text-sky-600 dark:text-sky-400 font-semibold">
                  📄 {file.name} ({(file.size / 1024 / 1024 / 1024).toFixed(2)} GB)
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Drag & drop your .gguf file here</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse</p>
                </div>
              )}
            </label>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={isImporting}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50"
              placeholder="my-custom-model"
            />
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isImporting}
            className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Tweak Settings (Optional)
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Tip: It's often best to import "as-is" and use the Tweak feature later. But you can set base parameters here.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">System Prompt</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={2} disabled={isImporting}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature</label>
                  <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} disabled={isImporting}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Context (num_ctx)</label>
                  <input type="number" step="1024" value={numCtx} onChange={(e) => setNumCtx(parseInt(e.target.value))} disabled={isImporting}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm disabled:opacity-50" />
                </div>
              </div>
            </div>
          )}

          {/* Delete Original Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={deleteOriginal} onChange={(e) => setDeleteOriginal(e.target.checked)} disabled={isImporting}
              className="mt-1 w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Delete original GGUF file after import.</span>
              <br />
              <span className="text-xs text-slate-500 dark:text-slate-400">Ollama will manage the model internally. This frees up disk space immediately.</span>
            </span>
          </label>

          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">{error}</div>}

          <button
            onClick={handleImport}
            disabled={!file || !modelName || isImporting}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <><span className="animate-spin">⟳</span> Importing & Creating Model...</>
            ) : (
              'Import Model'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}