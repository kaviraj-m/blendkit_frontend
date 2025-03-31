import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext();

// Export the hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define sample users for different roles
  const sampleUsers = {
    admin: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: {
        id: 1,
        name: 'admin'
      }
    },
    student: {
      id: 2,
      name: 'Student User',
      email: 'student@example.com',
      role: {
        id: 2,
        name: 'student'
      }
    },
    gym_staff: {
      id: 3,
      name: 'Gym Staff',
      email: 'gym@example.com',
      role: {
        id: 3,
        name: 'gym_staff'
      }
    },
    staff: {
      id: 4,
      name: 'College Staff',
      email: 'staff@example.com',
      role: {
        id: 4,
        name: 'staff'
      }
    }
  };

  // Initialize with a default student user
  useEffect(() => {
    // Default to student role
    setUser(sampleUsers.student);
    setLoading(false);
    console.log('Auto-initialized student user');
  }, []);

  // Function to switch between user roles
  const switchRole = (roleName) => {
    const newUser = sampleUsers[roleName] || sampleUsers.student;
    setUser(newUser);
    console.log(`Switched to ${roleName} role`);
  };

  // Simple logout function
  const logout = () => {
    setUser(null);
    console.log('User logged out');
  };

  // Provide the auth context values to children
  const value = {
    user,
    loading,
    logout,
    switchRole,
    availableRoles: Object.keys(sampleUsers)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 