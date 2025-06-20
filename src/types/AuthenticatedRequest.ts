import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;
    email?: string;
    username?: string;
    hotelId?: number | null;
  };
}
