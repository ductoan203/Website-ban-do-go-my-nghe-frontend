import { useEffect, useState } from "react";
import * as adminService from "../../services/admin.service";
import { toast } from 'react-toastify';

interface Customer {
  userId: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  address: string;
  isVerified: boolean;
  active: boolean;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (term?: string) => {
    try {
      const res = await adminService.getAllCustomers(term) as any;
      setCustomers(res.data.result);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khách hàng", err);
      toast.error("Không thể lấy danh sách khách hàng.");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (customer.isVerified) {
      toast.error("Không thể xóa tài khoản đã xác thực.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await adminService.deleteCustomer(customer.userId);
        // Cập nhật lại danh sách sau khi xóa
        toast.success("Xóa khách hàng thành công!");
        fetchCustomers();
      } catch (err: any) {
        console.error("Lỗi khi xóa khách hàng:", err);
        toast.error(err?.response?.data?.message || "Xóa khách hàng thất bại. Vui lòng kiểm tra lại hoặc thử lại sau.");
      }
    }
  };

  const handleSaveEdit = async (updatedCustomer: Customer) => {
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(updatedCustomer.phoneNumber)) {
      toast.error("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }
  
    try {
      await adminService.updateCustomer(updatedCustomer.userId, updatedCustomer);
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      // Cập nhật lại danh sách sau khi sửa
      toast.success("Cập nhật thông tin khách hàng thành công!");
      fetchCustomers();
    } catch (err: any) {
      console.error("Lỗi khi cập nhật khách hàng:", err);
      toast.error(err?.response?.data?.message || "Cập nhật thông tin khách hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    console.log('Đang tìm kiếm với từ khóa:', searchTerm);
    fetchCustomers(searchTerm);
  };

  const handleAddCustomerClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveNewCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCustomerData = {
      fullname: formData.get('fullname') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string, // Ensure backend handles password correctly
      phoneNumber: formData.get('phoneNumber') as string,
      address: formData.get('address') as string,
    };

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newCustomerData.phoneNumber)) {
      toast.error("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }

    // Basic email validation (more robust validation might be needed)
    if (!newCustomerData.email.includes('@') || !newCustomerData.email.includes('.')) {
        toast.error("Email không hợp lệ.");
        return;
    }

    // Basic password validation (adjust as needed)
    if (newCustomerData.password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }
  
    try {
      await adminService.createCustomer(newCustomerData);
      toast.success("Thêm khách hàng thành công!");
      setIsAddModalOpen(false);
      fetchCustomers(); // Refresh list
    } catch (err: any) {
      console.error("Lỗi khi thêm khách hàng:", err);
      // Handle specific errors if needed (e.g., email already exists)
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi thêm khách hàng";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center mb-4">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Quản lý khách hàng</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-2">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            className="px-3 py-2 border rounded w-64"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tìm kiếm
          </button>
          <button
            onClick={handleAddCustomerClick}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Thêm khách hàng
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Tên khách hàng</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Số điện thoại</th>
            <th className="px-4 py-2">Địa chỉ</th>
            <th className="px-4 py-2 text-center">Xác thực</th>
            <th className="px-4 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.userId} className="text-center border-t">
              <td className="px-4 py-2">{customer.fullname}</td>
              <td className="px-4 py-2">{customer.email}</td>
              <td className="px-4 py-2">{customer.phoneNumber}</td>
              <td className="px-4 py-2">{customer.address}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-block w-28 text-center px-2 py-1 text-sm font-medium rounded-full ${
                    customer.isVerified
                      ? "bg-green-100 text-green-700 border border-green-500"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-500"
                  }`}
                >
                  {customer.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                </span>
              </td>   
              <td className="px-4 py-2">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(customer)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal chỉnh sửa khách hàng */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa thông tin khách hàng</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedCustomer = {
                ...editingCustomer,
                fullname: formData.get('fullname') as string,
                email: formData.get('email') as string,
                phoneNumber: formData.get('phoneNumber') as string,
                address: formData.get('address') as string,
              };
              handleSaveEdit(updatedCustomer);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  name="fullname"
                  defaultValue={editingCustomer.fullname}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phoneNumber"
                  defaultValue={editingCustomer.phoneNumber}
                  className="w-full px-3 py-2 border rounded"
                  required
                  maxLength={10}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/[^0-9]/g, ""); // chỉ cho nhập số
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingCustomer.address}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm khách hàng mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Thêm khách hàng mới</h2>
            <form onSubmit={handleSaveNewCustomer}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tên đầy đủ</label>
                <input type="text" name="fullname" className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                <input type="password" name="password" className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input type="text" name="phoneNumber" className="w-full px-3 py-2 border rounded" required maxLength={10} onInput={(e) => { const input = e.currentTarget; input.value = input.value.replace(/[^0-9]/g, ""); }} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input type="text" name="address" className="w-full px-3 py-2 border rounded" required />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;