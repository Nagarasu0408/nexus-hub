import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler — auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexus_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  me:       ()      => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Tools ─────────────────────────────────────────────────────
export const toolsAPI = {
  getAll:     ()        => api.get('/tools'),
  connect:    (key)     => api.post(`/tools/${key}/connect`),
  disconnect: (key)     => api.post(`/tools/${key}/disconnect`),
  stats:      ()        => api.get('/tools/stats'),
};

// ── Workflows ─────────────────────────────────────────────────
export const workflowsAPI = {
  getAll:   (params)  => api.get('/workflows', { params }),
  getOne:   (id)      => api.get(`/workflows/${id}`),
  create:   (data)    => api.post('/workflows', data),
  update:   (id,data) => api.put(`/workflows/${id}`, data),
  delete:   (id)      => api.delete(`/workflows/${id}`),
  toggle:   (id)      => api.post(`/workflows/${id}/toggle`),
  execute:  (id)      => api.post(`/workflows/${id}/execute`),
  executions: (id)    => api.get(`/workflows/${id}/executions`),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardAPI = {
  stats:    () => api.get('/dashboard/stats'),
  activity: () => api.get('/dashboard/activity'),
  chart:    () => api.get('/dashboard/chart'),
};

// ── AI ────────────────────────────────────────────────────────
export const aiAPI = {
  generate: (prompt)   => api.post('/ai/generate', { prompt }),
  chat:     (messages) => api.post('/ai/chat', { messages }),
  optimize: (data)     => api.post('/ai/optimize', data),
};

export default api;
