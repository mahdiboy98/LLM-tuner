// Defines the shape of our data

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelDetails {
  template: string;
  parameters: string;
  modelfile: string;
  license: string;
}

export interface TweakParameters {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  num_ctx: number;
  num_predict: number;
  num_gpu: number;
  system_prompt: string;
}