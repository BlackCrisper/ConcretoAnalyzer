"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface BranchOffice {
  id: string;
  name: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  branches: BranchOffice[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  companyId: string;
  branchId: string | null;
  branchName: string | null;
  permissions: string[];
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  branchId: string | null;
  branchName?: string;
  expiresAt: string;
  createdAt: string;
  status: 'pendente' | 'aceito' | 'expirado';
  token: string;
  acceptedAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isUserInBranch: (branchId: string) => boolean;
  createInvitation: (invitation: Omit<Invitation, 'id' | 'createdAt' | 'status' | 'token'>) => Promise<Invitation>;
  updateUserPermissions: (userId: string, permissions: string[]) => Promise<boolean>;
  updateNotificationPreferences: (preferences: NotificationPreference[]) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based and granular permissions map (fallback/default permissions)
const roleBasePermissions = {
  superadmin: [
    'view:dashboard', 'view:clients', 'view:projects', 'view:reports', 'view:settings', 'view:users', 'view:companies',
    'create:client', 'create:project', 'create:user', 'create:company',
    'edit:client', 'edit:project', 'edit:user', 'edit:company',
    'delete:client', 'delete:project', 'delete:user', 'delete:company',
    'manage:invitations', 'manage:branches', 'manage:notifications'
  ],
  admin: [
    'view:dashboard', 'view:clients', 'view:projects', 'view:reports', 'view:settings', 'view:users',
    'create:client', 'create:project', 'create:user',
    'edit:client', 'edit:project', 'edit:user',
    'delete:client', 'delete:project', 'delete:user',
    'manage:invitations', 'manage:branches', 'manage:notifications'
  ],
  user: [
    'view:dashboard', 'view:clients', 'view:projects', 'view:reports',
    'create:project',
    'edit:project'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Check specific user permissions first
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }
    // If no specific permissions, use role-based permissions
    return roleBasePermissions[user.role as keyof typeof roleBasePermissions]?.includes(permission) || false;
  };

  // Check if user belongs to a specific branch
  const isUserInBranch = (branchId: string): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin') return true; // superadmin has access to all branches
    return user.branchId === branchId;
  };

  // Create new invitation
  const createInvitation = async (invitationData: Omit<Invitation, 'id' | 'createdAt' | 'status' | 'token'>): Promise<Invitation> => {
    try {
      // Use the API to create the invitation
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: invitationData.email,
          role: invitationData.role,
          branchId: invitationData.branchId,
          permissions: invitationData.permissions,
          expirationDays: 7 // Default to 7 days
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create invitation');
      }

      return data.invitation;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  };

  // Update user permissions
  const updateUserPermissions = async (userId: string, permissions: string[]): Promise<boolean> => {
    try {
      // Use the API to update user permissions
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return false;
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (preferences: NotificationPreference[]): Promise<boolean> => {
    try {
      // This would make a call to update notification preferences
      // For now, we're just returning true as this is not implemented yet
      if (!user) return false;
      console.log(`Updating notification preferences for user ${user.id}:`, preferences);
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for stored user on initial load
    const checkAuth = () => {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        // If user data is stored in session, use it
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.permissions) {
          parsedUser.permissions = roleBasePermissions[parsedUser.role as keyof typeof roleBasePermissions] || [];
          parsedUser.branchId = parsedUser.role === 'superadmin' ? null : '1';
          parsedUser.branchName = parsedUser.role === 'superadmin' ? null : 'Matriz';
          sessionStorage.setItem('currentUser', JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Protected route logic
    if (!isLoading) {
      const publicRoutes = ['/', '/forgot-password', '/contact', '/reset-password'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success || !data.user) {
        console.error('Login failed:', data.message);
        return false;
      }

      // Set user data
      setUser(data.user);
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      hasPermission,
      isUserInBranch,
      createInvitation,
      updateUserPermissions,
      updateNotificationPreferences
    }}>
      {isLoading ? (
        // Loading state
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
