"use server";

import { executeQuery } from '@/lib/db';
import { User, UserRole } from '@/contexts/auth-context';
import * as crypto from 'crypto';

// Interface for authentication result
interface AuthResult {
  success: boolean;
  user?: User;
  message?: string;
}

// Interface for database user record
interface DBUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
  branch_id: string | null;
  company_name: string;
  branch_name: string | null;
  active: boolean;
}

// Authenticate a user with email and password
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Hash the password for comparison (in a real app, we'd use bcrypt)
    const hashedPassword = hashPassword(password);

    // Query the database for the user
    const users = await executeQuery<DBUser>(`
      SELECT u.id, u.name, u.email, u.role, u.company_id, u.branch_id,
             c.name as company_name, b.name as branch_name, u.active
      FROM Users u
      LEFT JOIN Companies c ON u.company_id = c.id
      LEFT JOIN Branches b ON u.branch_id = b.id
      WHERE u.email = @email AND u.password_hash = @passwordHash AND u.active = 1
    `, {
      email,
      passwordHash: hashedPassword
    });

    if (users.length === 0) {
      return { success: false, message: 'Credenciais inválidas' };
    }

    const dbUser = users[0];

    // Check if the user account is active
    if (!dbUser.active) {
      return { success: false, message: 'Conta de usuário desativada' };
    }

    // Convert DB user to application user
    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      company: dbUser.company_name,
      companyId: dbUser.company_id,
      branchId: dbUser.branch_id,
      branchName: dbUser.branch_name,
      permissions: await getUserPermissions(dbUser.id),
    };

    return { success: true, user };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Erro ao autenticar usuário' };
  }
}

// Get user permissions from the database
async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    interface Permission {
      permission_code: string;
    }

    const permissions = await executeQuery<Permission>(`
      SELECT p.permission_code
      FROM UserPermissions up
      JOIN Permissions p ON up.permission_id = p.id
      WHERE up.user_id = @userId
    `, { userId });

    return permissions.map(p => p.permission_code);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Hash a password (simplified version - in production use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Get all users (for admin interface)
export async function getAllUsers(): Promise<User[]> {
  try {
    const dbUsers = await executeQuery<DBUser>(`
      SELECT u.id, u.name, u.email, u.role, u.company_id, u.branch_id,
             c.name as company_name, b.name as branch_name, u.active
      FROM Users u
      LEFT JOIN Companies c ON u.company_id = c.id
      LEFT JOIN Branches b ON u.branch_id = b.id
      WHERE u.active = 1
      ORDER BY u.name
    `);

    // Convert DB users to application users
    const users: User[] = [];

    for (const dbUser of dbUsers) {
      users.push({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as UserRole,
        company: dbUser.company_name,
        companyId: dbUser.company_id,
        branchId: dbUser.branch_id,
        branchName: dbUser.branch_name,
        permissions: await getUserPermissions(dbUser.id),
      });
    }

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Create a new user
export async function createUser(userData: Omit<User, 'id'> & { password: string }): Promise<{ success: boolean, userId?: string, message?: string }> {
  try {
    const hashedPassword = hashPassword(userData.password);

    // Insert the user into the database
    const result = await executeQuery(`
      INSERT INTO Users (name, email, password_hash, role, company_id, branch_id, active)
      VALUES (@name, @email, @passwordHash, @role, @companyId, @branchId, 1);
      SELECT SCOPE_IDENTITY() AS id;
    `, {
      name: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role,
      companyId: userData.companyId,
      branchId: userData.branchId || null
    });

    const userId = result[0]?.id;

    // Add user permissions
    if (userId && userData.permissions.length > 0) {
      // Get permission IDs from permission codes
      interface PermissionId {
        id: string;
      }

      const permissionCodes = userData.permissions.map(p => `'${p}'`).join(',');

      const permissionIds = await executeQuery<PermissionId>(`
        SELECT id FROM Permissions WHERE permission_code IN (${permissionCodes})
      `);

      // Insert user permissions
      for (const permission of permissionIds) {
        await executeQuery(`
          INSERT INTO UserPermissions (user_id, permission_id)
          VALUES (@userId, @permissionId)
        `, {
          userId,
          permissionId: permission.id
        });
      }
    }

    return { success: true, userId };

  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Erro ao criar usuário' };
  }
}

// Update user
export async function updateUser(userId: string, userData: Partial<User> & { password?: string }): Promise<{ success: boolean, message?: string }> {
  try {
    let query = 'UPDATE Users SET ';
    const params: Record<string, any> = { userId };
    const updates: string[] = [];

    if (userData.name) {
      updates.push('name = @name');
      params.name = userData.name;
    }

    if (userData.email) {
      updates.push('email = @email');
      params.email = userData.email;
    }

    if (userData.password) {
      updates.push('password_hash = @passwordHash');
      params.passwordHash = hashPassword(userData.password);
    }

    if (userData.role) {
      updates.push('role = @role');
      params.role = userData.role;
    }

    if (userData.companyId) {
      updates.push('company_id = @companyId');
      params.companyId = userData.companyId;
    }

    if (userData.branchId !== undefined) {
      updates.push('branch_id = @branchId');
      params.branchId = userData.branchId;
    }

    if (updates.length === 0) {
      return { success: true };
    }

    query += updates.join(', ') + ' WHERE id = @userId';

    await executeQuery(query, params);

    // Update user permissions if provided
    if (userData.permissions && userData.permissions.length > 0) {
      // Delete existing permissions
      await executeQuery('DELETE FROM UserPermissions WHERE user_id = @userId', { userId });

      // Get permission IDs from permission codes
      interface PermissionId {
        id: string;
      }

      const permissionCodes = userData.permissions.map(p => `'${p}'`).join(',');

      const permissionIds = await executeQuery<PermissionId>(`
        SELECT id FROM Permissions WHERE permission_code IN (${permissionCodes})
      `);

      // Insert user permissions
      for (const permission of permissionIds) {
        await executeQuery(`
          INSERT INTO UserPermissions (user_id, permission_id)
          VALUES (@userId, @permissionId)
        `, {
          userId,
          permissionId: permission.id
        });
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Erro ao atualizar usuário' };
  }
}

// Update user's last login timestamp
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  try {
    await executeQuery(`
      UPDATE Users
      SET last_login = GETDATE()
      WHERE id = @userId
    `, { userId });

    return true;
  } catch (error) {
    console.error('Error updating last login timestamp:', error);
    return false;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Query the database for the user
    const users = await executeQuery<DBUser>(`
      SELECT u.id, u.name, u.email, u.role, u.company_id, u.branch_id,
             c.name as company_name, b.name as branch_name, u.active
      FROM Users u
      LEFT JOIN Companies c ON u.company_id = c.id
      LEFT JOIN Branches b ON u.branch_id = b.id
      WHERE u.id = @userId AND u.active = 1
    `, { userId });

    if (users.length === 0) {
      return null;
    }

    const dbUser = users[0];

    // Get user permissions
    const permissions = await getUserPermissions(userId);

    // Convert DB user to application user
    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      company: dbUser.company_name,
      companyId: dbUser.company_id,
      branchId: dbUser.branch_id,
      branchName: dbUser.branch_name,
      permissions
    };

    return user;
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    return null;
  }
}

// Delete user (or deactivate)
export async function deleteUser(userId: string): Promise<{ success: boolean, message?: string }> {
  try {
    // In a real application, you might want to soft delete by setting the active flag to 0
    // rather than hard delete
    const result = await executeQuery(`
      UPDATE Users
      SET active = 0
      WHERE id = @userId
    `, { userId });

    return { success: true };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return { success: false, message: 'Erro ao excluir usuário' };
  }
}
