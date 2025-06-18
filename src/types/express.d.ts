import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        roleId: number; // ✅ folosești roleId în JWT și logică
        email?: string;
        username?: string;
      };
    }
  }
}
