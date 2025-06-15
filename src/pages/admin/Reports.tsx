import React, { useState, useEffect } from 'react'
import * as adminService from '../../services/admin.service'
import moment from 'moment';

interface Product {
  name: string
  sales: string
  quantity: number
}

interface Category {
  category: string
  sales: string
  percentage: number
}

interface SalesData {
  totalSales: string
  totalOrders: number
  averageOrderValue: string
  topProducts: Product[]
  salesByCategory: Category[]
}

const Reports = () => {
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().subtract(1, 'days').format('YYYY-MM-DD'));
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: '0đ',
    totalOrders: 0,
    averageOrderValue: '0đ',
    topProducts: [],
    salesByCategory: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [startDate, endDate, orderStatusFilter])

  const fetchReportData = async () => {
    if (moment(startDate).isAfter(moment(endDate))) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      setLoading(false);
      return;
    }
    console.log("Fetching report data for date range:", startDate, "to", endDate, "with status:", orderStatusFilter);
    try {
      setLoading(true)
      const response = await adminService.getReportData(startDate, endDate, orderStatusFilter) as any
      const data = response.data.result

      setSalesData({
        totalSales: Number(data.totalSales).toLocaleString() + 'đ',
        totalOrders: data.totalOrders,
        averageOrderValue: Number(data.averageOrderValue).toLocaleString() + 'đ',
        topProducts: data.topProducts.map((product: any) => ({
          name: product.name,
          sales: Number(product.sales).toLocaleString() + 'đ',
          quantity: product.quantity
        })),
        salesByCategory: data.salesByCategory.map((category: any) => ({
          category: category.name,
          sales: Number(category.sales).toLocaleString() + 'đ',
          percentage: category.percentage
        })),
      })
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu báo cáo:', error)
    } finally {
      setLoading(false)
    }
  }

  const orderStatuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "READY_FOR_DELIVERY", label: "Chờ lấy hàng" },
    { value: "SHIPPED", label: "Đang giao hàng" },
    { value: "DELIVERED", label: "Đã giao hàng" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "RETURNED", label: "Đã trả hàng" },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Báo cáo thống kê</h1>
          <p className="mt-2 text-sm text-gray-700">Tổng quan về doanh số và hoạt động kinh doanh</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-2">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-700">Từ ngày:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
            disabled={loading}
          />
          <label htmlFor="endDate" className="text-sm font-medium text-gray-700">Đến ngày:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
            disabled={loading}
          />
          <label htmlFor="orderStatus" className="text-sm font-medium text-gray-700">Trạng thái:</label>
          <select
            id="orderStatus"
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
            disabled={loading}
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewCard title="Tổng doanh số" value={salesData.totalSales} />
            <OverviewCard title="Tổng đơn hàng" value={salesData.totalOrders} />
            <OverviewCard title="Giá trị đơn hàng trung bình" value={salesData.averageOrderValue} />
          </div>

          {/* Bán chạy và theo danh mục */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SalesList title="Sản phẩm bán chạy" data={salesData.topProducts} />
            <CategoryList title="Doanh số theo danh mục" data={salesData.salesByCategory} />
          </div>
        </>
      )}
    </div>
  )
}

const OverviewCard = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
      <dd className="text-2xl font-bold text-gray-900 mt-1">{value}</dd>
    </div>
  </div>
)

const SalesList = ({ title, data }: { title: string; data: Product[] }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
    <ul className="-my-5 divide-y divide-gray-200">
      {data.map((item) => (
        <li key={item.name} className="py-4 flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
          </div>
          <div className="text-sm font-medium text-gray-900">{item.sales}</div>
        </li>
      ))}
    </ul>
  </div>
)

const CategoryList = ({ title, data }: { title: string; data: Category[] }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
    <ul className="-my-5 divide-y divide-gray-200">
      {data.map((item) => (
        <li key={item.category} className="py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.category}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">{item.sales}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
)

export default Reports
