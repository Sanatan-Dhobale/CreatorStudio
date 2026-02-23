import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('creatorhub_token'));

  // Set axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setCreator(res.data.creator);
        } catch {
          localStorage.removeItem('creatorhub_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, creator: newCreator } = res.data;
    localStorage.setItem('creatorhub_token', newToken);
    setToken(newToken);
    setCreator(newCreator);
    return newCreator;
  };

  const register = async (name, username, email, password) => {
    const res = await axios.post('/api/auth/register', { name, username, email, password });
    const { token: newToken, creator: newCreator } = res.data;
    localStorage.setItem('creatorhub_token', newToken);
    setToken(newToken);
    setCreator(newCreator);
    return newCreator;
  };

  const logout = () => {
    localStorage.removeItem('creatorhub_token');
    setToken(null);
    setCreator(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateCreator = (updatedData) => {
    setCreator(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ creator, loading, token, login, register, logout, updateCreator }}>
      {children}
    </AuthContext.Provider>
  );
};
