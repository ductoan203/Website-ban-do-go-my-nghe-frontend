import React, { useEffect, useState } from 'react'
import { HiShoppingBag, HiShoppingCart, HiUsers, HiCurrencyDollar } from 'react-icons/hi'
import { getDashboardOverview, getAllOrders, getAllUsers, getAllProducts, getAllCustomers } from '../../services/admin.service'

const Dashboard = () => {
  const [overview, setOverview] = useState<any>({})
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    // Lấy tổng quan dashboard
    getDashboardOverview().then((res: any) => setOverview(res.data.result))
    // Lấy tất cả đơn hàng
    getAllOrders().then((res: any) => setOrders(res.data.result))
    // Lấy tất cả khách hàng (chỉ lấy người dùng có role USER)
    getAllCustomers().then((res: any) => setUsers(res.data.result))
    // Lấy số lượng sản phẩm từ API sản phẩm
    getAllProducts().then((res: any) => setProducts(res.data.result))
  }, [])

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tổng Quan</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex items-center p-6 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl shadow">
          <HiShoppingBag className="text-3xl text-amber-600 mr-4" />
          <div>
            <div className="text-sm text-gray-500">Tổng sản phẩm</div>
            <div className="text-2xl font-bold">{products.length}</div>
          </div>
        </div>
        <div className="flex items-center p-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl shadow">
          <HiShoppingCart className="text-3xl text-blue-600 mr-4" />
          <div>
            <div className="text-sm text-gray-500">Đơn hàng mới</div>
            <div className="text-2xl font-bold">{overview.statusCounts?.NEW || 0}</div>
          </div>
              </div>
        <div className="flex items-center p-6 bg-gradient-to-r from-green-100 to-green-200 rounded-xl shadow">
          <HiUsers className="text-3xl text-green-600 mr-4" />
          <div>
            <div className="text-sm text-gray-500">Khách hàng</div>
            <div className="text-2xl font-bold">{users.length}</div>
              </div>
            </div>
        <div className="flex items-center p-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl shadow">
          <HiCurrencyDollar className="text-3xl text-purple-600 mr-4" />
          <div>
            <div className="text-sm text-gray-500">Doanh thu tháng</div>
            <div className="text-2xl font-bold">{overview.totalRevenue ? Number(overview.totalRevenue).toLocaleString() + 'đ' : '0đ'}</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ và bảng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Biểu đồ doanh thu */}
        <div className="bg-white rounded-lg shadow p-6 min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M5 17h14" />
            </svg>
            <span>Biểu đồ doanh thu sẽ được cập nhật ở đây</span>
          </div>
        </div>
        {/* Box 2: Đơn hàng gần đây */}
        <div className="bg-white rounded-lg shadow p-6 min-h-[300px] flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn Hàng Gần Đây</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">{order.id}</td>
                    <td className="px-6 py-4">{order.customerName || 'Ẩn danh'}</td>
                    <td className="px-6 py-4">
                      {order.total ? Number(order.total).toLocaleString() + 'đ' : '0đ'}
                  </td>
                    <td className="px-6 py-4">{order.status}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 