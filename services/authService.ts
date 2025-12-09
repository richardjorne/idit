// services/authService.ts

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

// Use environment variable in production, fallback to localhost for development
const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:5001';

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const res = await fetch(`${AUTH_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Registration failed');
  }

  return data as AuthUser;
}

export async function loginUser(
  usernameOrEmail: string,
  password: string
): Promise<AuthUser> {
  const payload: Record<string, string> = {
    username: usernameOrEmail,
    password,
  };

  const res = await fetch(`${AUTH_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Login failed');
  }

  return data as AuthUser;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
}
