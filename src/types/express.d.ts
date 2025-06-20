import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        roleId: number;
        role?: string;
        email?: string;
        username?: string;
        hotelId?: number | null;
      };
    }
  }
}
