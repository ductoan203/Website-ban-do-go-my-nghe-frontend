import axios from 'axios';

const API_URL = 'http://localhost:8080/doan/payment/payos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PayOSCreateRequest {
  orderCode: number;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface PayOSResponse {
  code: number;
  message: string;
  result: {
    checkoutUrl: string;
  };
}

export const createPaymentLink = async (request: PayOSCreateRequest) => {
  const response = await axios.post<PayOSResponse>(`${API_URL}/create`, request, {
    headers: getAuthHeaders(),
  });
  return response.data.result.checkoutUrl;
};

export const openPaymentInNewTab = (url: string) => {
  window.open(url, '_blank');
};

export const handlePayOSResponse = (response: PayOSResponse) => {
  if (response.code === 0 && response.message === "Thành công" && response.result?.checkoutUrl) {
    openPaymentInNewTab(response.result.checkoutUrl);
    return true;
  }
  return false;
}; 