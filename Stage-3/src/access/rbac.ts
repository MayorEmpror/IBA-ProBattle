import type { Access } from 'payload'

/**
 * RBAC (Role-Based Access Control) helpers
 * Hierarchical permissions: admin > moderator > provider > seeker
 */

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isModeratorOrAbove: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'moderator'
}

export const isProviderOrAbove: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'provider'
}

export const canModerate: Access = ({ req: { user } }) => {
  // Admins and moderators can moderate content
  return user?.role === 'admin' || user?.role === 'moderator'
}

export const canManageUsers: Access = ({ req: { user } }) => {
  // Only admins can manage users
  return user?.role === 'admin'
}

export const canViewAnalytics: Access = ({ req: { user } }) => {
  // Admins and moderators can view analytics
  return user?.role === 'admin' || user?.role === 'moderator'
}
