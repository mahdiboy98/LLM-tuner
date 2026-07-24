import { listModels } from '@/lib/ollama';

export default async function Dashboard() {
  const models = await listModels();
  const totalSizeGB = models.reduce((acc, model) => acc + model.size, 0) / 1024 / 1024 / 1024;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome to LLM Tuner. Let's optimize your local AI.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">System Status</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">Connected</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Ollama API responding</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Models Installed</h3>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{models.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Total: {totalSizeGB.toFixed(1)} GB</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Custom Configs</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {models.filter(m => m.size < 50 * 1024 * 1024).length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">~1 KB each</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Recent Models</h3>
        <div className="space-y-3">
          {models.slice(0, 5).map((model) => (
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
      </div>
    </div>
  );
}