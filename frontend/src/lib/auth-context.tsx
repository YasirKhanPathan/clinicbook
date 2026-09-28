"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import type { User, Clinic } from './types';

interface AuthContextType {
  user: User | null;
  clinic: Clinic | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('cb_token');
      const savedUser = localStorage.getItem('cb_user');
      const savedClinic = localStorage.getItem('cb_clinic');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setClinic(savedClinic ? JSON.parse(savedClinic) : null);
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('cb_token', data.token);
    localStorage.setItem('cb_user', JSON.stringify(data.user));
    localStorage.setItem('cb_clinic', JSON.stringify(data.clinic));
    setUser(data.user);
    setClinic(data.clinic);
  };

  const logout = () => {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    localStorage.removeItem('cb_clinic');
    setUser(null);
    setClinic(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, clinic, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
