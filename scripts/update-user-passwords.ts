import bcrypt from 'bcryptjs';
import { User } from '../src/models';

async function setUniformPasswords(): Promise<void> {
  try {
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // Update ALL users regardless of current password
    const result = await User.update(
      { passwordHash: hashedPassword },
      { where: {} } // Empty where = update all
    );
    
    console.log(` Updated ${result[0]} users to password: "${defaultPassword}"`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating passwords:', error);
    process.exit(1);
  }
}

setUniformPasswords();
