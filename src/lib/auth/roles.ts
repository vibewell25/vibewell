export type Role = 'admin' | 'business' | 'user';

export type Permission =
  | 'manage_users'
  | 'manage_businesses'
  | 'manage_content'
  | 'manage_services'
  | 'manage_bookings'
  | 'manage_inventory'
  | 'view_analytics'
  | 'manage_reviews'
  | 'manage_loyalty'
  | 'view_content'
  | 'book_services'
  | 'write_reviews'
  | 'earn_points';

interface RolePermissions {
  [key: string]: Permission[];
}

export const rolePermissions: RolePermissions = {
  admin: [
    'manage_users',
    'manage_businesses',
    'manage_content',
    'manage_services',
    'manage_bookings',
    'manage_inventory',
    'view_analytics',
    'manage_reviews',
    'manage_loyalty',
  ],
  business: [
    'manage_services',
    'manage_bookings',
    'manage_inventory',
    'view_analytics',
    'manage_reviews',
    'manage_loyalty',
  ],
  user: [
    'view_content',
    'book_services',
    'write_reviews',
    'earn_points',
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) || false;
};

export const getRolePermissions = (role: Role): Permission[] => {
  return rolePermissions[role] || [];
}; 