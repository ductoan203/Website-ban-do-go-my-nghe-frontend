import { useState } from 'react';
import PayOSPaymentHandler from '../components/PayOSPaymentHandler';

const sampleResponse = {
  code: 0,
  message: "Thành công",
  result: {
    checkoutUrl: "https://pay.payos.vn/web/checkout/123456789"
  }
};

const PayOSPayment: React.FC = () => {
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  const orderInfo = {
    subtotal: 2000,
    shippingFee: 30000,
    total: 32000
  };

  const handlePayment = () => {
    setPaymentResponse(sampleResponse);
  };

  const handleSuccess = () => {
    setMessage('Đã mở trang thanh toán PayOS trong tab mới');
  };

  const handleError = (errorMsg: string) => {
    setMessage(`Lỗi: ${errorMsg}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#8B4513] text-center">Thanh toán qua PayOS</h1>
      <div className="bg-white p-6 rounded shadow border">
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">Chi tiết đơn hàng</h2>
          <div className="flex justify-between text-base mb-1">
            <span>Tạm tính:</span>
            <span>{orderInfo.subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between text-base mb-1">
            <span>Phí vận chuyển:</span>
            <span>{orderInfo.shippingFee.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-[#8B4513] mt-2 pt-2 border-t">
            <span>Tổng cộng:</span>
            <span>{orderInfo.total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
        <p className="mb-4">Nhấn nút bên dưới để mở trang thanh toán PayOS trong tab mới.</p>
        <button
          onClick={handlePayment}
          className="bg-[#8B4513] text-white py-2 px-4 rounded hover:bg-[#6B3410] transition"
        >
          Thanh toán với PayOS
        </button>
        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">
            {message}
          </div>
        )}
        <PayOSPaymentHandler
          response={paymentResponse}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default PayOSPayment; 