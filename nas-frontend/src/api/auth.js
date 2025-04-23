import api from './client';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const refreshToken = () => {
  return api.post('/auth/refresh');
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  return api.post('/auth/logout');
};

export const createUser = (userData) => {
  return api.post('/auth/register', userData); // Admin-only
};
