import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models';
import { AuthenticatedRequest } from 'types/AuthenticatedRequest';


interface LoginRequestBody {
  email: string;
  password: string;
}

interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  roleId: number;
  role: string;
  hotelId: number | null;
  iat: number;
}

class AuthController {
  // Role mapping helper
  private getRoleName(roleId: number): string {
    const roles: { [key: number]: string } = {
      1: 'Hotel Manager',
      2: 'Traveler', 
      3: 'Administrator',
      4: 'Data Operator'
    };
    return roles[roleId] || 'Unknown';
  }

  // Input validation helper
  private validateLoginInput(email: string, password: string): string | null {
    if (!email || !password) {
      return 'Email and password are required';
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      return 'Invalid input format';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }

    if (password.length < 3) {
      return 'Password too short';
    }

    return null;
  }

  // Check JWT secret availability
  private ensureJWTSecret(): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwtSecret;
  }

 
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequestBody = req.body;
      
      console.log('Login attempt for email:', email);


      const validationError = this.validateLoginInput(email, password);
      if (validationError) {
        console.log(' Validation failed:', validationError);
        res.status(400).json({ 
          success: false, 
          message: validationError 
        });
        return;
      }

      // Find user by email (case insensitive) with role information
      const user = await User.findOne({ 
        where: { 
          email: email.toLowerCase() 
        },
        include: [{ 
          model: Role, 
          as: 'role',
          required: false 
        }]
      }) as any;

      if (!user) {
        console.log(' User not found:', email);
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      console.log('User found:', {
        id: user.id,
        email: user.email,
        roleId: user.role_id || user.roleId,
        accountStatus: user.account_status || user.accountStatus
      });

  
      const accountStatus = user.account_status || user.accountStatus;
      if (accountStatus && accountStatus !== 'active') {
        console.log(' Account not active:', accountStatus);
        res.status(401).json({ 
          success: false, 
          message: 'Account is not active' 
        });
        return;
      }

      // Verify password (handle both password_hash and password fields)
      const passwordField = user.passwordHash || user.password_hash || user.password;
    
      console.log(' BCRYPT DEBUG:', {
        inputPassword: `"${password}"`,
        inputPasswordLength: password.length,
        storedHash: `"${passwordField}"`,
        storedHashLength: passwordField.length,
        hashPreview: passwordField.substring(0, 30) + '...',
        hasNewline: passwordField.includes('\n'),
        hasCarriageReturn: passwordField.includes('\r'),
        trimmedHash: passwordField.trim(),
        hashTrimmedLength: passwordField.trim().length
      });

      // Debugging bcrypt comparison
      console.log('Testing bcrypt comparison:');
      const result1 = await bcrypt.compare(password, passwordField);
      const result2 = await bcrypt.compare(password, passwordField.trim());
      const result3 = await bcrypt.compare(password.trim(), passwordField.trim());

      console.log(' Bcrypt test results:', {
        originalHash: result1,
        trimmedHash: result2,
        bothTrimmed: result3
      });

      if (!passwordField) {
        console.log('No password field found for user:', email);
        res.status(500).json({ 
          success: false, 
          message: 'Authentication system error' 
        });
        return;
      }

      console.log('Verifying password...');
      const isValidPassword = await bcrypt.compare(password, passwordField);
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
        return;
      }

      // Get role information
      const roleId = Number(user.role_id || user.roleId);
      const roleName = user.role?.role || this.getRoleName(roleId);
      const hotelId = user.hotel_id || user.hotelId || null;

      console.log('Creating JWT for user:', {
        userId: user.id,
        email: user.email,
        roleId: roleId,
        roleName: roleName
      });

      // Ensure JWT secret is available
      const jwtSecret = this.ensureJWTSecret();

      // Create JWT payload
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        roleId: roleId,
        role: roleName,
        hotelId: hotelId,
        iat: Math.floor(Date.now() / 1000)
      };

      // Generate JWT token
      const token = jwt.sign(
        payload,
        jwtSecret,
        { 
          expiresIn: '24h',
          issuer: 'hotel-awards-api',
          algorithm: 'HS256'
        }
      );

      console.log('Login successful for user:', {
        id: user.id,
        email: user.email,
        role: roleName,
        roleId: roleId
      });

      // Return success response
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          roleId: roleId,
          role: roleName,
          hotelId: hotelId,
          accountStatus: accountStatus || 'active',
          emailVerified: user.email_verified || user.emailVerified || false,
          reviewCount: user.review_count || user.reviewCount || 0,
          createdAt: user.created_at || user.createdAt
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Authentication system error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  // User logout
  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log('User logout requested');
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
  }

  // Get current user profile
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        console.log('Profile request without authentication');
        res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
        return;
      }

      console.log('👤 Getting profile for user:', userId);

      const user = await User.findByPk(userId, {
        include: [{ 
          model: Role, 
          as: 'role',
          required: false 
        }]
      }) as any;
      
      if (!user) {
        console.log('User not found for profile:', userId);
        res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
        return;
      }

      const roleId = Number(user.role_id || user.roleId);
      const roleName = user.role?.role || this.getRoleName(roleId);

      console.log('Profile retrieved for user:', user.email);

      res.json({
        success: true,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          roleId: roleId,
          role: roleName,
          hotelId: user.hotel_id || user.hotelId || null,
          accountStatus: user.account_status || user.accountStatus || 'active',
          emailVerified: user.email_verified || user.emailVerified || false,
          reviewCount: user.review_count || user.reviewCount || 0,
          createdAt: user.created_at || user.createdAt
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get user profile' 
      });
    }
  }

  // Password reset helper (for future use)
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ 
          success: false, 
          message: 'Current password and new password are required' 
        });
        return;
      }

      const user = await User.findByPk(userId) as any;
      if (!user) {
        res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
        return;
      }

      const passwordField = user.password_hash || user.password;
      const isValidPassword = await bcrypt.compare(currentPassword, passwordField);

      if (!isValidPassword) {
        res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ password_hash: hashedNewPassword });

      console.log('Password changed for user:', user.email);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to change password' 
      });
    }
  }
}

export default new AuthController();
