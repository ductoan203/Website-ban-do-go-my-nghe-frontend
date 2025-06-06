import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/user.service';
import type { UserProfile, UpdateUserProfile } from '../services/user.service';

const User = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<UpdateUserProfile & { password?: string }>({ fullname: '', phoneNumber: '', address: '', password: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      navigate('/login');
      return;
    }
    userService.getProfile()
      .then(profile => {
        setUser(profile);
        setForm({ fullname: profile.fullname, phoneNumber: profile.phoneNumber || '', address: profile.address || '' });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          navigate('/login');
        } else {
          setError('Không thể tải thông tin tài khoản!');
        }
      });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!oldPassword) {
      setError('Vui lòng nhập mật khẩu cũ!');
      return;
    }
    if (!/^\d{10}$/.test(form.phoneNumber || '')) {
      setError('Số điện thoại phải là 10 số!');
      return;
    }
    try {
      const updateData: any = {
        fullname: form.fullname,
        phoneNumber: form.phoneNumber,
        address: form.address,
        password: oldPassword
      };
      const updated = await userService.updateProfile(updateData);
      setUser({ ...user!, fullname: updated.fullname, phoneNumber: updated.phoneNumber, address: updated.address });
      setEdit(false);
      setSuccess('Cập nhật thành công!');
      setOldPassword('');
    } catch {
      setError('Mật khẩu cũ không đúng hoặc cập nhật thất bại!');
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp!');
      return;
    }
    try {
      const updateData: any = {
        fullname: user?.fullname,
        phoneNumber: user?.phoneNumber,
        address: user?.address,
        password: newPassword
      };
      await userService.updateProfile(updateData);
      setSuccess('Đổi mật khẩu thành công!');
      setNewPassword(''); setConfirmPassword('');
    } catch {
      setError('Đổi mật khẩu thất bại!');
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (!user && !loading) return <div className="text-center py-12 text-red-500">Không thể tải thông tin tài khoản!</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {(error || success) && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center ${error ? 'bg-red-600' : 'bg-green-600'}`}
             style={{ minWidth: 300 }}>
          {error || success}
        </div>
      )}
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 bg-white rounded shadow">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-6">Tài khoản của tôi</h1>
          <div className="mb-4">
            <span className="font-semibold">Email:</span> {user?.email}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Họ tên:</span>{' '}
            {edit ? (
              <input name="fullname" value={form.fullname} onChange={handleChange} className="border rounded px-2 py-1 ml-2" />
            ) : (
              user?.fullname
            )}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Số điện thoại:</span>{' '}
            {edit ? (
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="border rounded px-2 py-1 ml-2" maxLength={10} />
            ) : (
              user?.phoneNumber || 'Chưa cập nhật'
            )}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Địa chỉ:</span>{' '}
            {edit ? (
              <input name="address" value={form.address} onChange={handleChange} className="border rounded px-2 py-1 ml-2" />
            ) : (
              user?.address || 'Chưa cập nhật'
            )}
          </div>
          {edit && (
            <>
              <div className="mb-4">
                <span className="font-semibold">Mật khẩu cũ:</span>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="border rounded px-2 py-1 ml-2" />
              </div>
              <div className="mb-4">
                <span className="font-semibold">Mật khẩu mới:</span>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="border rounded px-2 py-1 ml-2" />
              </div>
              <div className="mb-4">
                <span className="font-semibold">Nhập lại mật khẩu mới:</span>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="border rounded px-2 py-1 ml-2" />
              </div>
            </>
          )}
          <div className="mt-8 flex gap-4 flex-wrap">
            {edit ? (
              <>
                <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Lưu</button>
                <button onClick={() => { setEdit(false); setForm({ fullname: user?.fullname || '', phoneNumber: user?.phoneNumber || '', address: user?.address || '' }); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition">Quay lại</button>
              </>
            ) : (
              <button onClick={() => setEdit(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Chỉnh sửa</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default User; 