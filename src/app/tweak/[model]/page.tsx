'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createModel } from '@/lib/ollama';

export default function TweakPage({ params }: { params: { model: string } }) {
  const router = useRouter();
  const baseModelName = decodeURIComponent(params.model);

  // State for Tweak Parameters
  const [customName, setCustomName] = useState(`${baseModelName.split(':')[0]}-custom`);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [repeatPenalty, setRepeatPenalty] = useState(1.15);
  const [numCtx, setNumCtx] = useState(4096);
  const [numGpu, setNumGpu] = useState(99);
  const [numPredict, setNumPredict] = useState(-1);

  // State for UI Feedback
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Live Modelfile Generator
  const generateModelfile = () => {
    let mf = `FROM ${baseModelName}\n\n`;
    
    if (systemPrompt.trim()) {
      mf += `SYSTEM """${systemPrompt.trim()}"""\n\n`;
    }
    
    mf += `PARAMETER temperature ${temperature}\n`;
    mf += `PARAMETER top_p ${topP}\n`;
    mf += `PARAMETER repeat_penalty ${repeatPenalty}\n`;
    mf += `PARAMETER num_ctx ${numCtx}\n`;
    mf += `PARAMETER num_predict ${numPredict}\n`;
    mf += `PARAMETER num_gpu ${numGpu}`;
    
    return mf;
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setSuccess(false);

    try {
      const modelfileContent = generateModelfile();
      const successStatus = await createModel(customName, modelfileContent);

      if (successStatus) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/models');
        }, 1500);
      } else {
        setError('Failed to create model. Is Ollama running?');
      }
    } catch (err) {
      setError('An unexpected error occurred. Check your console.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">
          Tweaking: <span className="text-sky-400">{baseModelName}</span>
        </h1>
        <p className="text-slate-400">
          Adjust parameters below. The Modelfile on the right updates in real-time.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 text-green-200 rounded-lg">
          Custom model "{customName}" created successfully! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Controls */}
        <div className="space-y-6">
          
          {/* Identity */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">1. Identity</h3>
            <label className="block text-sm font-medium text-slate-300 mb-2">Custom Model Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              placeholder="e.g., my-coder-model"
            />
          </div>

          {/* System Prompt */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">2. System Prompt</h3>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
              placeholder="You are an expert coding assistant..."
            />
          </div>

          {/* Generation Settings */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">3. Generation Settings</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Temperature</label>
                <span className="text-sm text-sky-400 font-mono">{temperature}</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-sky-500" />
              <p className="text-xs text-slate-500 mt-1">Lower = precise, Higher = creative</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Top P</label>
                <span className="text-sm text-sky-400 font-mono">{topP}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-sky-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Repeat Penalty</label>
                <span className="text-sm text-sky-400 font-mono">{repeatPenalty}</span>
              </div>
              <input type="range" min="1" max="2" step="0.05" value={repeatPenalty} onChange={(e) => setRepeatPenalty(parseFloat(e.target.value))} className="w-full accent-sky-500" />
              <p className="text-xs text-slate-500 mt-1">Prevents infinite loops (1.15 recommended)</p>
            </div>
          </div>

          {/* Hardware Settings */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">4. Hardware & Context</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Context Window (num_ctx)</label>
              <div className="flex gap-2 mb-2">
                {[2048, 4096, 8192, 16384].map((val) => (
                  <button
                    key={val}
                    onClick={() => setNumCtx(val)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      numCtx === val 
                        ? 'bg-sky-500 border-sky-500 text-white' 
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={numCtx}
                onChange={(e) => setNumCtx(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">GPU Layers (num_gpu)</label>
                <span className="text-sm text-sky-400 font-mono">{numGpu === 99 ? 'Auto/Max' : numGpu}</span>
              </div>
              <input type="range" min="0" max="99" step="1" value={numGpu === 99 ? 99 : numGpu} onChange={(e) => setNumGpu(parseInt(e.target.value))} className="w-full accent-sky-500" />
            </div>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isDeploying || !customName}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-sky-900/20"
          >
            {isDeploying ? 'Deploying Custom Model...' : 'Deploy Custom Model'}
          </button>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">Live Modelfile Preview</span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Read-only</span>
            </div>
            <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto custom-scrollbar leading-relaxed">
              {generateModelfile()}
            </pre>
          </div>
          
          <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <p className="text-sm text-slate-400">
              <span className="text-sky-400 font-semibold">Pro Tip:</span> This configuration will only take up ~1 KB of storage. The heavy model weights are shared with the base model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}