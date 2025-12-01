import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginStudent: (studentId: string, birthDate: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('catechism_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === '123456') {
      setUser(foundUser);
      localStorage.setItem('catechism_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const loginStudent = useCallback(async (studentId: string, birthDate: string): Promise<boolean> => {
    // Mock student login
    const mockStudent: User = {
      id: 'student-1',
      name: 'Nguyễn Hoàng Anh',
      role: 'student',
      studentId: studentId,
      birthDate: birthDate
    };
    
    if (studentId === 'HS2024001' && birthDate === '2010-03-15') {
      setUser(mockStudent);
      localStorage.setItem('catechism_user', JSON.stringify(mockStudent));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('catechism_user');
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginStudent, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
