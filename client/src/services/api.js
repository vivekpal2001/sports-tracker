import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const workoutAPI = {
  getAll: (params = {}) => api.get('/workouts', { params }),
  getOne: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  getStats: (period = 'week') => api.get('/workouts/stats', { params: { period } }),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/workouts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const aiAPI = {
  analyze: () => api.get('/ai/analyze'),
  chat: (message) => api.post('/ai/chat', { message }),
  weeklySummary: () => api.get('/ai/weekly-summary')
};

export const exportAPI = {
  trainingPlan: () => api.get('/export/training-plan', { responseType: 'blob' })
};
