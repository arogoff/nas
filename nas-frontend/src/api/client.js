import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to token expiration and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token available, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // Attempt to get new access token
        const { data } = await axios.post(
          'http://localhost:3000/api/auth/refresh', 
          { refreshToken },
          { withCredentials: true }
        );
        
        // Update stored access token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Update default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // For all other errors, just return the error
    return Promise.reject(error);
  }
);

export default api;