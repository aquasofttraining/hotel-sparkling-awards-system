import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export interface User {
  id: number;
  userId: number;
  email: string;
  username: string;
  roleId: number;
  role: string;
  hotelId?: number;
}

interface LoginResponse {
  token: string;
}

interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  roleId: number;
  role: string;
  hotelId?: number;
  exp: number;
}

const API_URL = 'http://localhost:3001/api';

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, { 
      email, 
      password 
    });
    
    const token = response.data.token;
    localStorage.setItem('token', token);
    
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      roleId: decoded.roleId,
      role: decoded.role,
      hotelId: decoded.hotelId
    };
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      roleId: decoded.roleId,
      role: decoded.role,
      hotelId: decoded.hotelId
    };
  } catch {
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// For components that use authService.method() pattern
class AuthService {
  login = loginUser;
  getCurrentUser = getCurrentUser;
  logout = logoutUser;
  getToken = getToken;
}

export const authService = new AuthService();
