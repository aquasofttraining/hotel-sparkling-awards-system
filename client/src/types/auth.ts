// client/src/services/authService.ts
import axios from 'axios';

export interface User {
  id: number;
  roleId: number;
  role?: string;
  email?: string;
  username?: string;
  hotelId?: number;
}

interface LoginResponse {
  token: string;
}

export const login = async (email: string, password: string) => {
  const response = await axios.post<LoginResponse>('http://localhost:3000/api/auth/login', {
    email,
    password,
  });
  return response.data.token;
};
