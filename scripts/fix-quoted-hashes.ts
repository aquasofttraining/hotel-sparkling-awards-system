// scripts/fix-quoted-hashes.ts
import bcrypt from 'bcryptjs';
import { User } from '../src/models/index.js';
import { Op } from 'sequelize';

async function fixQuotedHashes(): Promise<void> {
  try {
    // Find all users with quoted hashes
    const users = await User.findAll({
      where: {
        passwordHash: {
          [Op.like]: '"%"' // Hashes starting and ending with quotes
        }
      }
    });

    for (const user of users) {
      // Remove quotes from the hash
      const cleanHash = user.passwordHash.replace(/^"|"$/g, '');
      await user.update({ passwordHash: cleanHash });
    }

    console.log(`✅ Fixed ${users.length} quoted hashes`);
  } catch (error) {
    console.error('❌ Error fixing hashes:', error);
  }
}

fixQuotedHashes();
