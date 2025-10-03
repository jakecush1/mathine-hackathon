import axios from 'axios'

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  //baseURL: `api/`,
  timeout: 10000,
  withCredentials: true, // Ensure cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
    }
    return Promise.reject(error)
  }
)

export default apiClient