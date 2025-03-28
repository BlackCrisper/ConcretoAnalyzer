"use server";

import { executeQuery } from '@/lib/db';
import { Invitation, UserRole } from '@/contexts/auth-context';
import * as crypto from 'crypto';

// Get all invitations
export async function getAllInvitations(): Promise<Invitation[]> {
  try {
    interface DBInvitation {
      id: string;
      email: string;
      role: string;
      branch_id: string | null;
      branch_name: string | null;
      expires_at: string;
      created_at: string;
      accepted_at: string | null;
      status: string;
      token: string;
    }

    const invitations = await executeQuery<DBInvitation>(`
      SELECT i.id, i.email, i.role, i.branch_id, b.name as branch_name,
             i.expires_at, i.created_at, i.accepted_at, i.status, i.token
      FROM Invitations i
      LEFT JOIN Branches b ON i.branch_id = b.id
      ORDER BY i.created_at DESC
    `);

    // Now get permissions for each invitation
    const result: Invitation[] = [];

    for (const invitation of invitations) {
      // Get permissions
      interface InvitationPermission {
        permission_code: string;
      }

      const permissions = await executeQuery<InvitationPermission>(`
        SELECT p.permission_code
        FROM InvitationPermissions ip
        JOIN Permissions p ON ip.permission_id = p.id
        WHERE ip.invitation_id = @invitationId
      `, { invitationId: invitation.id });

      result.push({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role as UserRole,
        permissions: permissions.map(p => p.permission_code),
        branchId: invitation.branch_id,
        branchName: invitation.branch_name,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
        acceptedAt: invitation.accepted_at || undefined,
        status: invitation.status as 'pendente' | 'aceito' | 'expirado',
        token: invitation.token
      });
    }

    return result;
  } catch (error) {
    console.error('Error getting invitations:', error);
    return [];
  }
}

// Create a new invitation
export async function createInvitation(invitationData: Omit<Invitation, 'id' | 'createdAt' | 'acceptedAt' | 'status' | 'token'>): Promise<Invitation> {
  try {
    // Generate token and set dates
    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    const createdAt = now.toISOString();

    // Insert invitation into the database
    const result = await executeQuery(`
      INSERT INTO Invitations (email, role, branch_id, expires_at, created_at, status, token)
      VALUES (@email, @role, @branchId, @expiresAt, @createdAt, 'pendente', @token);
      SELECT SCOPE_IDENTITY() AS id;
    `, {
      email: invitationData.email,
      role: invitationData.role,
      branchId: invitationData.branchId,
      expiresAt: invitationData.expiresAt,
      createdAt,
      token
    });

    const invitationId = result[0]?.id;

    if (!invitationId) {
      throw new Error('Failed to create invitation');
    }

    // Add invitation permissions
    if (invitationData.permissions.length > 0) {
      // Get permission IDs from permission codes
      interface PermissionId {
        id: string;
      }

      const permissionCodes = invitationData.permissions.map(p => `'${p}'`).join(',');

      const permissionIds = await executeQuery<PermissionId>(`
        SELECT id FROM Permissions WHERE permission_code IN (${permissionCodes})
      `);

      // Insert invitation permissions
      for (const permission of permissionIds) {
        await executeQuery(`
          INSERT INTO InvitationPermissions (invitation_id, permission_id)
          VALUES (@invitationId, @permissionId)
        `, {
          invitationId,
          permissionId: permission.id
        });
      }
    }

    // Get branch name if any
    let branchName = null;
    if (invitationData.branchId) {
      const branches = await executeQuery(`
        SELECT name FROM Branches WHERE id = @branchId
      `, { branchId: invitationData.branchId });

      branchName = branches[0]?.name;
    }

    // Return the created invitation
    return {
      id: invitationId,
      email: invitationData.email,
      role: invitationData.role,
      permissions: invitationData.permissions,
      branchId: invitationData.branchId,
      branchName: branchName || undefined,
      expiresAt: invitationData.expiresAt,
      createdAt,
      status: 'pendente',
      token
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }
}

// Accept an invitation
export async function acceptInvitation(token: string, password: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Find the invitation
    interface InvitationDetail {
      id: string;
      email: string;
      role: string;
      branch_id: string | null;
      expires_at: string;
      status: string;
    }

    const invitations = await executeQuery<InvitationDetail>(`
      SELECT id, email, role, branch_id, expires_at, status
      FROM Invitations
      WHERE token = @token
    `, { token });

    if (invitations.length === 0) {
      return { success: false, message: 'Convite inválido ou expirado' };
    }

    const invitation = invitations[0];

    // Check if invitation is still valid
    if (invitation.status !== 'pendente') {
      return { success: false, message: 'Este convite já foi utilizado ou expirado' };
    }

    // Check if invitation is not expired
    const now = new Date();
    const expiryDate = new Date(invitation.expires_at);

    if (now > expiryDate) {
      // Update invitation status to expired
      await executeQuery(`
        UPDATE Invitations SET status = 'expirado' WHERE id = @invitationId
      `, { invitationId: invitation.id });

      return { success: false, message: 'Este convite expirou' };
    }

    // Get permissions from invitation
    interface Permission {
      permission_code: string;
    }

    const permissions = await executeQuery<Permission>(`
      SELECT p.permission_code
      FROM InvitationPermissions ip
      JOIN Permissions p ON ip.permission_id = p.id
      WHERE ip.invitation_id = @invitationId
    `, { invitationId: invitation.id });

    // Create the user
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Check if email already exists
    const existingUsers = await executeQuery(`
      SELECT COUNT(*) as count FROM Users WHERE email = @email
    `, { email: invitation.email });

    if (existingUsers[0]?.count > 0) {
      return { success: false, message: 'Um usuário com este e-mail já existe' };
    }

    // Insert the user
    const result = await executeQuery(`
      INSERT INTO Users (email, name, password_hash, role, company_id, branch_id, active)
      SELECT @email, @email, @passwordHash, @role,
             CASE WHEN b.company_id IS NOT NULL THEN b.company_id ELSE '1' END,
             @branchId, 1
      FROM Branches b
      WHERE b.id = @branchId OR @branchId IS NULL
      SELECT SCOPE_IDENTITY() AS id;
    `, {
      email: invitation.email,
      passwordHash: hashedPassword,
      role: invitation.role,
      branchId: invitation.branch_id
    });

    const userId = result[0]?.id;

    if (!userId) {
      throw new Error('Failed to create user from invitation');
    }

    // Add user permissions
    for (const permission of permissions) {
      const permId = await executeQuery(`
        SELECT id FROM Permissions WHERE permission_code = @permissionCode
      `, { permissionCode: permission.permission_code });

      if (permId.length > 0) {
        await executeQuery(`
          INSERT INTO UserPermissions (user_id, permission_id)
          VALUES (@userId, @permissionId)
        `, {
          userId,
          permissionId: permId[0].id
        });
      }
    }

    // Update invitation status to accepted
    const acceptedAt = now.toISOString();
    await executeQuery(`
      UPDATE Invitations SET status = 'aceito', accepted_at = @acceptedAt WHERE id = @invitationId
    `, {
      invitationId: invitation.id,
      acceptedAt
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, message: 'Erro ao aceitar o convite' };
  }
}

// Revoke an invitation
export async function revokeInvitation(invitationId: string): Promise<{ success: boolean, message?: string }> {
  try {
    await executeQuery(`
      UPDATE Invitations SET status = 'expirado' WHERE id = @invitationId
    `, { invitationId });

    return { success: true };
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return { success: false, message: 'Erro ao revogar o convite' };
  }
}

// Resend an invitation (generate new token and reset expiry)
export async function resendInvitation(invitationId: string, expiryDays: number): Promise<{ success: boolean, token?: string, message?: string }> {
  try {
    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();

    // Calculate new expiry date
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + expiryDays);
    const expiresAt = expiryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    await executeQuery(`
      UPDATE Invitations
      SET token = @token, expires_at = @expiresAt, status = 'pendente', accepted_at = NULL
      WHERE id = @invitationId
    `, {
      invitationId,
      token,
      expiresAt
    });

    return { success: true, token };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return { success: false, message: 'Erro ao reenviar o convite' };
  }
}

// Get invitation by ID
export async function getInvitationById(invitationId: string): Promise<Invitation | null> {
  try {
    interface DBInvitation {
      id: string;
      email: string;
      role: string;
      branch_id: string | null;
      branch_name: string | null;
      expires_at: string;
      created_at: string;
      accepted_at: string | null;
      status: string;
      token: string;
    }

    const invitations = await executeQuery<DBInvitation>(`
      SELECT i.id, i.email, i.role, i.branch_id, b.name as branch_name,
             i.expires_at, i.created_at, i.accepted_at, i.status, i.token
      FROM Invitations i
      LEFT JOIN Branches b ON i.branch_id = b.id
      WHERE i.id = @invitationId
    `, { invitationId });

    if (invitations.length === 0) {
      return null;
    }

    const invitation = invitations[0];

    // Get permissions for this invitation
    interface InvitationPermission {
      permission_code: string;
    }

    const permissions = await executeQuery<InvitationPermission>(`
      SELECT p.permission_code
      FROM InvitationPermissions ip
      JOIN Permissions p ON ip.permission_id = p.id
      WHERE ip.invitation_id = @invitationId
    `, { invitationId });

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as UserRole,
      permissions: permissions.map(p => p.permission_code),
      branchId: invitation.branch_id,
      branchName: invitation.branch_name,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
      acceptedAt: invitation.accepted_at || undefined,
      status: invitation.status as 'pendente' | 'aceito' | 'expirado',
      token: invitation.token
    };
  } catch (error) {
    console.error(`Error getting invitation ${invitationId}:`, error);
    return null;
  }
}
