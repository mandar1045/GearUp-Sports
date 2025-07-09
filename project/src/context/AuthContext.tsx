import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  preferences?: {
    favoriteCategories: string[];
    currency: string;
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  profile?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
    interests?: string[];
  };
  stats?: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    loyaltyPoints: number;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => User[];
  getUserCount: () => number;
  searchUsers: (query: string) => User[];
  getUsersByRole: (role: string) => User[];
  updateUserRole: (userId: string, role: User['role']) => Promise<{ success: boolean; error?: string }>;
  deactivateUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  activateUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  exportUsers: () => string;
  importUsers: (csvData: string) => Promise<{ success: boolean; imported: number; errors: string[] }>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize with demo users
  useEffect(() => {
    const initializeUsers = () => {
      const defaultUsers: User[] = [
        {
          id: 'admin-1',
          email: 'mandarjoshi1045@gmail.com',
          name: 'Mandar Joshi',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
          createdAt: new Date().toISOString(),
          isActive: true,
          role: 'admin',
          preferences: {
            favoriteCategories: [],
            currency: 'INR',
            notifications: true,
            theme: 'light',
            language: 'en'
          },
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            loyaltyPoints: 0
          }
        },
        {
          id: 'demo-1',
          email: 'demo@gearupsports.com',
          name: 'Demo User',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
          createdAt: new Date().toISOString(),
          isActive: true,
          role: 'user',
          preferences: {
            favoriteCategories: [],
            currency: 'INR',
            notifications: true,
            theme: 'light',
            language: 'en'
          },
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            loyaltyPoints: 0
          }
        }
      ];

      const savedUsers = localStorage.getItem('gearup_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        setUsers(defaultUsers);
        localStorage.setItem('gearup_users', JSON.stringify(defaultUsers));
      }
    };

    initializeUsers();
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check credentials
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }

      // Simple password check (in real app, this would be hashed)
      const validPasswords: Record<string, string> = {
        'mandarjoshi1045@gmail.com': 'admin123',
        'demo@gearupsports.com': 'demo123'
      };

      if (validPasswords[email] !== password) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }

      if (!foundUser.isActive) {
        setIsLoading(false);
        return { success: false, error: 'Account is deactivated. Please contact support.' };
      }

      // Update last login
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: 'An account with this email already exists' };
      }

      if (!name.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Name is required' };
      }

      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=100&rounded=true`,
        createdAt: new Date().toISOString(),
        isActive: true,
        role: 'user',
        preferences: {
          favoriteCategories: [],
          currency: 'INR',
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0
        }
      };

      const updatedUsers = [...users, userData];
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'An error occurred during registration' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Failed to update profile' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // User management functions
  const getAllUsers = (): User[] => {
    return users;
  };

  const getUserCount = (): number => {
    return users.length;
  };

  const searchUsers = (query: string): User[] => {
    return users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getUsersByRole = (role: string): User[] => {
    return users.filter(user => user.role === role);
  };

  const updateUserRole = async (userId: string, role: User['role']): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, role } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update user role' };
    }
  };

  const deactivateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isActive: false } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to deactivate user' };
    }
  };

  const activateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isActive: true } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to activate user' };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  };

  const exportUsers = (): string => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Created At', 'Last Login', 'Active'];
    const csvData = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        user.createdAt,
        user.lastLogin || '',
        user.isActive
      ].join(','))
    ].join('\n');
    return csvData;
  };

  const importUsers = async (csvData: string): Promise<{ success: boolean; imported: number; errors: string[] }> => {
    const lines = csvData.split('\n');
    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',');
        if (values.length < 3) continue;

        const email = values[2]?.replace(/"/g, '');
        const name = values[1]?.replace(/"/g, '');
        
        if (!email || !name) {
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        if (users.find(u => u.email === email)) {
          errors.push(`Line ${i + 1}: Email ${email} already exists`);
          continue;
        }

        const newUser: User = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          email,
          name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=100&rounded=true`,
          createdAt: new Date().toISOString(),
          isActive: true,
          role: 'user',
          preferences: {
            favoriteCategories: [],
            currency: 'INR',
            notifications: true,
            theme: 'light',
            language: 'en'
          },
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            loyaltyPoints: 0
          }
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('gearup_users', JSON.stringify(updatedUsers));
        imported++;
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: true, imported, errors };
  };

  const isAdmin = (): boolean => {
    return user?.email === 'mandarjoshi1045@gmail.com';
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    getAllUsers,
    getUserCount,
    searchUsers,
    getUsersByRole,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
    exportUsers,
    importUsers,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};