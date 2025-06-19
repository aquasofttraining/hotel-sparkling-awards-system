// src/services/authService.ts
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

import { User } from '../types/auth';

const API_URL = 'http://localhost:3000/api/auth';

export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  const data = response.data as { token: string };
  const token = data.token;
  localStorage.setItem('token', token);
  const decoded = jwtDecode<User>(token); // Decode the JWT token
  return decoded;
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode<User>(token);
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};


