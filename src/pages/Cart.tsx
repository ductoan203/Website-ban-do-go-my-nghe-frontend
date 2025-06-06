import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#8B4513] mb-8">Giỏ hàng của bạn</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 bg-[#8B4513] text-white px-6 py-3 rounded-full hover:bg-[#6B3410] transition"
          >
            <FaArrowLeft />
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow mb-4 hover:shadow-md transition">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#8B4513]">{item.name}</h3>
                  <p className="text-gray-600">{item.price.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="font-semibold text-[#8B4513]">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Tổng kết đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#8B4513] mb-4">Tổng kết đơn hàng</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-[#8B4513]">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-[#8B4513] text-white py-3 rounded-full hover:bg-[#6B3410] transition mb-4"
              >
                Tiến hành thanh toán
              </button>
              <Link 
                to="/products" 
                className="flex items-center justify-center gap-2 text-[#8B4513] hover:underline"
              >
                <FaArrowLeft />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 