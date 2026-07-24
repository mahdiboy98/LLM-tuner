// Handles all communication with Ollama's REST API

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://127.0.0.1:11434';

export async function listModels(): Promise<any[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

export async function showModel(name: string): Promise<any> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
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

export async function createModel(name: string, modelfile: string): Promise<boolean> {
  try {
    const response = await fetch('/api/create-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name.trim(), 
        modelfile: modelfile.trim() 
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
    const response = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
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
