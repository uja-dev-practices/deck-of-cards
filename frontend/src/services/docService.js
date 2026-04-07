import api from '../lib/api';

export const calculateValueFunction = async (payload) => {
  try {
    const response = await api.post('/criteria/doc/value-function', payload);
    return response.data;
  } catch (error) {
    console.error('Error calculating value function:', error);
    throw error.response?.data?.detail || error.message;
  }
};

export const buildFuzzyGraph = async (payload) => {
  try {
    const response = await api.post('/criteria/doc-it2mf/build', payload);
    return response.data;
  } catch (error) {
    console.error('Error building fuzzy graph:', error);
    throw error.response?.data?.detail || error.message;
  }
};

export const saveToHistory = async (payload) => {
  try {
    const response = await api.post('/history/add', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving to history:', error);
    throw error.response?.data?.detail || error.message;
  }
};

export const getUserHistory = async () => {
  try {
    const response = await api.get('/history/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error.response?.data?.detail || error.message;
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    const response = await api.delete(`/history/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error.response?.data?.detail || error.message;
  }
};