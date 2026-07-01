import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.data.accessToken);
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  changePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Layout API
export const layoutAPI = {
  getAll: () => api.get('/layouts'),
  getById: (id) => api.get(`/layouts/${id}`),
  create: (data) => api.post('/layouts', data),
  update: (id, data) => api.put(`/layouts/${id}`, data),
  delete: (id) => api.delete(`/layouts/${id}`),
  getSeats: (layoutId) => api.get(`/layouts/${layoutId}/seats`),
  createSeat: (layoutId, data) => api.post(`/layouts/${layoutId}/seats`, data),
  updateSeat: (layoutId, seatId, data) => api.put(`/layouts/${layoutId}/seats/${seatId}`, data),
  deleteSeat: (layoutId, seatId) => api.delete(`/layouts/${layoutId}/seats/${seatId}`),
};

// Booking API
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getByUser: (userId, date) => api.get(`/bookings/user/${userId}`, { params: { date } }),
  getByDate: (date) => api.get(`/bookings/date/${date}`),
  getBySeat: (seatId, date) => api.get(`/bookings/seat/${seatId}`, { params: { date } }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id) => api.post(`/admin/users/${id}/block`),
  unblockUser: (id) => api.post(`/admin/users/${id}/unblock`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),
};

// Check-In API
export const checkInAPI = {
  getMyStatus: () => api.get('/checkin/status'),
  getTodayCheckIns: () => api.get('/checkin/today'), // admin only
};

