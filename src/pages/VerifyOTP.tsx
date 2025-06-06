import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import authService from '../services/auth.service'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [email, setEmail] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Lấy email từ state hoặc localStorage
    const emailFromState = location.state?.email
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail')
    
    if (emailFromState) {
      setEmail(emailFromState)
    } else if (emailFromStorage) {
      setEmail(emailFromStorage)
    } else {
      navigate('/register')
    }
  }, [location.state, navigate])

  if (!email) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
        await authService.verifyOtp({ email, otpCode: otp });
        localStorage.removeItem('pendingVerificationEmail');
        navigate('/login', { state: { message: 'Xác thực thành công! Vui lòng đăng nhập.' } });
      } catch (err: any) {
        if (err.response?.data?.code === 1010) {
          setError('Mã OTP không hợp lệ.');
        } else if (err.response?.data?.code === 1011) {
          setError('Mã OTP đã hết hạn.');
        } else {
          setError('Xác minh OTP thất bại.');
        }
      }      
  }

  const handleResendOTP = async () => {
    try {
      await authService.resendOtp(email)
      alert('Đã gửi lại mã OTP. Vui lòng kiểm tra email.')
    } catch (err: any) {
      if (err.response?.data?.code === 1011) {
        setError('Tài khoản đã được xác thực. Vui lòng đăng nhập.')
        navigate('/login')
      } else {
        setError('Không thể gửi lại mã OTP. Vui lòng thử lại sau.')
      }
    }
  }
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Xác thực Email</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <p className="text-gray-600">
              Mã xác thực đã được gửi đến email: <br />
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />

          <button
            type="submit"
            className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg"
          >
            Xác thực
          </button>

          <button
            type="button"
            onClick={handleResendOTP}
            className="w-full text-[#8B4513] hover:text-[#6B3410] font-medium"
          >
            Gửi lại mã OTP
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/register"
            className="text-[#8B4513] font-medium hover:underline"
          >
            ← Quay lại đăng ký
          </Link>
          <br />
          <Link
            to="/login"
            className="text-[#8B4513] font-medium hover:underline mt-2 block"
          >
            ← Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP 