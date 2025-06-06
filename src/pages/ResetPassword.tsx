import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // TODO: Validate token with backend when the component mounts
    if (token) {
      const validateToken = async () => {
        setLoading(true);
        try {
          // Backend validatePasswordResetToken is not implemented yet.
          // For now, we assume token is valid if it exists.
          // TODO: Implement validatePasswordResetToken in backend and auth.service.ts
          // await authService.validatePasswordResetToken(token);
          setIsTokenValid(true);
        } catch (err: any) {
           console.error('Token validation error:', err);
           setError(err.response?.data?.message || 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
           setIsTokenValid(false);
        } finally {
           setLoading(false);
        }
      };
      validateToken();
    } else {
      setError('Không tìm thấy mã đặt lại mật khẩu.');
      setIsTokenValid(false);
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    
    if (!token) {
        setError('Không tìm thấy mã đặt lại mật khẩu.');
        return;
    }

    setLoading(true);

    // TODO: Call backend API to reset password
    try {
      // We need the user's email to reset the password, but we only have the token here.
      // The backend reset-password endpoint expects email, token, and newPassword.
      // A common pattern is to include the email in the reset link or token payload.
      // Since the backend /reset-password endpoint expects email, we'll need to find a way to get it.
      // For now, assuming email can be retrieved or is part of the token validation process.
      // TODO: Update backend /reset-password to potentially accept just token and newPassword, 
      // or ensure email is available here.

      // For demonstration, let's assume the email is somehow available (e.g., from a previous state or token payload)
      // Replace 'user@example.com' with the actual email if you can retrieve it.
      const userEmail = ''; // TODO: Get the actual user email
      if (!userEmail) {
          setError('Không thể xác định email người dùng.');
          setLoading(false);
          return;
      }

      await authService.resetPassword(userEmail, token, newPassword);
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

  if (loading) {
      return (
           <div className="min-h-screen flex items-center justify-center bg-gray-50">
               Đang kiểm tra mã đặt lại mật khẩu...
           </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-[#3E2F1C] mb-6">Đặt lại mật khẩu</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {isTokenValid ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              name="newPassword"
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        ) : (
            <p className="text-center text-gray-600">{error || 'Vui lòng kiểm tra lại liên kết đặt lại mật khẩu.'}</p>
        )}

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

export default ResetPassword; 