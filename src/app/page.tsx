import { listModels } from '@/lib/ollama';
import SystemMonitor from '@/components/SystemMonitor';
import { AlertTriangle } from 'lucide-react';


export default async function Dashboard() {
  let models: any[] = [];
  let ollamaError = false;

  // Safely attempt to fetch models. If Ollama is down, we catch it and don't crash.
  try {
    models = await listModels();
  } catch (err) {
    ollamaError = true;
  }

  const totalSizeGB = models.reduce((acc, model) => acc + (model.size || 0), 0) / 1024 / 1024 / 1024;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome to LLM Tuner. Let's optimize your local AI.</p>
        
      {/* Friendly Warning Banner if Ollama is down */}
        {ollamaError && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">Ollama is currently offline</p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Cannot fetch model data. Please ensure the Ollama application is running in the background.
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">System Status</h3>
          <p className={`text-2xl font-bold ${ollamaError ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            {ollamaError ? 'Disconnected' : 'Connected'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            {ollamaError ? 'Ollama is not responding' : 'Ollama API responding'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Models Installed</h3>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{models.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Total: {totalSizeGB.toFixed(1)} GB</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Custom Configs</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {models.filter((m: any) => m.size < 50 * 1024 * 1024).length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">~1 KB each</p>
        </div>
      </div>

      <div className="mb-8">
        <SystemMonitor />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Recent Models</h3>
        
        {ollamaError ? (
          <p className="text-slate-500 dark:text-slate-400 italic">Model list unavailable while Ollama is offline.</p>
        ) : models.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 italic">No models installed yet. Import a GGUF or pull one via Ollama CLI.</p>
        ) : (
          <div className="space-y-3">
            {models.slice(0, 5).map((model: any) => (
              <div
                key={model.name}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{model.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                </div>
                <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full font-medium">
                  {model.details?.parameter_size || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}