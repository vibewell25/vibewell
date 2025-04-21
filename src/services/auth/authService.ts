import { User, Session } from '@/types/auth';

class AuthService {
  // Mock API functions - in real implementation these would call your backend API
  async getCurrentUser(): Promise<User | null> {
    // Check local storage or secure storage for token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }

    try {
      // In a real app, you would validate the token with your backend
      const userData = JSON.parse(localStorage.getItem('auth_user') || 'null');
      return userData;
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return null;
    }
  }

  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; session: Session }> {
    // In a real app, this would make an API call to your backend
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }

    const data = await response.json();

    // Save auth data to local storage
    localStorage.setItem('auth_token', data.session.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    return data;
  }

  async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    // In a real app, this would make an API call to your backend
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    const data = await response.json();

    // Save auth data to local storage
    localStorage.setItem('auth_token', data.session.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    return data;
  }

  async signOut(): Promise<void> {
    // In a real app, this would make an API call to your backend
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    // Remove auth data from local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async resetPassword(email: string): Promise<void> {
    // In a real app, this would make an API call to your backend
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }
  }
}

export const authService = new AuthService();
