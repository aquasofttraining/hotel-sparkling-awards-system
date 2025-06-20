import api from './api';
import { User } from '../types/auth';

class UserService {
  async getUsers(page = 1, limit = 10) {
    const response = await api.get<{ 
      success: boolean; 
      data: User[]; 
      pagination: { total: number; page: number; limit: number; totalPages: number; } 
    }>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getUserById(id: number) {
    const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: number, updates: Partial<User>) {
    const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, updates);
    return response.data.data;
  }

  async assignHotelManager(userId: number, hotelId: number) {
    const response = await api.post<{ success: boolean; data: any }>(`/users/assign-hotel-manager`, {
      userId,
      hotelId,
    });
    return response.data;
  }
}

export const userService = new UserService();
