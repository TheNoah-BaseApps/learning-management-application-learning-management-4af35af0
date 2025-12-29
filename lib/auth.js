import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '@/lib/jwt';

export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

export async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
}

export async function createUser(email, password, name, role = 'employee') {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (id, email, password, name, role, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW()) 
       RETURNING id, email, name, role, created_at`,
      [email, hashedPassword, name, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function authenticateUser(email, password) {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValid = await comparePassword(password, user.password);
    
    if (!isValid) {
      return null;
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

export function checkRole(user, allowedRoles) {
  if (!user || !user.role) {
    return false;
  }
  return allowedRoles.includes(user.role);
}

export async function createAuthToken(user) {
  try {
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    return token;
  } catch (error) {
    console.error('Error creating auth token:', error);
    throw error;
  }
}