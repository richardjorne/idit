
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
  id: string;
  url: string;
  width: number;
  height: number;
  prompt: Prompt;
}
