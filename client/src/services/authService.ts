import { User } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
  roleId: number;
  role: string;
  email: string;
  username: string;
  hotelId?: number | null;
  firstName?: string;
  lastName?: string;
  exp: number;
}

class AuthService {
  getCurrentUser(): User | null {
    const token = localStorage.getItem('token');
    
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }

      // Create complete User object with all required properties
      const user: User = {
        id: decoded.userId,
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        firstName: decoded.firstName || undefined,
        lastName: decoded.lastName || undefined,
        roleId: decoded.roleId,
        role: decoded.role,
        hotelId: decoded.hotelId || null,
        accountStatus: 'active', // Default value
        emailVerified: false,    // Default value
        reviewCount: 0,          // Default value
        createdAt: new Date().toISOString() // Default value
      };

      return user;
    } catch (error) {
      console.error('Failed to decode token:', error);
      this.logout();
      return null;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<string> {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
