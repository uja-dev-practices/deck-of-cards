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
    // Si es un error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // SOLUCIÓN: Solo recargamos y redirigimos si NO estamos ya en /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Propagamos el error para que los componentes puedan leer backendData
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