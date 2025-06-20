import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const result = await authService.login(credentials);
    setTimeout(() => {
      refreshUser();
    }, 100);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
