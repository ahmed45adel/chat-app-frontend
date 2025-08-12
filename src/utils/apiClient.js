import axios from "axios";
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies to the server
});

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = Cookies.get('chat-user');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;