
export interface User {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  author: User;
  reward: number;
}

export interface ImageAsset {
  id:string;
  url: string;
  width: number;
  height: number;
  prompt: Prompt;
}

export interface EditSession {
  sessionId: string;
  modelName: string;
  cfgScale: number;
  steps: number;
  sampler: string;
  strength: number;
  seed: number;
  status: 'CREATED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  prompt: string;
  inputImageUrl?: string;
  outputImageUrl?: string;
}
