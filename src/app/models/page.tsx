'use client';

import { useState, useEffect } from 'react';
import { OllamaModel } from '@/lib/types';
import TweakModal from '@/components/TweakModal';
import { listModels, deleteModel } from '@/lib/ollama';

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tweakingModel, setTweakingModel] = useState<string | null>(null);
  const [newlyCreatedModel, setNewlyCreatedModel] = useState<string | null>(null);
  const [deletingModel, setDeletingModel] = useState<string | null>(null);

  const fetchModels = async () => {
    const modelsData = await listModels();
    setModels(modelsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const formatSize = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Best-effort heuristic: check for common custom naming conventions
  const isLikelyCustom = (name: string) => {
    const lowerName = name.toLowerCase();
    return lowerName.includes('custom') || lowerName.includes('tweaked') || lowerName.includes('config');
  };

  const handleModalClose = (newModelName?: string) => {
    setTweakingModel(null);
    if (newModelName) {
      setNewlyCreatedModel(newModelName);
      fetchModels(); 
      setTimeout(() => setNewlyCreatedModel(null), 5000);
    }
  };

  const handleDelete = async (modelName: string) => {
  // Native browser confirmation for safety
  const isConfirmed = window.confirm(`Are you sure you want to delete "${modelName}"?\n\nThis cannot be undone.`);
  if (!isConfirmed) return;

  setDeletingModel(modelName);
  const success = await deleteModel(modelName);
  
  if (success) {
    fetchModels(); // Refresh the list
  } else {
    alert(`Failed to delete ${modelName}. Is Ollama running?`);
  }
  setDeletingModel(null);
};

  if (loading) return <div className="p-8 text-slate-500">Loading models...</div>;

  return (
    <div className="relative">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Local Models</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and optimize your installed LLMs.</p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Model Name</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Parameters</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {models.map((model) => {
              const isNew = newlyCreatedModel === model.name;
              const likelyCustom = isLikelyCustom(model.name);
              
              return (
                <tr key={model.name} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isNew ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{model.name}</span>
                      {isNew && (
                        <span className="animate-pulse text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full font-bold">✨ New</span>
                      )}
                    </div>
                    {likelyCustom && (
                      <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-sky-200 dark:border-sky-800 font-medium">
                        Likely Custom Config
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{formatSize(model.size)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-sm">{model.details?.parameter_size || 'Unknown'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                        onClick={() => setTweakingModel(model.name)}
                        className="bg-slate-900 dark:bg-slate-700 hover:bg-sky-500 dark:hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                        Configure
                        </button>
                        <button 
                        onClick={() => handleDelete(model.name)}
                        disabled={deletingModel === model.name}
                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {deletingModel === model.name ? '...' : 'Delete'}
                        </button>
                    </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tweakingModel && (
        <TweakModal modelName={tweakingModel} onClose={handleModalClose} />
      )}
    </div>
  );
}