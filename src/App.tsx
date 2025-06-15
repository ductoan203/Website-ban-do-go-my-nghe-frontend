import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import Dashboard from './pages/admin/Dashboard'
import ProductManagement from './pages/admin/ProductManagement'
import OrderManagement from './pages/admin/OrderManagement'
import CustomerManagement from './pages/admin/CustomerManagement'
import Reports from './pages/admin/Reports'
import authService from './services/auth.service'
import User from './pages/User'
import axios from 'axios'
import CategoryManagement from './pages/admin/CategoryManagement'
import AdminCommentManagement from './pages/admin/AdminCommentManagement'
import { CartProvider } from './contexts/CartContext'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import UserOrders from './pages/UserOrders'
import Checkout from './pages/Checkout'
import MomoReturn from './pages/MomoReturn'
import OrderConfirmation from './pages/OrderConfirmation'
import SearchResults from './pages/SearchResults'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PasswordResetForm from './pages/PasswordResetForm'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ContactMessages from './pages/admin/ContactMessages'


// Protected Route component cho admin
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (!authService.isAdmin()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// Protected Route component cho user đã đăng nhập
const ProtectedUserRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

const PrivateRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const userRole = localStorage.getItem('userRole');

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Thiết lập axios interceptor khi component mount
    authService.setupAxiosInterceptors()
  }, [])

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* This route is for the link sent via email - probably not needed for OTP flow */}
          {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}
          {/* Route for the form to enter email, OTP, and new password */}
          <Route path="/reset-password-otp" element={<PasswordResetForm />} />

          {/* Client routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="user" element={<PrivateRoute><User /></PrivateRoute>} />
            <Route path="user/orders" element={<PrivateRoute><UserOrders /></PrivateRoute>} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment/momo/return" element={<MomoReturn />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="search-results" element={<SearchResults />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="comments" element={<AdminCommentManagement />} />
            <Route path="contact-messages" element={<ContactMessages />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </CartProvider>
  )
}

export default App
