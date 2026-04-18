import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Blog API
export const blogApi = {
  getPosts: (page = 1, limit = 10) =>
    api.get(`/blog?page=${page}&limit=${limit}`),
  getPost: (id: number) => api.get(`/blog/${id}`),
  createPost: (data: any) => api.post('/blog', data),
  updatePost: (id: number, data: any) => api.put(`/blog/${id}`, data),
  deletePost: (id: number) => api.delete(`/blog/${id}`),
  likePost: (id: number) => api.post(`/blog/${id}/like`),
}

// Album API
export const albumApi = {
  getAlbums: () => api.get('/album'),
  getAlbum: (id: number) => api.get(`/album/${id}`),
  createAlbum: (data: any) => api.post('/album', data),
  addPhoto: (albumId: number, data: any) =>
    api.post(`/album/${albumId}/photos`, data),
}

// Diary API
export const diaryApi = {
  getDiaries: (page = 1, limit = 20) =>
    api.get(`/diary?page=${page}&limit=${limit}`),
  createDiary: (data: any) => api.post('/diary', data),
  updateDiary: (id: number, data: any) => api.put(`/diary/${id}`, data),
  deleteDiary: (id: number) => api.delete(`/diary/${id}`),
}
