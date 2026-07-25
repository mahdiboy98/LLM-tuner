// Handles all communication with Ollama's REST API

import { getSettings } from "./settings";
import { OllamaModel, ModelShowResponse } from "./types";

export async function listModels(): Promise<OllamaModel[]> {
  try {
    const settings = getSettings();
    const response = await fetch(`${settings.ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Failed to fetch models from Ollama:', error);
    // CRITICAL: Re-throw the error so the UI can catch it and show the retry screen
    throw error; 
  }
}

export async function showModel(name: string): Promise<ModelShowResponse | null> {
  try {
    const settings = getSettings();
    // FIX: Now uses dynamic settings.ollamaUrl instead of hardcoded env variable
    const response = await fetch(`${settings.ollamaUrl}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to show model');
    return await response.json();
  } catch (error) {
    console.error('Error showing model:', error);
    return null;
  }
}

export async function createModel(name: string, modelfile: string, ollamaUrl?: string): Promise<boolean> {
  try {
    const settings = getSettings();
    const targetUrl = ollamaUrl || settings.ollamaUrl;
    
    const response = await fetch('/api/create-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name.trim(), 
        modelfile: modelfile.trim(),
        ollamaUrl: targetUrl
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Create Model Failed:', data.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Network error creating model:', error);
    return false;
  }
}

export async function deleteModel(name: string): Promise<boolean> {
  try {
    const settings = getSettings();
    // FIX: Now uses dynamic settings.ollamaUrl instead of hardcoded env variable
    const response = await fetch(`${settings.ollamaUrl}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting model:', error);
    return false;
  }
}