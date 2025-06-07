import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
// Định nghĩa types cục bộ dựa trên cấu trúc dữ liệu
interface ApiResponse<T> {
  code: number;
  message: string;
  result?: T;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Thêm optional image nếu có
}

interface OrderItemRequest {
  productId: number;
  quantity: number;
}

interface OrderRequest {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItemRequest[];
}

// interface OrderResponse đã được định nghĩa cục bộ nên giữ lại
interface OrderResponse {
  result: {
    id: string;
    total: number;
  }
}

interface MomoResponse {
  result: string;
}

const SHIPPING_FREE_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

const Checkout = () => {
  const { items, total, clearCart } = useCart(); // items sẽ có type CartItem[]
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
  });

  // Lấy thông tin user nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setForm({
          customerName: user.name || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          address: user.address || '',
          paymentMethod: 'cod',
        });
      } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
        setIsLoggedIn(false);
        // Có thể clear user/token sai ở đây nếu cần
      }
    } else {
      setIsLoggedIn(false);
      // Reset form về giá trị mặc định khi không đăng nhập
      setForm({
        customerName: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'cod',
      });
    }
  }, [localStorage.getItem('token'), localStorage.getItem('user')]); // Theo dõi cả token và user

  // Tính phí vận chuyển
  const shippingFee = total >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = total + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Gửi đơn hàng tới backend
      const token = localStorage.getItem('token');
      const orderPayload = {
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        shippingAddress: form.address,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentMethod === 'cod' ? 'UNPAID' : 'PENDING',
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })) as OrderItemRequest[] // Ép kiểu sang OrderItemRequest[]
      };

      console.log("Sending order request:", orderPayload);

      const response = await axios.post<OrderResponse>(
        'http://localhost:8080/doan/payment/checkout',
        orderPayload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("✅ Order request successful. Response:", response.data);

      const order = response.data.result;

      if (form.paymentMethod === 'momo') {
        try {
          const momoResponse = await axios.post<ApiResponse<string>>(
            'http://localhost:8080/doan/payment/momo/create',
            null,
            {
              params: {
                orderId: order.id,
                amount: Math.round(order.total), // Đảm bảo amount là số nguyên
              },
            }
          );

          console.log("🌐 Momo URL trả về:", momoResponse.data);

          if (momoResponse.data.result) {
            // Chuyển hướng người dùng đến URL Momo để thanh toán
            window.location.href = momoResponse.data.result;
          } else {
            setError("Không nhận được URL thanh toán từ Momo");
          }
        } catch (momoErr: any) {
          console.error("❌ Lỗi khi tạo URL Momo:", momoErr.response?.data || momoErr.message);
          setError("Không thể tạo URL thanh toán Momo: " + (momoErr.response?.data?.message || momoErr.message));
        }
      }
      else if (form.paymentMethod === 'vnpay') {
        try {
          const token = localStorage.getItem("token");

          const vnpayResponse = await axios.get<string>(
            'http://localhost:8080/doan/payment/vnpay/create',
            {
              params: {
                amount: order.total,
                info: `Thanh toán đơn hàng #${order.id}`,
                orderId: order.id, // ✅ THÊM VÀO ĐÂY
              },
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          console.log("🌐 VNPAY URL trả về:", vnpayResponse.data);

          if (vnpayResponse.data) {
            window.location.href = vnpayResponse.data;
          } else {
            setError("Không nhận được URL thanh toán từ VNPAY");
          }
        } catch (vnpErr: any) {
          console.error("❌ Lỗi khi tạo URL VNPAY:", vnpErr.response?.data || vnpErr.message);
          setError("Không thể tạo URL thanh toán VNPAY");
        }
      }

      if (form.paymentMethod === 'cod') {
        clearCart();
        navigate('/order-confirmation', { state: { orderData: order } });
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi đặt hàng:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#8B4513] text-center">Thanh toán đơn hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin khách hàng */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border">
          <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Thông tin khách hàng</h2>
          <input
            name="customerName"
            required
            placeholder="Họ và tên"
            className="w-full border rounded px-3 py-2"
            value={form.customerName}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="phone"
            required
            placeholder="Số điện thoại"
            className="w-full border rounded px-3 py-2"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="address"
            required
            placeholder="Địa chỉ nhận hàng"
            className="w-full border rounded px-3 py-2"
            value={form.address}
            onChange={handleChange}
          />
          <select
            name="paymentMethod"
            className="w-full border rounded px-3 py-2"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="cod">Thanh toán khi nhận hàng (COD)</option>
            <option value="momo">Thanh toán qua Momo</option>
            <option value="vnpay">Thanh toán qua VNPAY</option>
          </select>
          <div className="flex justify-between text-base">
            <span>Phí vận chuyển:</span>
            <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
              {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + 'đ'}
            </span>
          </div>
          <div className="font-bold text-lg text-[#8B4513] flex justify-between">
            <span>Tổng cộng:</span>
            <span>{grandTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B4513] text-white py-3 rounded hover:bg-[#6B3410] transition font-semibold text-lg"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>
        {/* Thông tin đơn hàng */}
        <div className="bg-white p-6 rounded shadow border h-fit">
          <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Sản phẩm trong đơn hàng</h2>
          <ul className="divide-y divide-gray-200 mb-4">
            {items.map(item => (
              <li key={item.id} className="flex items-center gap-3 py-2">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                <div className="flex-1">
                  <div className="font-semibold text-[#8B4513]">{item.name}</div>
                  <div className="text-gray-600 text-sm">Số lượng: {item.quantity}</div>
                </div>
                <div className="font-bold text-[#e53935]">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-base border-t pt-4">
            <span>Tạm tính:</span>
            <span>{total.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-base">
            <span>Phí vận chuyển:</span>
            <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
              {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + 'đ'}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Tổng cộng:</span>
            <span className="text-[#8B4513]">{grandTotal.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;