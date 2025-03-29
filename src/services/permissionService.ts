'use server';

import { executeQuery } from '@/lib/db';

// Define permission interface
export interface Permission {
  id: string;
  code: string;
  description: string;
  category: string;
}

// Get all permissions
export async function getAllPermissions(): Promise<Permission[]> {
  try {
    interface DBPermission {
      id: string;
      permission_code: string;
      description: string;
      category: string;
    }

    const permissions = await executeQuery<DBPermission>(`
      SELECT id, permission_code, description, category
      FROM Permissions
      ORDER BY category, description
    `);

    return permissions.map(p => ({
      id: p.id,
      code: p.permission_code,
      description: p.description,
      category: p.category,
    }));
  } catch (error) {
    console.error('Error getting permissions:', error);
    return [];
  }
}

// Get permissions by category
export async function getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
  try {
    const permissions = await getAllPermissions();

    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  } catch (error) {
    console.error('Error getting permissions by category:', error);
    return {};
  }
}

// Get permissions by IDs
export async function getPermissionsByIds(ids: string[]): Promise<Permission[]> {
  try {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map((_, index) => `@id${index}`).join(', ');
    const params: Record<string, any> = {};

    ids.forEach((id, index) => {
      params[`id${index}`] = id;
    });

    interface DBPermission {
      id: string;
      permission_code: string;
      description: string;
      category: string;
    }

    const permissions = await executeQuery<DBPermission>(
      `
      SELECT id, permission_code, description, category
      FROM Permissions
      WHERE id IN (${placeholders})
      ORDER BY category, description
    `,
      params
    );

    return permissions.map(p => ({
      id: p.id,
      code: p.permission_code,
      description: p.description,
      category: p.category,
    }));
  } catch (error) {
    console.error('Error getting permissions by ids:', error);
    return [];
  }
}

// Get permissions by codes
export async function getPermissionsByCodes(codes: string[]): Promise<Permission[]> {
  try {
    if (codes.length === 0) {
      return [];
    }

    const placeholders = codes.map((_, index) => `@code${index}`).join(', ');
    const params: Record<string, any> = {};

    codes.forEach((code, index) => {
      params[`code${index}`] = code;
    });

    interface DBPermission {
      id: string;
      permission_code: string;
      description: string;
      category: string;
    }

    const permissions = await executeQuery<DBPermission>(
      `
      SELECT id, permission_code, description, category
      FROM Permissions
      WHERE permission_code IN (${placeholders})
      ORDER BY category, description
    `,
      params
    );

    return permissions.map(p => ({
      id: p.id,
      code: p.permission_code,
      description: p.description,
      category: p.category,
    }));
  } catch (error) {
    console.error('Error getting permissions by codes:', error);
    return [];
  }
}
