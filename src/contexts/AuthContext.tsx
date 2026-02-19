import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Store, STORES } from '@/data/stores';

interface AuthContextType {
  currentStore: Store | null;
  login: (storeName: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alkosto_store');
    if (saved) {
      const store = STORES.find(s => s.id === saved);
      if (store) setCurrentStore(store);
    }
  }, []);

  const login = (storeName: string, password: string): boolean => {
    const store = STORES.find(
      s => s.name.toLowerCase() === storeName.toLowerCase() && s.password.toLowerCase() === password.toLowerCase()
    );
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('alkosto_store', store.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentStore(null);
    localStorage.removeItem('alkosto_store');
  };

  return (
    <AuthContext.Provider value={{ currentStore, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
