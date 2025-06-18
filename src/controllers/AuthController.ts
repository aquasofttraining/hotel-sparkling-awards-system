import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';

class AuthController {
  /**
   * @desc Authenticate user and generate JWT token
   * @route POST /api/auth/login
   * @access Public
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['role'] }]
      });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Compare passwords
      const isPasswordValid = password === user.passwordHash;

      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({
        userId: user.id,   // ✅ important: trebuie să fie `userId` ca să fie disponibil în `req.user.userId`
        roleId: user.roleId,
        role: user.role?.role,
        email: user.email,
        username: user.username,
      }, process.env.JWT_SECRET as string, { expiresIn: '1h' });


      res.status(200).json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default AuthController;