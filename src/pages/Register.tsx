import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/auth.service'

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await authService.register(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err: any) {
      if (err.response?.data?.code === 1001) {
        setError('Email đã tồn tại. Vui lòng dùng email khác.');
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Đăng ký</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Tên"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />
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
          <input
            name="phone"
            type="text"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />
          <input
            name="address"
            type="text"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />

          <button
            type="submit"
            className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg"
          >
            Đăng ký
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-[#8B4513] font-medium hover:underline"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
