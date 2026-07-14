import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mj_user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mj_token', data.token);
    localStorage.setItem('mj_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  async function register(nama, email, password) {
    await api.post('/auth/register', { nama, email, password });
    return login(email, password);
  }

  function logout() {
    localStorage.removeItem('mj_token');
    localStorage.removeItem('mj_user');
    setUser(null);
  }

  function updateUser(partial) {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('mj_user', JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
