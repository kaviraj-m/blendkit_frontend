// Role-based access control utility

// Define permissions for each role
export const rolePermissions = {
  student: [
    'view_gym_schedule',
    'view_gym_posts',
    'view_equipment',
    'view_own_attendance',
  ],
  staff: [
    'view_gym_schedule',
    'view_gym_posts',
    'view_equipment',
    'view_students',
    'manage_students',
  ],
  gym_staff: [
    'view_gym_schedule',
    'manage_gym_schedule',
    'view_gym_posts',
    'manage_gym_posts',
    'view_equipment',
    'manage_equipment',
    'view_attendance',
    'manage_attendance',
  ],
  security: [
    'view_gate_passes',
    'verify_gate_passes',
    'view_attendance',
    'view_gym_schedule',
    'view_gym_posts',
    'view_equipment',
  ],
  executive_director: [
    'view_gym_schedule',
    'manage_gym_schedule',
    'view_gym_posts',
    'manage_gym_posts',
    'view_equipment',
    'manage_equipment',
    'view_attendance',
    'manage_attendance',
    'view_students',
    'manage_students',
    'view_staff',
    'manage_staff',
    'view_reports',
    'manage_reports',
    'view_analytics',
    'manage_budgets',
    'approve_purchases',
  ],
  admin: [
    'view_gym_schedule',
    'manage_gym_schedule',
    'view_gym_posts',
    'manage_gym_posts',
    'view_equipment',
    'manage_equipment',
    'view_attendance',
    'manage_attendance',
    'view_students',
    'manage_students',
    'view_staff',
    'manage_staff',
    'manage_roles',
  ],
};

// Check if a user has a specific permission
export const hasPermission = (userRole: any, permission: string): boolean => {
  if (!userRole || !permission) return false;
  
  // Extract role name (handle both string and object formats)
  let roleName: string;
  if (typeof userRole === 'string') {
    roleName = userRole.toLowerCase();
  } else if (userRole && typeof userRole === 'object' && 'name' in userRole) {
    roleName = (userRole.name as string).toLowerCase();
  } else {
    console.error('Invalid role format:', userRole);
    return false;
  }
  
  // Find the matching role in our permissions map (case-insensitive)
  const validRoles = Object.keys(rolePermissions);
  const matchedRole = validRoles.find(r => r.toLowerCase() === roleName);
  
  if (!matchedRole) {
    console.warn(`Role '${roleName}' not found in permissions config`);
    return false;
  }
  
  // Check if the role has the requested permission
  const permissions = rolePermissions[matchedRole as keyof typeof rolePermissions] || [];
  return permissions.includes(permission);
};

// Get all permissions for a role
export const getRolePermissions = (role: string): string[] => {
  return rolePermissions[role as keyof typeof rolePermissions] || [];
};

// Define dashboard routes accessible by each role
export const roleRoutes = {
  student: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/gym-posts', label: 'Fitness Posts' },
    { path: '/dashboard/equipment', label: 'Equipment' },
    { path: '/dashboard/attendance', label: 'My Attendance' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
  staff: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/students', label: 'Students' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/gym-posts', label: 'Fitness Posts' },
    { path: '/dashboard/equipment', label: 'Equipment' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
  security: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/security', label: 'Security Dashboard' },
    { path: '/dashboard/gate-pass', label: 'Gate Pass' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
  gym_staff: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/gym-posts', label: 'Fitness Posts' },
    { path: '/dashboard/equipment', label: 'Equipment' },
    { path: '/dashboard/attendance', label: 'Attendance' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
  executive_director: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/executive-director', label: 'Director Dashboard' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/gym-posts', label: 'Fitness Posts' },
    { path: '/dashboard/equipment', label: 'Equipment' },
    { path: '/dashboard/attendance', label: 'Attendance' },
    { path: '/dashboard/budget', label: 'Budget & Finance' },
    { path: '/dashboard/reports', label: 'Reports & Analytics' },
    { path: '/dashboard/staff', label: 'Staff Management' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
  admin: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/users', label: 'Users' },
    { path: '/dashboard/gym-schedule', label: 'Gym Schedule' },
    { path: '/dashboard/gym-posts', label: 'Fitness Posts' },
    { path: '/dashboard/equipment', label: 'Equipment' },
    { path: '/dashboard/attendance', label: 'Attendance' },
    { path: '/dashboard/profile', label: 'Profile' },
  ],
};

// Get routes accessible by a role
export const getAccessibleRoutes = (role: string) => {
  return roleRoutes[role as keyof typeof roleRoutes] || [];
};