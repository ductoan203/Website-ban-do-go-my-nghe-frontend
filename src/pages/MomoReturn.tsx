import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Không cần axios nữa

const MomoReturn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = params.get('resultCode');
    const orderId = params.get('orderId');

    console.log("MomoReturn - Received orderId:", orderId); // Log để kiểm tra
    console.log("MomoReturn - Received resultCode:", resultCode); // Log để kiểm tra

    // Quyết định trạng thái cuối cùng
    const finalStatus = resultCode === '0' ? 'success' : 'failed';

    // Chuyển hướng đến trang xác nhận đơn hàng, truyền orderId và trạng thái qua query parameters
    navigate(`/order-confirmation?orderId=${orderId || 'null'}&status=${finalStatus}`);

    if (resultCode !== '0') {
       alert('Thanh toán thất bại!'); // Giữ lại alert cho trường hợp thất bại
    }

  }, [navigate]); // Dependency array

  return <div>Đang xử lý kết quả thanh toán...</div>; // Hiển thị thông báo chờ
};

export default MomoReturn;
