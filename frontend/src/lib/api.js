import Axios from 'axios';
import { API_BASE_URL } from '../config';

const api = Axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response && error.response.data) {
        return Promise.reject({ 
            ...error, 
            backendData: error.response.data 
        });
    }

    return Promise.reject(error); 
  }
);

export default api;