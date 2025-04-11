export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  token: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
} 