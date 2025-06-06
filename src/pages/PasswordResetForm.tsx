import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

const PasswordResetForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';

  const [form, setForm] = useState({ email: initialEmail, otp: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(prevForm => ({ ...prevForm, email: location.state?.email || '' }));
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email' && location.state?.email) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.email) {
        setError('Không tìm thấy email người dùng. Vui lòng quay lại trang quên mật khẩu.');
        toast.error('Không tìm thấy email người dùng. Vui lòng quay lại trang quên mật khẩu.');
        return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(form.email, form.otp, form.newPassword);
      setMessage('Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập.');
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' } });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Đặt lại mật khẩu</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email của bạn"
              value={form.email}
              readOnly={!!location.state?.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] ${location.state?.email ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
             <input
              name="otp"
              type="text"
              placeholder="Mã OTP (đã gửi đến email)"
              value={form.otp}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <input
              name="newPassword"
              type="password"
              placeholder="Mật khẩu mới"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <button
              type="submit"
              disabled={loading || !form.email}
              className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
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

export default PasswordResetForm; 