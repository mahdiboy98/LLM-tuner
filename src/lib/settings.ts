export interface AppSettings {
  ollamaUrl: string;
  defaultTemperature: number;
  defaultTopP: number;
  defaultTopK: number;
  defaultMinP: number;
  defaultRepeatPenalty: number;
  defaultNumCtx: number;
  defaultNumGpu: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  ollamaUrl: 'http://127.0.0.1:11434',
  defaultTemperature: 0.7,
  defaultTopP: 0.9,
  defaultTopK: 40,
  defaultMinP: 0.05,
  defaultRepeatPenalty: 1.15,
  defaultNumCtx: 4096,
  defaultNumGpu: 99,
};

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem('llm-tuner-settings');
    if (!stored) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('llm-tuner-settings', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}