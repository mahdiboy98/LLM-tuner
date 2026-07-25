'use client';

import { useState, useEffect } from 'react';
import { OllamaModel } from '@/lib/types';
import TweakModal from '@/components/TweakModal';
import { listModels, deleteModel } from '@/lib/ollama';
import ImportModal from '@/components/ImportModal';
import { toast } from '@/lib/toast';
import { getSettings } from '@/lib/settings';
import { FilePlus, SlidersHorizontal, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tweakingModel, setTweakingModel] = useState<string | null>(null);
  const [newlyCreatedModel, setNewlyCreatedModel] = useState<string | null>(null);
  const [deletingModel, setDeletingModel] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setError(null);
      const modelsData = await listModels();
      setModels(modelsData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError('Cannot connect to Ollama. Make sure it is running and accessible.');
      setLoading(false);
    }
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
    const isConfirmed = window.confirm(`Are you sure you want to delete "${modelName}"?\n\nThis cannot be undone.`);
    if (!isConfirmed) return;

    setDeletingModel(modelName);
    
    // Check if Ollama is running first
    try {
      const settings = getSettings();
      const healthCheck = await fetch(`${settings.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!healthCheck.ok) {
        toast.error('Ollama Not Running', 'Please start Ollama and try again.');
        setDeletingModel(null);
        return;
      }
    } catch {
      toast.error('Cannot Connect to Ollama', 'Server is not responding.');
      setDeletingModel(null);
      return;
    }
    
    const success = await deleteModel(modelName);
    
    if (success) {
      fetchModels();
      toast.success('Model Deleted', `"${modelName}" has been removed.`);
    } else {
      toast.error('Deletion Failed', `Could not delete "${modelName}". It may be in use.`);
    }
    setDeletingModel(null);
  };

    if (loading) {
    return (
      <div>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="ml-auto h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

    if (error) {
    return (
      <div>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Local Models</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and optimize your installed LLMs.</p>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Cannot Connect to Ollama
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchModels();
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

    // Custom fallback for when models fail to load
  const ModelsErrorFallback = () => (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Local Models</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and optimize your installed LLMs.</p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Cannot Connect to Ollama
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Make sure Ollama is running and accessible at your configured URL.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <PageTransition>
    <div className="relative">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Local Models</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and optimize your installed LLMs.</p>
              </div>
                            <button 
                onClick={() => setShowImportModal(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-sky-500/20"
              >
                <FilePlus className="w-4 h-4" /> Import GGUF
              </button>
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
                    <motion.tbody 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="divide-y divide-slate-200 dark:divide-slate-800"
          >
            {models.map((model) => {
              const isNew = newlyCreatedModel === model.name;
              const likelyCustom = isLikelyCustom(model.name);
              
              return (
                                <motion.tr 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isNew ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}`}
                >
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
                        className="bg-slate-900 dark:bg-slate-700 hover:bg-sky-500 dark:hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                        <SlidersHorizontal className="w-4 h-4" /> Configure
                        </button>
                        <button 
                        onClick={() => handleDelete(model.name)}
                        disabled={deletingModel === model.name}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                        {deletingModel === model.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deletingModel === model.name ? '...' : 'Delete'}
                        </button>
                    </div>
                    </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {tweakingModel && (
        <TweakModal modelName={tweakingModel} onClose={handleModalClose} />
      )}

      {showImportModal && (
    <ImportModal 
      onClose={() => setShowImportModal(false)} 
      onImportSuccess={() => {
        setShowImportModal(false);
        fetchModels(); // Refresh the list
      }} 
    />
  )}
    </div>
 </PageTransition>
  );
}