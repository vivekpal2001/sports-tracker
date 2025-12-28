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
  getChartData: (params = {}) => api.get('/workouts/chart-data', { params }),
  getRecoveryScore: () => api.get('/workouts/recovery'),
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

export const prAPI = {
  getAll: () => api.get('/pr'),
  getHistory: (type) => api.get(`/pr/history/${type}`)
};

export const goalAPI = {
  getAll: (status) => api.get('/goals', { params: { status } }),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`)
};

export const badgeAPI = {
  getAll: () => api.get('/badges'),
  getDefinitions: () => api.get('/badges/definitions'),
  sync: () => api.post('/badges/sync')
};

export const trainingPlanAPI = {
  getAll: (status) => api.get('/training-plans', { params: { status } }),
  getOne: (id) => api.get(`/training-plans/${id}`),
  generate: (data) => api.post('/training-plans/generate', data),
  completeWorkout: (id, data) => api.put(`/training-plans/${id}/workout`, data),
  delete: (id) => api.delete(`/training-plans/${id}`)
};

export const userAPI = {
  getMyProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getPublicProfile: (id) => api.get(`/users/${id}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  search: (q) => api.get('/users/search', { params: { q } })
};

export const feedAPI = {
  getFeed: (page = 1) => api.get('/feed', { params: { page } }),
  getUserActivities: (id, page = 1) => api.get(`/feed/user/${id}`, { params: { page } }),
  like: (id) => api.post(`/feed/${id}/like`),
  react: (id, reactionType) => api.post(`/feed/${id}/react`, { reactionType }),
  comment: (id, text) => api.post(`/feed/${id}/comment`, { text }),
  deleteComment: (id, commentId) => api.delete(`/feed/${id}/comment/${commentId}`),
  createPost: (data) => api.post('/feed/post', data),
  deletePost: (id) => api.delete(`/feed/${id}`)
};

export const leaderboardAPI = {
  getFriends: (period, metric) => api.get('/leaderboard', { params: { period, metric } }),
  getGlobal: (period, metric) => api.get('/leaderboard/global', { params: { period, metric } })
};

export const notificationAPI = {
  getAll: (page = 1) => api.get('/notifications', { params: { page } }),
  getCount: () => api.get('/notifications/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const uploadAPI = {
  images: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};


