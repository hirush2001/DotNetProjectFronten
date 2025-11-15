// In: /src/services/api.js
import axios from 'axios';

// Use your backend's port. You used http://localhost:5011
const API_BASE_URL = 'http://localhost:5011/api';

// Create a function to get all clients
export const getClients = async () => {
  const response = await axios.get(`${API_BASE_URL}/clients`);
  return response.data;
};

// We will add getItems here later