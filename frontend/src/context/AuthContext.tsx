import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { LoginRequest } from '../types/domain';

/**
 * Authentication context
 * Manages JWT token and admin authentication state
 */

interface AuthContextValue {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'authToken';
const USERNAME_STORAGE_KEY = 'authUsername';

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Load token and username from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Login function
  const login = async (request: LoginRequest) => {
    try {
      const response = await authApi.login(request);

      // Save token and username
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(USERNAME_STORAGE_KEY, response.username);

      setToken(response.token);
      setUsername(response.username);
    } catch (error) {
      // Clear any existing auth data on login failure
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USERNAME_STORAGE_KEY);
      setToken(null);
      setUsername(null);

      throw error; // Re-throw to allow caller to handle
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    setToken(null);
    setUsername(null);
  };

  const value: AuthContextValue = {
    token,
    username,
    isAuthenticated: token !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
