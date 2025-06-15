import axios from 'axios';

const API_URL = 'http://localhost:8080/doan';


interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export const sendContactMessage = async (message: ContactMessage) => {
  try {
    const response = await axios.post(`${API_URL}/contact`, message);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 