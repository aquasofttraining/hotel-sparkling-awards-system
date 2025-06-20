import axios from 'axios';

export interface User {
  id: number;
  userId: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  role: string;
  hotelId?: number | null;
  accountStatus: string;
  emailVerified: boolean;
  reviewCount: number;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post<LoginResponse>('http://localhost:3000/api/auth/login', {
    email,
    password,
  });
  return response.data.token;
};

export const logout = async (): Promise<void> => {
  await axios.post('http://localhost:3000/api/auth/logout');
};

export const getProfile = async (): Promise<User> => {
  const response = await axios.get<{success: boolean; user: User}>('http://localhost:3000/api/auth/profile');
  return response.data.user;
};
