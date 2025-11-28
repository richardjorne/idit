// services/authService.ts

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

const AUTH_BASE_URL = 'http://localhost:5000'; // If the backend port is different, change it here

// register
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
    throw new Error(data.error || data.message || 'Registration Failed');
  }

  return data as AuthUser;
}

// login
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
    throw new Error(data.error || data.message || 'Login Failed');
  }

  return data as AuthUser;
}

// Get the current user from localStorage
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

// logout
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUser');
}
