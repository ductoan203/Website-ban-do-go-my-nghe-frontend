import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import authService from '../services/auth.service'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Hiển thị thông báo thành công từ trang xác thực
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Xóa message khỏi state sau khi hiển thị
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    try {
      const user = await authService.login(form.email, form.password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error caught in Login.tsx:', err);
      // Bắt lỗi 1010 hoặc UNVERIFIED_ACCOUNT từ authService
      if (err.code === 1010 || err.message === 'UNVERIFIED_ACCOUNT') {
        setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.');
        // Lưu email vào localStorage
        localStorage.setItem('pendingVerificationEmail', form.email);
        // Chuyển hướng đến trang xác thực OTP
        navigate('/verify-otp');
      } else if (err.response?.status === 401) {
        setError('Sai email hoặc mật khẩu.');
      } else if (err.response?.data?.code === 9999) {
         setError('Lỗi hệ thống: Tìm thấy nhiều tài khoản trùng email.');
      }
       else {
        setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
      }
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Đăng nhập</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />
           {/* <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={form.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-[#8B4513] focus:ring-[#8B4513] border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div> */}
          <button
            type="submit"
            className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg"
          >
            Đăng nhập
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <Link
            to="/register"
            className="text-[#8B4513] font-medium hover:underline block"
          >
            Chưa có tài khoản? Đăng ký ngay
          </Link>
          <Link
            to="/forgot-password"
            className="text-[#8B4513] font-medium hover:underline block"
          >
            Quên mật khẩu?
          </Link>
          <Link
            to="/"
            className="text-[#8B4513] font-medium hover:underline block"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login 