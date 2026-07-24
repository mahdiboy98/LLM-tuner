export interface Preset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  topK: number;
  minP: number;
  repeatPenalty: number;
  numCtx: number;
  numGpu: number;
}

export const PRESETS: Preset[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Default, versatile settings for general everyday use.',
    systemPrompt: 'You are a helpful, harmless, and honest AI assistant.',
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    minP: 0.05,
    repeatPenalty: 1.15,
    numCtx: 4096,
    numGpu: 99,
  },
  {
    id: 'strict-coder',
    name: 'Strict Coder',
    description: 'Highly precise, minimal hallucination. Best for programming and math.',
    systemPrompt: 'You are an expert software engineer. Provide clean, efficient, and well-commented code. Explain your reasoning briefly before providing the solution. Do not hallucinate APIs or libraries.',
    temperature: 0.2,
    topP: 0.9,
    topK: 40,
    minP: 0.05,
    repeatPenalty: 1.2,
    numCtx: 8192,
    numGpu: 99,
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Higher randomness for brainstorming, storytelling, and creative tasks.',
    systemPrompt: 'You are a creative and imaginative writer. Use vivid language, explore unique ideas, and think outside the box. Avoid generic or cliché responses.',
    temperature: 1.2,
    topP: 0.95,
    topK: 50,
    minP: 0.1,
    repeatPenalty: 1.1,
    numCtx: 4096,
    numGpu: 99,
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    description: 'Optimized for reading long texts and extracting key points concisely.',
    systemPrompt: 'You are an expert summarizer. Read the provided text and output a concise, structured summary highlighting the most critical points. Avoid unnecessary fluff or repetition.',
    temperature: 0.3,
    topP: 0.9,
    topK: 30,
    minP: 0.05,
    repeatPenalty: 1.15,
    numCtx: 16384,
    numGpu: 99,
  }
];