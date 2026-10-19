import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { IUser } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; city?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on initial application load
  const restoreSession = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Not logged in or expired; clear user
      setUser(null);
      localStorage.removeItem('rb_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('rb_token', res.data.token);
        }
        toast.success(res.data.message || `Welcome back, ${res.data.user.name}!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('rb_token', res.data.token);
        }
        toast.success(res.data.message || 'Welcome to RouteBloom!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      localStorage.removeItem('rb_token');
      toast.info('You have logged out.');
    }
  };

  const updateProfile = async (data: Partial<IUser>) => {
    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Could not update profile.');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
