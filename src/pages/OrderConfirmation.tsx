import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import ClearCartOnSuccess from '../components/ClearCartOnSuccess';

// Định nghĩa interface chung cho response API
interface ApiResponse<T> {
  result: T;
  message: string;
  errorCode: number;
}

// Định nghĩa interface cho item trong đơn hàng (tham khảo cấu trúc từ API backend)
interface OrderItemDisplay {
  id?: number; // Có thể không có ID nếu chỉ hiển thị tạm, dùng productId
  productId?: number; // ID sản phẩm
  productName: string; // Tên sản phẩm
  quantity: number;
  price: number; // Giá từng item
  thumbnailUrl?: string; // Ảnh sản phẩm
}

// Định nghĩa interface cho cấu trúc dữ liệu đơn hàng fetch về từ backend
interface FetchedOrder {
  id: number;
  orderNumber?: string; // Thêm trường orderNumber nếu backend có trả về
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string; // UNPAID, PAID, etc.
  total: number; // Tổng tiền số (backend)
  createdAt: string; // Ngày tạo
  status: string; // PENDING, CONFIRMED, etc.
  items: OrderItemDisplay[];
}

const OrderConfirmation = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { clearCart } = useCart();

  const orderIdFromParams = params.get('orderId');
  const statusFromParams = params.get('status') as 'success' | 'failed' | 'pending' | 'unknown' | null;

  const initialOrderData = location.state?.orderData as FetchedOrder | undefined;

  const finalOrderId = orderIdFromParams || initialOrderData?.id;

  console.log("OrderConfirmation - location.state:", location.state);
  console.log("OrderConfirmation - query params:", Object.fromEntries(params.entries()));
  console.log("OrderConfirmation - orderIdFromParams:", orderIdFromParams);
  console.log("OrderConfirmation - statusFromParams:", statusFromParams);
  console.log("OrderConfirmation - initialOrderData:", initialOrderData);
  console.log("OrderConfirmation - finalOrderId:", finalOrderId);

  const [order, setOrder] = useState<FetchedOrder | undefined>(initialOrderData);
  const [loading, setLoading] = useState<boolean>(!initialOrderData && !!finalOrderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("OrderConfirmation - order state:", order);
  }, [order]);

  useEffect(() => {
    if (finalOrderId && !initialOrderData) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get<ApiResponse<FetchedOrder>>(`http://localhost:8080/doan/orders/${finalOrderId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (response.data.result) {
            setOrder(response.data.result);
            console.log("✅ Fetch order thành công:", response.data.result);
          } else {
            setError('Không tìm thấy thông tin đơn hàng.');
          }
        } catch (err: any) {
          console.error('❌ Lỗi fetch đơn hàng:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [finalOrderId, initialOrderData]);

  const displayStatus = statusFromParams ? statusFromParams :
    initialOrderData ? 'success' :
      order ?
        (order.paymentMethod === 'cod' && order.status === 'CONFIRMED') ||
          (order.paymentMethod !== 'cod' && order.paymentStatus === 'PAID')
          ? 'success'
          : 'pending'
        : 'unknown';

  if (loading) {
    return <div className="text-center mt-20">Đang tải thông tin đơn hàng...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-red-600">Lỗi: {error}</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng.</div>;
  }

  const orderNumberDisplay = order?.orderNumber || order?.id;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <ClearCartOnSuccess shouldClear={displayStatus === 'success'} />
      <div className="text-center">
        {displayStatus === 'success' ? (
          <svg
            className="mx-auto h-12 w-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}

        <h1 className={`mt-4 text-3xl font-extrabold ${displayStatus === 'success' ? 'text-gray-900' : 'text-red-600'}`}>
          {displayStatus === 'success' ? 'Đặt hàng thành công!' : 'Đặt hàng/Thanh toán thất bại'}
        </h1>

        {order && (
          <p className="mt-2 text-lg text-gray-600">
            Mã đơn hàng của bạn là{' '}
            <span className="font-medium text-gray-900">
              {orderNumberDisplay}
            </span>
          </p>
        )}

        {displayStatus === 'success' && (
          <p className="mt-2 text-md text-gray-600">Bạn sẽ nhận được email xác nhận đơn hàng trong ít phút.</p>
        )}

      </div>

      {order && (
        <>
          <div className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Thông tin đơn hàng
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Chi tiết đơn hàng và thông tin giao hàng
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Mã đơn hàng</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {orderNumberDisplay}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Ngày đặt hàng</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.customerName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.phone}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.shippingAddress}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Phương thức thanh toán
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Trạng thái thanh toán
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.paymentStatus}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Trạng thái đơn hàng
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.status}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Sản phẩm đã đặt</h3>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.productId || item.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {item.thumbnailUrl && (
                            <img src={item.thumbnailUrl} alt={item.productName} className="w-16 h-16 object-cover rounded border mr-4 inline-block align-middle" />
                          )}
                          <p className="text-sm font-medium text-gray-900 truncate inline-block align-middle">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">Tổng cộng</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.total.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {order && order.paymentMethod === 'banking' && order.status === 'PENDING' && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 0 002 0V6a1 1 0 00-1-1z" style={{ fill: 'currentColor' }}
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Hướng dẫn thanh toán chuyển khoản
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Vui lòng chuyển khoản số tiền {order.total.toLocaleString('vi-VN')}đ đến tài khoản:
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Ngân hàng: Vietcombank</li>
                  <li>Số tài khoản: 1234567890</li>
                  <li>Chủ tài khoản: CÔNG TY ABC</li>
                  <li>Nội dung chuyển khoản: {order.id}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 