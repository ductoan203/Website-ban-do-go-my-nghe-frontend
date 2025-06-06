import axios from 'axios';

export interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  verified: boolean;
}

export interface UpdateUserProfile {
  fullname: string;
  phoneNumber?: string;
  address?: string;
  password?: string;
}

export interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: string;
}

const API_URL = 'http://localhost:8080/doan/user';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await axios.get(`${API_URL}`, { headers: getAuthHeaders() });
    return (res.data as { result: UserProfile }).result;
  },
  updateProfile: async (data: UpdateUserProfile): Promise<UserProfile> => {
    const res = await axios.put(`${API_URL}`, data, { headers: getAuthHeaders() });
    return (res.data as { result: UserProfile }).result;
  },
  getOrders: async (): Promise<Order[]> => {
    const res = await axios.get(`${API_URL}/orders`, { headers: getAuthHeaders() });
    return (res.data as { result: Order[] }).result;
  },
  cancelOrder: async (orderId: number) => {
    const res = await axios.put(`http://localhost:8080/orders/cancel/${orderId}`, {}, { headers: getAuthHeaders() });
    return (res.data as { result: any }).result;
  },
};

export default userService;