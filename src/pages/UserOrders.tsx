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
        fetchOrders();
      } catch {
        setError('Hủy đơn hàng thất bại!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 bg-white rounded shadow">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-6">Đơn hàng của tôi</h1>
          {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-600">Bạn chưa có đơn hàng nào.</div>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-[#f3e3c3]">
                  <th className="py-2 px-4 border">Mã đơn</th>
                  <th className="py-2 px-4 border">Ngày đặt</th>
                  <th className="py-2 px-4 border">Trạng thái</th>
                  <th className="py-2 px-4 border">Tổng tiền</th>
                  <th className="py-2 px-4 border">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <React.Fragment key={order.id}>
                  <tr className="text-center">
                    <td className="py-2 px-4 border">#{order.id}</td>
                    <td className="py-2 px-4 border">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="py-2 px-4 border">{order.status === 'PENDING' ? 'Chờ xác nhận' : order.status === 'CANCELLED' ? 'Đã hủy' : order.status === 'CONFIRMED' ? 'Đã xác nhận' : order.status === 'SHIPPED' ? 'Đang giao' : order.status}</td>
                    <td className="py-2 px-4 border">{order.total.toLocaleString('vi-VN')}đ</td>
                    <td className="py-2 px-4 border">
                      <button onClick={() => setOpenDetail(openDetail === order.id ? null : order.id)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                        {openDetail === order.id ? 'Đóng' : 'Xem chi tiết'}
                      </button>
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && (
                        <button onClick={() => handleCancelOrder(order.id)} className="bg-red-500 text-white px-2 py-1 rounded">Hủy đơn</button>
                      )}
                    </td>
                  </tr>
                  {openDetail === order.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50">
                        <div className="p-6 text-left">
                          <div className="text-lg font-bold mb-2 text-[#8B4513]">Sản phẩm đã đặt:</div>
                          <table className="w-full mb-4 border">
                            <thead>
                              <tr className="bg-[#f3e3c3]">
                                <th className="py-2 px-2 border">Ảnh</th>
                                <th className="py-2 px-2 border">Tên sản phẩm</th>
                                <th className="py-2 px-2 border">Số lượng</th>
                                <th className="py-2 px-2 border">Giá</th>
                                <th className="py-2 px-2 border">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items && order.items.map((item: any) => (
                                <tr key={item.productId} className="text-center">
                                  <td className="py-2 px-2 border">
                                    {item.imageUrl && (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="w-24 h-24 object-cover rounded border mx-auto"
                                        style={{ minWidth: 96, minHeight: 96, maxWidth: 96, maxHeight: 96 }}
                                      />
                                    )}
                                  </td>
                                  <td className="py-2 px-2 border">
                                    <a
                                      href={`/products/${item.productId}`}
                                      className="text-blue-600 hover:underline font-medium"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {item.productName}
                                    </a>
                                  </td>
                                  <td className="py-2 px-2 border">{item.quantity}</td>
                                  <td className="py-2 px-2 border">{item.price.toLocaleString('vi-VN')}đ</td>
                                  <td className="py-2 px-2 border">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-4 text-base">
                            <div><b>Phương thức thanh toán:</b> {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'ONLINE' ? 'Chuyển khoản/Momo' : (order.paymentMethod || 'Chưa cập nhật')}</div>
                            <div><b>Trạng thái thanh toán:</b> {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : (order.paymentStatus || 'Chưa cập nhật')}</div>
                            <div><b>Địa chỉ nhận hàng:</b> {order.shippingAddress || 'Chưa cập nhật'}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders; 