import axios from "axios";

const BASE = "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (d) => api.post("/auth/register", d);
export const login = (d) => api.post("/auth/login", d);
export const getMe = () => api.get("/auth/me");

// Tasks
export const getTasks = (params) => api.get("/tasks", { params });
export const createTask = (d) => api.post("/tasks", d);
export const updateTask = (id, d) => api.patch(`/tasks/${id}`, d);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Admin
export const getUsers = () => api.get("/admin/users");
export const updateUser = (id, d) => api.patch(`/admin/users/${id}`, d);

export default api;