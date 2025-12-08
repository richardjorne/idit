// services/promptService.ts

export interface PromptAuthor {
  userId: string;
  username: string;
}

export interface UserPrompt {
  promptId: string;
  title: string;
  content: string;
  previewImageUrl: string | null;
  isPublic: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timesUsed: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicPrompt {
  promptId: string;
  title: string;
  content: string;
  previewImageUrl: string | null;
  timesUsed: number;
  likesCount: number;
  createdAt: string;
  author: PromptAuthor;
}

export interface UserPromptsResponse {
  userId: string;
  username: string;
  prompts: UserPrompt[];
  totalCount: number;
}

export interface CreatePromptData {
  ownerId: string;
  title: string;
  content: string;
  previewImageUrl?: string;
  isPublic?: boolean;
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  previewImageUrl?: string;
  isPublic?: boolean;
}

// Use environment variable in production, fallback to localhost for development
const API_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:5000';

/**
 * Fetch all prompts for a specific user
 */
export async function fetchUserPrompts(userId: string): Promise<UserPromptsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/user/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch user prompts');
  }

  return data as UserPromptsResponse;
}

/**
 * Fetch all public/approved prompts
 */
export async function fetchPublicPrompts(page: number = 1, limit: number = 20): Promise<{ prompts: PublicPrompt[]; page: number; limit: number }> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/public?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch public prompts');
  }

  return data;
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData: CreatePromptData): Promise<UserPrompt> {
  const res = await fetch(`${API_BASE_URL}/api/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promptData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create prompt');
  }

  return data as UserPrompt;
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(promptId: string, updateData: UpdatePromptData): Promise<UserPrompt> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update prompt');
  }

  return data as UserPrompt;
}

/**
 * Delete a prompt
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/${promptId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete prompt');
  }
}

/**
 * Increment usage count of a prompt
 */
export async function usePrompt(promptId: string): Promise<{ promptId: string; timesUsed: number }> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to use prompt');
  }

  return data;
}

/**
 * Like a prompt
 */
export async function likePrompt(promptId: string): Promise<{ promptId: string; likesCount: number }> {
  const res = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to like prompt');
  }

  return data;
}