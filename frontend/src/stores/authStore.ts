import { create } from 'zustand';
import request from '@/utils/request';

interface User {
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  company?: string;
  phone?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterData {
  username: string;
  password: string;
  email?: string;
  company?: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  setUser: (user: User) => void;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true });
    try {
      const res = (await request.post('/auth/login', {
        username,
        password,
      })) as unknown as { access_token: string; user: User };
      const { access_token, user } = res;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token: access_token, user, isLoggedIn: true, loading: false });
    } catch (error) {
      set({ loading: false });
      const message = error instanceof Error ? error.message : '登录失败，请重试';
      throw new Error(message);
    }
  },

  register: async (data: RegisterData) => {
    set({ loading: true });
    try {
      await request.post('/auth/register', data);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      const message = error instanceof Error ? error.message : '注册失败，请重试';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isLoggedIn: false });
    window.location.href = '/login';
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user: User | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr) as User;
      } catch {
        localStorage.removeItem('user');
      }
    }
    set({ token, user, isLoggedIn: !!token });
  },

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },
}));

// Initialize from storage on module load
useAuthStore.getState().loadFromStorage();

export { useAuthStore };
export type { User, RegisterData };
export default useAuthStore;
