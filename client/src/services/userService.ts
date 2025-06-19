import axios from './api';
import { User } from '../types/auth';

const BASE_URL = '/users';

export const getUsers = async (page = 1, limit = 10) => {
  const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const updateUser = async (id: number, updates: Partial<User>) => {
  const response = await axios.put(`${BASE_URL}/${id}`, updates);
  return response.data;
};

export const assignHotelManager = async (userId: number, hotelId: number) => {
  const response = await axios.post(`${BASE_URL}/assign-hotel-manager`, {
    userId,
    hotelId,
  });
  return response.data;
};
