import axios from "axios";
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true, // send cookies to the server
});

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = Cookies.get('chat-user') || localStorage.getItem("chat-user", JSON.stringify(data));
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