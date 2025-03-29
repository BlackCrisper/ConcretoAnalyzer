"use server";

import { executeQuery } from '@/lib/db';
import { Invitation, UserRole } from '@/contexts/auth-context';
import * as crypto from 'crypto';

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

interface InvitationPermission {
  permission_code: string;
}

interface PermissionId {
  id: string;
}

interface CountResult {
  count: number;
}

interface IdResult {
  id: string;
}

// Get all invitations
export async function getAllInvitations(): Promise<Invitation[]> {
  try {
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
        branchName: invitation.branch_name || undefined,
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
    const result = await executeQuery<IdResult>(`
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
      const permissionIds = await executeQuery<PermissionId>(`
        SELECT id FROM Permissions WHERE permission_code IN (@permissionCodes)
      `, { permissionCodes: invitationData.permissions });

      // Insert invitation permissions
      for (const permId of permissionIds) {
        await executeQuery(`
          INSERT INTO InvitationPermissions (invitation_id, permission_id)
          VALUES (@invitationId, @permissionId)
        `, {
          invitationId,
          permissionId: permId.id
        });
      }
    }

    // Get the created invitation with permissions
    const invitation = await getInvitationById(invitationId);
    if (!invitation) {
      throw new Error('Failed to retrieve created invitation');
    }

    return invitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

// Accept invitation
export async function acceptInvitation(token: string, password: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Get invitation details
    const invitations = await executeQuery<DBInvitation>(`
      SELECT i.id, i.email, i.role, i.branch_id, i.expires_at, i.status
      FROM Invitations i
      WHERE i.token = @token
    `, { token });

    if (invitations.length === 0) {
      return { success: false, message: 'Convite não encontrado' };
    }

    const invitation = invitations[0];

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, message: 'Convite expirado' };
    }

    // Check if invitation is already accepted
    if (invitation.status === 'aceito') {
      return { success: false, message: 'Convite já foi aceito' };
    }

    // Check if user already exists
    const existingUsers = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Users WHERE email = @email
    `, { email: invitation.email });

    if (existingUsers[0]?.count > 0) {
      return { success: false, message: 'Já existe um usuário com este email' };
    }

    // Create user
    const userResult = await executeQuery<IdResult>(`
      INSERT INTO Users (email, password, role, branch_id)
      VALUES (@email, @password, @role, @branchId);
      SELECT SCOPE_IDENTITY() AS id;
    `, {
      email: invitation.email,
      password,
      role: invitation.role,
      branchId: invitation.branch_id
    });

    const userId = userResult[0]?.id;

    if (!userId) {
      return { success: false, message: 'Erro ao criar usuário' };
    }

    // Add user permissions
    const permissions = await executeQuery<InvitationPermission>(`
      SELECT p.permission_code
      FROM InvitationPermissions ip
      JOIN Permissions p ON ip.permission_id = p.id
      WHERE ip.invitation_id = @invitationId
    `, { invitationId: invitation.id });

    for (const permission of permissions) {
      const permId = await executeQuery<PermissionId>(`
        SELECT id FROM Permissions WHERE permission_code = @permissionCode
      `, { permissionCode: permission.permission_code });

      if (permId[0]?.id) {
        await executeQuery(`
          INSERT INTO UserPermissions (user_id, permission_id)
          VALUES (@userId, @permissionId)
        `, {
          userId,
          permissionId: permId[0].id
        });
      }
    }

    // Update invitation status
    await executeQuery(`
      UPDATE Invitations
      SET status = 'aceito', accepted_at = GETDATE()
      WHERE id = @invitationId
    `, { invitationId: invitation.id });

    return { success: true };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, message: 'Erro ao aceitar convite' };
  }
}

// Revoke invitation
export async function revokeInvitation(invitationId: string): Promise<{ success: boolean, message?: string }> {
  try {
    // Check if invitation exists
    const invitationExists = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Invitations WHERE id = @invitationId
    `, { invitationId });

    if (invitationExists[0]?.count === 0) {
      return { success: false, message: 'Convite não encontrado' };
    }

    // Delete invitation permissions
    await executeQuery(`
      DELETE FROM InvitationPermissions
      WHERE invitation_id = @invitationId
    `, { invitationId });

    // Delete invitation
    await executeQuery(`
      DELETE FROM Invitations
      WHERE id = @invitationId
    `, { invitationId });

    return { success: true };
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return { success: false, message: 'Erro ao revogar convite' };
  }
}

// Resend invitation
export async function resendInvitation(invitationId: string, expiryDays: number): Promise<{ success: boolean, token?: string, message?: string }> {
  try {
    // Check if invitation exists
    const invitationExists = await executeQuery<CountResult>(`
      SELECT COUNT(*) as count FROM Invitations WHERE id = @invitationId
    `, { invitationId });

    if (invitationExists[0]?.count === 0) {
      return { success: false, message: 'Convite não encontrado' };
    }

    // Generate new token and expiry date
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Update invitation
    await executeQuery(`
      UPDATE Invitations
      SET token = @token,
          expires_at = @expiresAt,
          status = 'pendente',
          accepted_at = NULL
      WHERE id = @invitationId
    `, {
      token,
      expiresAt: expiresAt.toISOString(),
      invitationId
    });

    return { success: true, token };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return { success: false, message: 'Erro ao reenviar convite' };
  }
}

// Get invitation by ID
export async function getInvitationById(invitationId: string): Promise<Invitation | null> {
  try {
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

    // Get permissions
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
      branchName: invitation.branch_name || undefined,
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
