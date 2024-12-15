import { useState, useEffect } from 'react';
import { Auth, Me } from '@/src/auth'; // Adjust the import path as needed

const auth = new Auth();

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Me | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      await auth.init();
      setIsAuthenticated(!!auth.me);
      setUser(auth.me);
      setToken(localStorage.getItem('lichess_token'));
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      await auth.login();
      // The page will redirect, so we don't need to update state here
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setUser(undefined);
      setToken(null);
      localStorage.removeItem('lichess_token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await auth.init();
      setIsAuthenticated(!!auth.me);
      setUser(auth.me);
      const newToken = localStorage.getItem('lichess_token');
      setToken(newToken);
    } catch (error) {
      console.error('Refresh user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    logout,
    refreshUser,
    fetchBody: auth.fetchBody,
    openStream: auth.openStream,
  };
}

