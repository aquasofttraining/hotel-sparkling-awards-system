import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { User } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface DecodedToken {
  userId: number;
  roleId: number;
  role: string;
  email: string;
  username: string;
  hotelId?: number | null;
  exp: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }

        console.log('Decoded JWT:', decoded);
        setUser({
          id: decoded.userId,
          userId: decoded.userId,
          roleId: decoded.roleId,
          role: decoded.role,
          email: decoded.email,
          username: decoded.username,
          hotelId: decoded.hotelId || null,
          firstName: '',
          lastName: '',
          accountStatus: 'active',
          emailVerified: false,
          reviewCount: 0,
          createdAt: ''
        });
      } catch (e) {
        console.error('Failed to decode token:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
