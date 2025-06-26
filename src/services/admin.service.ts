import axios from 'axios';

const API_URL = 'http://localhost:8080/doan/admin';

export const getDashboardOverview = () => axios.get(`${API_URL}/dashboard/overview`);

export const getAllProducts = () => axios.get(`${API_URL}/products`);
export const getAllOrders = (status?: string) => axios.get(`${API_URL}/orders`, { params: { status } });
export const getAllUsers = () => axios.get(`${API_URL}/user`);
export const deleteProduct = (id: number) => axios.delete(`${API_URL}/products/${id}`);
// export const createProduct = (data: any) => axios.post(`${API_URL}/products`, data);
export const createProduct = (data: any) => {
    return axios.post(`${API_URL}/products`, data)
  }
  
export const updateProduct = (id: number, data: any) => axios.put(`${API_URL}/products/${id}`, data);

export const getAllCategories = (searchTerm?: string, page?: number, size?: number) =>
  axios.get(`${API_URL}/categories`, { params: { searchTerm, page, size } });

export const createCategory = (data: { name: string; description: string }) => axios.post(`${API_URL}/categories`, data);
export const updateCategory = (id: number, data: { name: string; description: string }) => axios.put(`${API_URL}/categories/${id}`, data);
export const deleteCategory = (id: number) => axios.delete(`${API_URL}/categories/${id}`);

export const getAllCustomers = (searchTerm?: string) =>  axios.get(`${API_URL}/user/customers`, { params: { searchTerm } });
export const updateCustomer = (id: number, data: any) => axios.put(`${API_URL}/user/${id}`, data);
export const deleteCustomer = (id: number) => axios.delete(`${API_URL}/user/${id}`);

// Function to create a new customer
export const createCustomer = (data: any) => axios.post(`${API_URL}/user/customers`, data);

export const getAllAdminOrders = (status?: string, page = 0, size = 15) => {
  return axios.get(`${API_URL}/orders`, {
    params: { status, page, size }
  });
};

export const updateOrderStatus = (id: number, status: string) =>
  axios.put(`${API_URL}/orders/${id}/status`, null, {
    params: { status },
  });

export const deleteOrder = (id: number) => 
  axios.delete(`${API_URL}/orders/${id}`);

export const getReportData = (startDate: string, endDate: string, status?: string) => axios.get(`${API_URL}/reports`, { params: { startDate, endDate, status } });

export const getPublicProducts = () => axios.get('http://localhost:8080/doan/products');

export const getPublicCategories = () => axios.get('http://localhost:8080/doan/categories');
  
interface Category {
  id: number
  name: string
  description: string
}

interface ApiResponse<T> {
  result: T;
  message?: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  // Thêm các trường phân trang khác nếu cần
}
  
