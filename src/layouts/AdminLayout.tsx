import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import authService from '../services/auth.service'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const user = authService.getCurrentUser()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📂' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '📦' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '🛒' },
    { path: '/admin/customers', label: 'Khách hàng', icon: '👥' },
    { path: '/admin/reports', label: 'Báo cáo', icon: '📈' },
  
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                isSidebarOpen ? 'hidden' : 'block'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Xin chào, {user?.name || 'Admin'}
              </span>
              <button
                onClick={() => {
                  authService.logout()
                  window.location.href = '/login'
                }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 