import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import API from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'hostel_admin' | 'student' | 'security';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data.data.user))
        .catch(() => { localStorage.removeItem('accessToken'); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post('/auth/login', { email, password });
    const { user, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    const res = await API.post('/auth/register', data);
    const { user, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch (e) { }
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
