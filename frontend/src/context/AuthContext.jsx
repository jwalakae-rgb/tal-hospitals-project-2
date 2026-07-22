import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('tal_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('tal_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, role) => {
  const { token, data } = await loginUser({
    email,
    password,
    role,
  });

  localStorage.setItem('tal_token', token);

  setUser(data.user);

  return data.user;
};

  const register = async (payload) => {
    const { token, data } = await registerUser(payload);
    localStorage.setItem('tal_token', token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore network errors on logout
    }
    localStorage.removeItem('tal_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
