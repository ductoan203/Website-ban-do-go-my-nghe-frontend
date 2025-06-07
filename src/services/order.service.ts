import axios from 'axios';

export interface OrderItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  cancelledBy?: string;
}

const API_URL = 'http://localhost:8080/doan/orders';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    const res = await axios.get(`${API_URL}`, { headers: getAuthHeaders() });
    return (res.data as { result: Order[] }).result;
  },
  cancelOrder: async (orderId: number) => {
    const res = await axios.put(`${API_URL}/cancel/${orderId}`, {}, { headers: getAuthHeaders() });
    return (res.data as { result: any }).result;
  },
  returnOrder: async (orderId: number) => {
    const res = await axios.put(`${API_URL}/return/${orderId}`, {}, { headers: getAuthHeaders() });
    return (res.data as { result: any }).result;
  },
};

export const deleteOrder = async (id: number) => {
  return axios.delete(`/api/admin/orders/${id}`);
};

export default orderService; 