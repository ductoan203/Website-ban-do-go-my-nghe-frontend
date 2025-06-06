import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // TODO: Call backend API to request password reset email
    try {
      const response = await authService.requestPasswordReset(email);
      setMessage(response.message || 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.');
      toast.success(response.message || 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.');
      navigate('/reset-password-otp', { state: { email: email } });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Quên mật khẩu</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[#8B4513] font-medium hover:underline"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 