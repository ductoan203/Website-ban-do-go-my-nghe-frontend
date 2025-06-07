import { useEffect, useState } from "react";
import * as adminService from "../../services/admin.service";
import { toast } from 'react-toastify';

interface Order {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  status: string;
  items: OrderItem[];
  cancelledBy?: string;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnailUrl?: string;
}

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "READY_FOR_DELIVERY", label: "Chờ lấy hàng" },
  { value: "SHIPPED", label: "Đang giao hàng" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "RETURNED", label: "Đã trả hàng" },
];

const getAllowedStatusTransitions = (currentStatus: string) => {
  switch (currentStatus) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["READY_FOR_DELIVERY", "CANCELLED"];
    case "READY_FOR_DELIVERY":
      return ["SHIPPED", "CANCELLED"];
    case "SHIPPED":
      return ["DELIVERED", "RETURNED", "CANCELLED"];
    case "DELIVERED":
      return ["RETURNED"];
    case "CANCELLED":
      return ["PENDING", "CONFIRMED"];
    case "RETURNED":
      return [];
    default:
      return [];
  }
};

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async (status?: string) => {
    try {
    const res = await adminService.getAllAdminOrders(status) as any;
    setOrders(res.data.result);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.error("Không thể lấy danh sách đơn hàng.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    // Tìm đơn hàng hiện tại
    const currentOrder = orders.find(order => order.id === orderId);
    if (!currentOrder) {
      toast.error("Không tìm thấy đơn hàng.");
      console.log("[DEBUG] handleStatusChange: Không tìm thấy đơn hàng với ID:", orderId);
      return;
    }

    // Không làm gì nếu trạng thái mới giống trạng thái hiện tại
    if (currentOrder.status === newStatus) {
      console.log("[DEBUG] handleStatusChange: Trạng thái không thay đổi cho đơn hàng ID:", orderId, "Trạng thái cũ:", currentOrder.status, "Trạng thái mới:", newStatus);
      return;
    }

    // Kiểm tra tính hợp lệ của chuyển đổi trạng thái
    const allowedTransitions = getAllowedStatusTransitions(currentOrder.status);
    console.log("[DEBUG] handleStatusChange: Trạng thái hiện tại:", currentOrder.status, "Các chuyển đổi hợp lệ:", allowedTransitions, "Trạng thái mới được chọn:", newStatus);
    if (!allowedTransitions.includes(newStatus)) {
      toast.error("Chuyển đổi trạng thái không hợp lệ.");
      console.log("[DEBUG] handleStatusChange: Chuyển đổi không hợp lệ cho đơn hàng ID:", orderId, "Từ:", currentOrder.status, "Sang:", newStatus);
      return;
    }

    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus) as any;
      const updatedOrder = response.data.result;
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? updatedOrder : order
      );
      setOrders(updatedOrders);
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders(filterStatus); // Re-fetch orders after successful update
      console.log("[DEBUG] handleStatusChange: Cập nhật thành công. Orders state sau khi cập nhật:", updatedOrders);
    } catch (error: any) {
      console.error("[DEBUG] handleStatusChange: Lỗi khi cập nhật trạng thái:", error);
      toast.error(
        error?.response?.data?.message ||
        "Cập nhật trạng thái thất bại. Vui lòng thử lại hoặc kiểm tra log backend."
      );
    }
  };
  
  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      return;
    }
    try {
      await adminService.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      toast.success("Xóa đơn hàng thành công!");
    } catch (error: any) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      toast.error(error?.response?.data?.message || "Không thể xóa đơn hàng.");
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex-1 flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
        <select
          value={filterStatus}
          onChange={(e) => {
            const status = e.target.value;
            setFilterStatus(status);
            fetchOrders(status);
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        </div>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Mã đơn</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">Email</th>
            <th className="p-3">Số điện thoại</th>
            <th className="p-3">Địa chỉ</th>
            <th className="p-3">Ngày đặt</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Thanh toán</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Cập nhật</th>
            <th className="p-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => {
            console.log(`[DEBUG] Đơn hàng ID ${o.id}: Trạng thái hiện tại: ${o.status}`);
            const allowedStatusValues = getAllowedStatusTransitions(o.status);
            console.log(`[DEBUG] Đơn hàng ID ${o.id}: Các trạng thái được phép chuyển đổi:`, allowedStatusValues);
            const currentStatusLabel = statusOptions.find(s => s.value === o.status)?.label || o.status;
            
            return (
              <tr key={o.id} className="border-t text-sm">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3">{o.phone}</td>
                <td className="p-3">{o.shippingAddress}</td>
                <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-3">{o.total.toLocaleString("vi-VN")}đ</td>
                <td className="p-3">
                  {o.paymentMethod === "COD" ? "COD" : "Online"} - {o.paymentStatus}
                </td>
                <td className="p-3 font-medium">
                  {currentStatusLabel}
                  {o.status === 'CANCELLED' && o.cancelledBy && ` bởi ${o.cancelledBy}`}
                </td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value={o.status}>{currentStatusLabel}</option> {/* Hiển thị trạng thái hiện tại là lựa chọn đầu tiên */}
                    {allowedStatusValues.map((allowedStatusValue) => {
                      const option = statusOptions.find(s => s.value === allowedStatusValue);
                      console.log(`[DEBUG] Đơn hàng ID ${o.id}: Thêm tùy chọn: ${option?.label} (${option?.value})`);
                      return option ? (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ) : null;
                    })}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewOrderDetails(o)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(o.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[80vh] overflow-y-auto ml-64">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p>Tên: {selectedOrder.customerName}</p>
              <p>Email: {selectedOrder.email}</p>
              <p>Số điện thoại: {selectedOrder.phone}</p>
              <p>Địa chỉ: {selectedOrder.shippingAddress}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
              <p>Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p>Phương thức thanh toán: {selectedOrder.paymentMethod === "COD" ? "COD" : "Online"}</p>
              <p>Trạng thái thanh toán: {selectedOrder.paymentStatus}</p>
              <p>Trạng thái đơn hàng: {statusOptions.find(s => s.value === selectedOrder.status)?.label}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Danh sách sản phẩm</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Ảnh</th>
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2 text-right">Số lượng</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => {
                    const imageUrl = item.thumbnailUrl;
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="p-2 border border-dashed border-gray-300">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded bg-gray-200 block"
                            />
                          )}
                        </td>
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{item.price.toLocaleString("vi-VN")}đ</td>
                        <td className="p-2 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t font-bold">
                    <td colSpan={4} className="p-2 text-right">Tổng cộng:</td>
                    <td className="p-2 text-right">{selectedOrder.total.toLocaleString("vi-VN")}đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
