import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  accountStatus: string;
  emailVerified: boolean;
  reviewCount: number;
  createdAt: string;
  role?: {
    id: number;
    role: string;
  };
  managedHotels?: Array<{
    hotelId: number;
    hotel: {
      GlobalPropertyID: number;
      GlobalPropertyName: string;
    };
  }>;
}

export interface Role {
  id: number;
  role: string;
  description?: string;
}

export interface Hotel {
  GlobalPropertyID: number;
  GlobalPropertyName: string;
  PropertyAddress1?: string;
}

// ✅ Define specific response types
interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface RolesResponse {
  success: boolean;
  data: {
    roles: Role[];
  };
}

interface HotelsResponse {
  success: boolean;
  data: {
    hotels: Hotel[];
  };
}

interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
  accountStatus?: string;
  hotelIds?: number[];
}

interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
  accountStatus?: string;
  hotelIds?: number[];
}

class UserManagementService {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);

      
      const response = await api.get<UsersResponse>(`/user-management/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      
      const response = await api.post<CreateUserResponse>('/user-management/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      
      const response = await api.put<UpdateUserResponse>(`/user-management/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    try {
      
      const response = await api.delete<DeleteUserResponse>(`/user-management/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getRoles(): Promise<RolesResponse> {
    try {
      
      const response = await api.get<RolesResponse>('/user-management/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async getHotels(): Promise<HotelsResponse> {
    try {
      
      const response = await api.get<HotelsResponse>('/user-management/hotels');
      return response.data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
