import axios from 'axios';

const API_URL = 'http://localhost:8080/doan';

interface ApiResponse<T> {
  status: number;
  message?: string;
  result: T;
}

interface SearchResponseData {
  products: any[]; // TODO: Define a proper Product interface if needed
  categories: any[]; // TODO: Define a proper Category interface if needed
}

export const search = async (searchTerm: string): Promise<ApiResponse<SearchResponseData>> => {
  const response = await axios.get<ApiResponse<SearchResponseData>>(`${API_URL}/search`, {
    params: {
      term: searchTerm
    }
  });
  return response.data;
}; 