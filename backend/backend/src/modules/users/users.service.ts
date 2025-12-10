/**
 * Users Service
 * Business logic for user management
 */

import * as usersRepo from './users.repository';
import { generateUserId, UserRole } from '@rodistaa/app-shared';
import logger from 'pino';

const log = logger({ name: 'users-service' });

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string): Promise<usersRepo.User | null> {
  return usersRepo.getUserById(userId, true); // Mask sensitive fields
}

/**
 * Get user by ID (with role-based masking)
 */
export async function getUserById(
  userId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<usersRepo.User | null> {
  // Admin can see unmasked data
  const maskSensitive = requestingUserRole !== 'ADMIN' && requestingUserRole !== 'AD';
  
  return usersRepo.getUserById(userId, maskSensitive);
}

/**
 * Register new user
 */
export async function registerUser(input: {
  mobile: string;
  name: string;
  role: UserRole;
  email?: string;
}): Promise<usersRepo.User> {
  // User creation is handled by auth service (findOrCreateUser)
  // This service method is for explicit registration
  const userId = generateUserId(input.role);

  try {
    // Check if user already exists
    const existing = await usersRepo.getUserById(userId, false);
    if (existing) {
      throw new Error('User already exists');
    }

    // User creation happens in auth service
    // This is just a placeholder for explicit registration flow
    const user = await usersRepo.getUserById(userId, false);
    if (!user) {
      throw new Error('User creation failed');
    }

    return user;
  } catch (error: any) {
    log.error({ error, mobile: input.mobile }, 'User registration failed');
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    email?: string;
  }
): Promise<usersRepo.User> {
  return usersRepo.updateUser(userId, updates);
}

