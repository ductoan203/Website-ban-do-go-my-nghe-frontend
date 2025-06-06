import axios from 'axios';
import { toast } from 'react-toastify';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Interface cho cấu trúc item giỏ hàng trả về từ backend
interface BackendCartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number; // Tổng tiền cho item này (backend tính)
  thumbnailUrl: string; // URL ảnh từ backend
}

// Interface cho cấu trúc response từ API /cart
interface GetCartResponse {
  items: BackendCartItem[];
  total: number; // Tổng tiền toàn bộ giỏ hàng (backend tính)
}

const API = 'http://localhost:8080/doan/cart';

function getToken() {
  return localStorage.getItem('token');
}

const cartService = {
  async getCart(): Promise<CartItem[]> {
    const token = getToken();
    // Sử dụng generic type để TypeScript biết cấu trúc response
    const res = await axios.get<GetCartResponse>(API, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // Dữ liệu giỏ hàng nằm trực tiếp trong res.data
    const cartData = res.data;

    // Ánh xạ dữ liệu từ backend format sang frontend format CartItem
    const items = cartData?.items || [];
    return items.map((item: BackendCartItem) => ({
      id: item.productId,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      image: item.thumbnailUrl
        ? `http://localhost:8080/doan${item.thumbnailUrl}` // Xây dựng URL ảnh đầy đủ
        : '/default.jpg', // Ảnh mặc định nếu không có
    }));
  },

  async addToCart(productId: number, quantity: number) {
    const token = getToken();
    try {
      await axios.post(`${API}/add`, { productId, quantity }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Có thể thêm toast thành công ở đây nếu muốn
      // toast.success('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Kiểm tra mã lỗi cụ thể từ backend
        if (error.response.data && error.response.data.code === 1023) {
          toast.error(error.response.data.message || 'Số lượng sản phẩm trong giỏ hàng vượt quá tồn kho');
        } else {
          // Xử lý các lỗi khác nếu có
          toast.error('Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.');
        }
      } else {
        // Xử lý lỗi không phải từ axios
        toast.error('Đã xảy ra lỗi không xác định.');
      }
      throw error; // Re-throw lỗi để component gọi có thể xử lý thêm nếu cần
    }
  },

  async updateCartItem(productId: number, quantity: number) {
    const token = getToken();
    await axios.put(`${API}/update`, { productId, quantity }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  async removeFromCart(productId: number) {
    const token = getToken();
    await axios.delete(`${API}/delete/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default cartService;
