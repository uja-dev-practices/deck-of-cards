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
    const response = await api.post('/criteria/doc-mf/build', payload);
    return response.data;
  } catch (error) {
    console.error('Error building fuzzy graph:', error);
    throw error.response?.data?.detail || error.message;
  }


};