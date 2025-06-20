import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>; // ✅ Fixed signature
  logout: () => void;
  loading: boolean;
  refreshUser: () => void; // ✅ Added missing function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // ✅ Fixed typing

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => { // ✅ Added Props type
  const [user, setUser] = useState<User | null>(null); // ✅ Fixed typing
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // ✅ Ensure both role and roleId are properly set
          const normalizedUser = {
            ...parsedUser,
            roleId: Number(parsedUser.roleId), // Ensure roleId is number
            role: parsedUser.role || getRoleNameFromId(parsedUser.roleId) // Ensure role string exists
          };
          
          console.log('🔍 Auth Provider - Setting user:', normalizedUser);
          setUser(normalizedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Helper function to get role name from ID
  const getRoleNameFromId = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: 'Hotel Manager',
      2: 'Traveler', 
      3: 'Administrator',
      4: 'Data Operator'
    };
    return roleMap[roleId] || 'Unknown';
  };

  // ✅ Fixed login function signature to match interface
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // ✅ Normalize user data before storing
      const normalizedUser = {
        ...data.user,
        roleId: Number(data.user.roleId), // Ensure number
        role: data.user.role || getRoleNameFromId(data.user.roleId)
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      console.log('🔍 Login - Setting user:', normalizedUser);
      setUser(normalizedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    try {
      authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Implement missing refreshUser function
  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedUser = {
          ...data.user,
          roleId: Number(data.user.roleId),
          role: data.user.role || getRoleNameFromId(data.user.roleId)
        };
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    refreshUser // ✅ Added missing function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
