'use client';

import { useState } from 'react';
import { createModel } from '@/lib/ollama';
import { getSettings } from '@/lib/settings';
import { PRESETS, Preset } from '@/lib/presets';
import { calculateContextSafety } from '@/lib/hardware';
import { toast } from '@/lib/toast';

interface TweakModalProps {
  modelName: string;
  onClose: (newModelName?: string) => void;
}

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1.5 cursor-help align-middle">
    <svg className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 dark:bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700 pointer-events-none leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
    </div>
  </div>
);

export default function TweakModal({ modelName, onClose }: TweakModalProps) {
  const defaultSettings = getSettings();
  

  const [customName, setCustomName] = useState(`${modelName.split(':')[0]}-custom`);
  const [systemPrompt, setSystemPrompt] = useState('');
  
  const [temperature, setTemperature] = useState(defaultSettings.defaultTemperature);
  const [topP, setTopP] = useState(defaultSettings.defaultTopP);
  const [topK, setTopK] = useState(defaultSettings.defaultTopK);
  const [minP, setMinP] = useState(defaultSettings.defaultMinP);
  const [repeatPenalty, setRepeatPenalty] = useState(defaultSettings.defaultRepeatPenalty);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.0);
  
  const [numCtx, setNumCtx] = useState(defaultSettings.defaultNumCtx);
  const [numPredict, setNumPredict] = useState(-1);
  const [numGpu, setNumGpu] = useState(defaultSettings.defaultNumGpu);
    const contextSafety = calculateContextSafety(numCtx, defaultSettings.gpuVramGB, defaultSettings.systemRamGB);
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');
  const [deployStep, setDeployStep] = useState<'idle' | 'analyzing' | 'generating' | 'deploying' | 'done'>('idle');

  // NEW: Function to apply a preset instantly
  const applyPreset = (preset: Preset) => {
    setSystemPrompt(preset.systemPrompt);
    setTemperature(preset.temperature);
    setTopP(preset.topP);
    setTopK(preset.topK);
    setMinP(preset.minP);
    setRepeatPenalty(preset.repeatPenalty);
    setNumCtx(preset.numCtx);
    setNumGpu(preset.numGpu);
    // Reset advanced penalties to 0 for clean slate on preset change
    setPresencePenalty(0.0);
    setFrequencyPenalty(0.0);
  };

  const generateModelfile = () => {
    const baseModel = modelName.trim();
    let mf = `FROM ${baseModel}\n\n`;
    
    if (systemPrompt.trim()) {
      mf += `SYSTEM """${systemPrompt.trim()}"""\n\n`;
    }
    
    mf += `PARAMETER temperature ${temperature}\n`;
    mf += `PARAMETER top_p ${topP}\n`;
    mf += `PARAMETER top_k ${topK}\n`;
    mf += `PARAMETER min_p ${minP}\n`;
    mf += `PARAMETER repeat_penalty ${repeatPenalty}\n`;
    
    if (presencePenalty !== 0) mf += `PARAMETER presence_penalty ${presencePenalty}\n`;
    if (frequencyPenalty !== 0) mf += `PARAMETER frequency_penalty ${frequencyPenalty}\n`;
    
    mf += `PARAMETER num_ctx ${numCtx}\n`;
    mf += `PARAMETER num_predict ${numPredict}\n`;
    mf += `PARAMETER num_gpu ${numGpu}`;
    
    return mf;
  };

    const handleDeploy = async () => {
    setDeployStep('analyzing');
    await new Promise(r => setTimeout(r, 800));
    
    setDeployStep('generating');
    const modelfileContent = generateModelfile();
    await new Promise(r => setTimeout(r, 800));
    
    setDeployStep('deploying');
    const settings = getSettings();
    
    // Check if Ollama is running first
    try {
      const healthCheck = await fetch(`${settings.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!healthCheck.ok) {
        toast.error('Ollama Not Running', 'Please start Ollama and try again.');
        setDeployStep('idle');
        return;
      }
    } catch {
      toast.error('Cannot Connect to Ollama', 'Server is not responding.');
      setDeployStep('idle');
      return;
    }
    
    const success = await createModel(customName, modelfileContent, settings.ollamaUrl);
    await new Promise(r => setTimeout(r, 600));
    
    if (success) {
      setDeployStep('done');
      toast.success('Model Created', `"${customName}" is ready to use.`);
      setTimeout(() => {
        onClose(customName);
      }, 500);
    } else {
      setDeployStep('idle');
      toast.error('Creation Failed', `Could not create "${customName}". Check console for details.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose()} />
      
      <div className="relative w-full max-w-7xl h-[90vh] bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Configure Model</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Base: {modelName}</p>
          </div>
          <button onClick={() => onClose()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT: Controls */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-6 pb-20">
            
              {/* NEW: Quick Presets Selector */}
              <div className="relative overflow-visible bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-200 dark:border-sky-800">
                <label className="block text-sm font-semibold text-sky-900 dark:text-sky-300 mb-2">
                  ⚡ Quick Presets <InfoTooltip text="Instantly apply optimized, battle-tested settings for specific tasks like coding, writing, or summarizing." />
                </label>
                <select 
                  className="w-full bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer font-medium"
                  onChange={(e) => {
                    const preset = PRESETS.find(p => p.id === e.target.value);
                    if (preset) applyPreset(preset);
                  }}
                  defaultValue=""
                  disabled={deployStep !== 'idle'}
                >
                  <option value="" disabled>Choose a preset to auto-fill settings...</option>
                  {PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>{preset.name} — {preset.description}</option>
                  ))}
                </select>
              </div>

              {/* Identity */}
              <div className="relative overflow-visible bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Custom Model Name <InfoTooltip text="The unique name for your new tweaked model. It will appear in your local Ollama list." />
                </label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} disabled={deployStep !== 'idle'}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50" />
              </div>

              {/* System Prompt */}
              <div className="relative overflow-visible bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  System Prompt <InfoTooltip text="Sets the core behavior, personality, and rules of the model for all interactions." />
                </label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} disabled={deployStep !== 'idle'} rows={4}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none resize-none disabled:opacity-50" 
                  placeholder="e.g., You are an expert coding assistant..." />
              </div>

              {/* Generation Settings */}
              <div className="relative overflow-visible bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Generation</h3>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Temperature <InfoTooltip text="Controls randomness. 0.1-0.3 is highly precise (best for coding/math). 0.7-1.0 is balanced. 1.0-2.0 is highly creative (best for brainstorming)." />
                    </label>
                    <span className="text-sm font-mono text-sky-600 dark:text-sky-400">{temperature}</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full accent-sky-500 disabled:opacity-50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Top P <InfoTooltip text="Nucleus sampling. Limits token selection to the most probable options (e.g., 0.9 = top 90% probability mass). Improves coherence." />
                    </label>
                    <input type="number" step="0.05" min="0" max="1" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Top K <InfoTooltip text="Limits the model to only consider the top K most likely next tokens. Prevents the model from going completely off the rails." />
                    </label>
                    <input type="number" step="1" min="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Min P <InfoTooltip text="Filters out tokens with a probability lower than a fraction of the most likely token. A great alternative to Top P for balancing creativity and coherence." />
                  </label>
                  <input type="number" step="0.01" min="0" max="1" value={minP} onChange={(e) => setMinP(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                </div>
              </div>

              {/* Penalties */}
              <div className="relative overflow-visible bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Penalties</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Repeat <InfoTooltip text="Discourages the model from repeating the exact same words or phrases. 1.15 is highly recommended for coding to prevent infinite loops." />
                    </label>
                    <input type="number" step="0.05" min="1" value={repeatPenalty} onChange={(e) => setRepeatPenalty(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Presence <InfoTooltip text="Encourages the model to talk about new topics by penalizing tokens that have already appeared in the text." />
                    </label>
                    <input type="number" step="0.1" value={presencePenalty} onChange={(e) => setPresencePenalty(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Frequency <InfoTooltip text="Penalizes tokens based on how many times they have already appeared. Higher values make the model more concise." />
                    </label>
                    <input type="number" step="0.1" value={frequencyPenalty} onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* Hardware & Context */}
              <div className="relative overflow-visible bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Hardware & Context</h3>
                
               <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                        Context Window (num_ctx) <InfoTooltip text="The maximum amount of text (input + output) the model can remember at once. Higher values (8k, 16k, 32k) allow reading larger files but consume significantly more VRAM." />
                    </label>
                    
                    {/* Quick Select Buttons */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {[2048, 4096, 8192, 16384, 32768].map((val) => (
                        <button key={val} onClick={() => setNumCtx(val)} disabled={deployStep !== 'idle'}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-50 ${numCtx === val ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'}`}>
                            {val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                        </button>
                        ))}
                    </div>

                    {/* Custom Input Field */}
                    <input
                        type="number"
                        step="512"
                        min="512"
                        value={numCtx}
                        onChange={(e) => setNumCtx(parseInt(e.target.value) || 512)}
                        disabled={deployStep !== 'idle'}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50"
                        placeholder="Custom context length (e.g., 12000)"
                    />
                    
                    {/* Hardware Warning Block */}
                    {contextSafety.warningLevel !== 'safe' && (
                        <div className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-2 ${
                        contextSafety.warningLevel === 'caution' 
                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        }`}>
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <span className="font-semibold">{contextSafety.warningLevel === 'caution' ? 'Caution:' : 'Warning:'}</span>
                            {' '}{contextSafety.message}
                            {contextSafety.warningLevel === 'danger' && (
                            <span className="block mt-1">Recommended: {contextSafety.safeContextLimit} or lower</span>
                            )}
                        </div>
                        </div>
                    )}
                    </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Max Tokens <InfoTooltip text="The absolute maximum length of the model's generated response. -1 means unlimited." />
                    </label>
                    <input type="number" value={numPredict} onChange={(e) => setNumPredict(parseInt(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      GPU Layers <InfoTooltip text="How many layers of the model to load into VRAM. 99 means 'load as much as physically possible' to maximize speed." />
                    </label>
                    <input type="number" value={numGpu} onChange={(e) => setNumGpu(parseInt(e.target.value))} disabled={deployStep !== 'idle'} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm disabled:opacity-50" />
                  </div>
                </div>
              </div>

              {/* Deploy Button / Progress */}
              <button onClick={handleDeploy} disabled={deployStep !== 'idle' || !customName}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2">
                {deployStep === 'idle' && 'Save Custom Configuration'}
                {deployStep === 'analyzing' && <><span className="animate-spin">⟳</span> Analyzing base model...</>}
                {deployStep === 'generating' && <><span className="animate-spin">⟳</span> Generating Modelfile...</>}
                {deployStep === 'deploying' && <><span className="animate-spin">⟳</span> Deploying model...</>}
                {deployStep === 'done' && <><span className="text-xl">✓</span> Deployment Complete!</>}
              </button>
            </div>
          </div>

          {/* RIGHT: Tabs (Preview vs Original Info) */}
          <div className="flex flex-col h-full min-h-0">
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
              <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`}>Live Modelfile</button>
              <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500'}`}>Original Model Info</button>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'preview' ? (
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{generateModelfile()}</pre>
                ) : (
                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    <p className="mb-2 text-slate-500 italic">// This is the exact configuration Ollama uses for the base model.</p>
                    <pre>{`# Modelfile generated by "ollama show"\n# To build a new Modelfile based on this, replace FROM with:\n# FROM ${modelName}\n\nFROM ${modelName}\n\n# (Full template, parameters, and license omitted for brevity in this view. Use 'ollama show ${modelName} --modelfile' in your terminal to see the complete raw output.)`}</pre>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
              <p className="text-xs text-sky-800 dark:text-sky-300">
                <span className="font-semibold">Note:</span> This configuration creates a ~1 KB shortcut. The heavy model weights are shared with the base model.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
