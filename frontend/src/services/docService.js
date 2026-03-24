import axios from '../lib/axios';

export const calculateValueFunction = async (payload) => {
  try {
    const response = await axios.post('/criteria/doc/value-function', payload);
    return response.data; 
  } catch (error) {
    console.error("Error en calculateValueFunction:", error);
    throw error;
  }
};