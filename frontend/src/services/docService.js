import api from '../lib/api';

export const calculateValueFunction = async (payload) => {
  try {
    const response = await api.post('/criteria/doc/value-function', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

export const buildFuzzyGraph = async (payload) => {
  try {
    const response = await api.post('/criteria/doc-it2mf/build', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

export const saveToHistory = async (payload) => {
  try {
    const response = await api.post('/history/add', payload);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

export const getUserHistory = async () => {
  try {
    const response = await api.get('/history/user');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};