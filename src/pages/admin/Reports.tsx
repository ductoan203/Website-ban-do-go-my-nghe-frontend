import React, { useState, useEffect } from 'react'
import * as adminService from '../../services/admin.service'

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

interface DailySale {
  date: string
  sales: string
}

interface SalesData {
  totalSales: string
  totalOrders: number
  averageOrderValue: string
  topProducts: Product[]
  salesByCategory: Category[]
  dailySales: DailySale[]
}

const Reports = () => {
  const [timeRange, setTimeRange] = useState('week')
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: '0đ',
    totalOrders: 0,
    averageOrderValue: '0đ',
    topProducts: [],
    salesByCategory: [],
    dailySales: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await adminService.getReportData(timeRange) as any
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
        dailySales: data.dailySales.map((sale: any) => ({
          date: sale.date,
          sales: Number(sale.sales).toLocaleString() + 'đ'
        }))
      })
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu báo cáo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Báo cáo thống kê</h1>
          <p className="mt-2 text-sm text-gray-700">Tổng quan về doanh số và hoạt động kinh doanh</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
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

          {/* Doanh số theo ngày */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Doanh số theo ngày</h2>
            <div className="h-64 flex items-end space-x-2">
              {salesData.dailySales.map((day) => (
                <div key={day.date} className="flex-1">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{
                      height: `${
                        (parseInt(day.sales.replace(/[^\d]/g, '')) /
                          Math.max(1, parseInt(salesData.dailySales[0].sales.replace(/[^\d]/g, '')))) * 100
                      }%`
                    }}
                  ></div>
                  <div className="text-xs text-center mt-2">{day.date}</div>
                </div>
              ))}
            </div>
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
