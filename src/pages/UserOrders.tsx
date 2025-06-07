import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import type { Order } from '../services/order.service';
import React from 'react';

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDetail, setOpenDetail] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      navigate('/login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getMyOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách đơn hàng!');
        setLoading(false);
      });
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await orderService.cancelOrder(orderId);
        setSuccess('Đã hủy đơn hàng thành công!');
        setError(''); // Clear any previous error
        fetchOrders();
      } catch (e: any) {
        setSuccess(''); // Clear any previous success
        setError(e.response?.data?.message || 'Hủy đơn hàng thất bại!');
      }
    }
  };

  const handleReturnOrder = async (orderId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn trả lại đơn hàng này?')) {
      try {
        await orderService.returnOrder(orderId);
        setSuccess('Yêu cầu trả hàng đã được gửi!');
        setError(''); // Clear any previous error
        fetchOrders();
      } catch (e: any) {
        setSuccess(''); // Clear any previous success
        setError(e.response?.data?.message || 'Yêu cầu trả hàng thất bại!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-extrabold text-[#8B4513] mb-8 text-center">Đơn hàng của tôi</h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Thành công!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-gray-700 text-lg">Đang tải đơn hàng của bạn...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-[#f3e3c3] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Mã đơn</th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Ngày đặt</th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Tổng tiền</th>
                  <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                      <td className="py-3 px-5 text-sm text-gray-800 font-medium">#{order.id}</td>
                      <td className="py-3 px-5 text-sm text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                      <td className={`py-3 px-5 text-sm font-semibold ${
                          {
                            'PENDING': 'text-yellow-600',
                            'CONFIRMED': 'text-blue-600',
                            'READY_FOR_DELIVERY': 'text-purple-600',
                            'SHIPPED': 'text-indigo-600',
                            'DELIVERED': 'text-green-600',
                            'CANCELLED': 'text-red-600',
                            'RETURNED': 'text-orange-600',
                          }[order.status] || 'text-gray-700'
                        }`}
                      >
                        {(() => {
                          switch (order.status) {
                            case 'PENDING':
                              return 'Chờ xác nhận';
                            case 'CONFIRMED':
                              return 'Đã xác nhận';
                            case 'READY_FOR_DELIVERY':
                              return 'Chờ lấy hàng';
                            case 'SHIPPED':
                              return 'Đang giao hàng';
                            case 'DELIVERED':
                              return 'Đã giao hàng';
                            case 'CANCELLED':
                              return 'Đã hủy';
                            case 'RETURNED':
                              return 'Đã trả hàng';
                            default:
                              return order.status;
                          }
                        })()}
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-800 font-bold">{order.total.toLocaleString('vi-VN')}đ</td>
                      <td className="py-3 px-5 text-sm">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => setOpenDetail(openDetail === order.id ? null : order.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                          >
                            {openDetail === order.id ? 'Đóng chi tiết' : 'Xem chi tiết'}
                          </button>
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'RETURNED' && (
                            <button onClick={() => handleCancelOrder(order.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition ease-in-out duration-150">
                              Hủy đơn
                            </button>
                          )}
                          {order.status === 'DELIVERED' && (
                            <button onClick={() => handleReturnOrder(order.id)} className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition ease-in-out duration-150">
                              Trả hàng
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {openDetail === order.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 p-6">
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                            <h3 className="text-xl font-bold text-[#8B4513] mb-4">Sản phẩm đã đặt:</h3>
                            <table className="w-full mb-6 border border-gray-200 rounded-lg overflow-hidden">
                              <thead className="bg-[#f3e3c3] border-b border-gray-200">
                                <tr>
                                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ảnh</th>
                                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên sản phẩm</th>
                                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Số lượng</th>
                                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá</th>
                                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items && order.items.map((item: any) => (
                                  <tr key={item.productId} className="border-b border-gray-100 last:border-b-0">
                                    <td className="py-2 px-3">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.productName}
                                          className="w-20 h-20 object-cover rounded-md shadow-sm"
                                          style={{ minWidth: 80, minHeight: 80, maxWidth: 80, maxHeight: 80 }}
                                        />
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-sm text-gray-800">
                                      <a
                                        href={`/products/${item.productId}`}
                                        className="text-blue-700 hover:underline font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {item.productName}
                                      </a>
                                    </td>
                                    <td className="py-2 px-3 text-right text-sm text-gray-700">{item.quantity}</td>
                                    <td className="py-2 px-3 text-right text-sm text-gray-700">{item.price.toLocaleString('vi-VN')}đ</td>
                                    <td className="py-2 px-3 text-right text-sm text-gray-800 font-bold">{item.subtotal.toLocaleString('vi-VN')}đ</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-700">
                              <div><b>Tổng cộng đơn hàng:</b> <span className="font-bold text-lg text-[#8B4513]">{order.total.toLocaleString('vi-VN')}đ</span></div>
                              <div><b>Phương thức thanh toán:</b> {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'ONLINE' ? 'Chuyển khoản/Momo' : (order.paymentMethod || 'Chưa cập nhật')}</div>
                              <div><b>Trạng thái thanh toán:</b> {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : (order.paymentStatus || 'Chưa cập nhật')}</div>
                              <div><b>Địa chỉ nhận hàng:</b> {order.shippingAddress || 'Chưa cập nhật'}</div>
                              <div><b>Tên khách hàng:</b> {order.customerName || 'Chưa cập nhật'}</div>
                              <div><b>Email:</b> {order.email || 'Chưa cập nhật'}</div>
                              <div><b>Số điện thoại:</b> {order.phone || 'Chưa cập nhật'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;