import { Request, Response } from 'express';
import { User, Role, HotelManager } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;       // ✅ adăugat
    email?: string;      // ✅ adăugat
    username?: string;   // ✅ adăugat dacă vrei
  };
}

class UserController {
  public async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 sau roleId = 4 să acceseze ruta
      if (![3, 4].includes(user.roleId)) {
        res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view users' });
        return;
      }

      // Obține lista utilizatorilor
      const users = await User.findAll();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
  }

  public async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 sau roleId = 4 să acceseze ruta
      if (![3, 4].includes(user.roleId)) {
        res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view user details' });
        return;
      }

      const { id } = req.params; // ID-ul utilizatorului

      // Găsește utilizatorul după ID
      const userDetails = await User.findByPk(id);
      if (!userDetails) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, data: userDetails });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve user details' });
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 (Administrator) să acceseze ruta
      if (user.roleId !== 3) {
        res.status(403).json({ success: false, message: 'Access denied: Only administrators can update user details' });
        return;
      }

      const { id } = req.params; // ID-ul utilizatorului de actualizat
      const userData = req.body; // Datele de actualizat

      // Găsește utilizatorul după ID
      const userToUpdate = await User.findByPk(id);
      if (!userToUpdate) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Actualizează utilizatorul
      await userToUpdate.update(userData);
      res.status(200).json({ success: true, message: 'User updated successfully', data: userToUpdate });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Failed to update user details' });
    }
  }

  public async assignHotelManager(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, hotelId } = req.body;

      if (!userId || !hotelId) {
        res.status(400).json({ success: false, message: 'User ID and Hotel ID are required' });
        return;
      }

      const assignment = await HotelManager.create({
        userId,
        hotelId,
        assignedBy: req.user!.userId,
        isActive: true
      });

      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      console.error('Assign manager error:', error);
      res.status(500).json({ success: false, message: 'Failed to assign hotel manager' });
    }
  }

  public async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 (Administrator) să acceseze ruta
      if (user.roleId !== 3) {
        res.status(403).json({ success: false, message: 'Access denied: Only administrators can create users' });
        return;
      }

      const userData = req.body; // Datele utilizatorului de creat

      // Creează utilizatorul
      const newUser = await User.create(userData);
      res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  public async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 (Administrator) să acceseze ruta
      if (user.roleId !== 3) {
        res.status(403).json({ success: false, message: 'Access denied: Only administrators can delete users' });
        return;
      }

      const { id } = req.params; // ID-ul utilizatorului de șters

      // Găsește utilizatorul după ID
      const userToDelete = await User.findByPk(id);
      if (!userToDelete) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Șterge utilizatorul
      await userToDelete.destroy();
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  }
}

export default new UserController();
