import axios from 'axios';

// Create axios instance with base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { userId: string; password: string }) => 
    api.post('/api/auth/login', credentials),
  
  register: (userData: any) => 
    api.post('/api/auth/register', userData),
  
  verifyToken: () => 
    api.get('/api/auth/verify'),
};

// Student API calls
export const studentAPI = {
  getProfile: () => 
    api.get('/api/student/profile'),
  
  getAttendance: () => 
    api.get('/api/student/attendance'),
  
  getRoutine: () => 
    api.get('/api/student/routine'),
  
  getAnnouncements: () => 
    api.get('/api/student/announcements'),
};

// Teacher API calls
export const teacherAPI = {
  getProfile: () => 
    api.get('/api/teacher/profile'),
  
  getClasses: () => 
    api.get('/api/teacher/classes'),
  
  markAttendance: (data: any) => 
    api.post('/api/teacher/attendance', data),
  
  createAnnouncement: (data: any) => 
    api.post('/api/teacher/announcement', data),
};

// Admin API calls
export const adminAPI = {
  getUsers: () =>
    api.get('/api/admin/users'),
  
  createUser: (userData: any) =>
    api.post('/api/admin/users', userData),
  
  updateUser: (id: string, userData: any) =>
    api.put(`/api/admin/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    api.delete(`/api/admin/users/${id}`),
  
  getInstitution: () =>
    api.get('/api/admin/institution'),
  
  updateInstitution: (data: any) =>
    api.put('/api/admin/institution', data),
  
  generateRoutine: (routineData: any) =>
    api.post('/api/admin/routine/generate', routineData),
};

export default api;