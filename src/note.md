1. Create PayOS Service (src/services/payos.service.ts)

import axios from 'axios';

const API_URL = 'http://localhost:8080/doan/payment/payos';

const getAuthHeaders = () => {
const token = localStorage.getItem('token');
return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PayOSCreateRequest {
orderCode: number;
amount: number;
description: string;
buyerName: string;
buyerEmail: string;
buyerPhone: string;
buyerAddress: string;
items: Array<{
name: string;
quantity: number;
price: number;
}>;
}

// Thêm interface cho response
interface PayOSResponse {
code: number;
message: string;
result: {
checkoutUrl: string;
};
}

export const createPaymentLink = async (request: PayOSCreateRequest) => {
// Chỉ định kiểu cho response và sửa endpoint đúng
const response = await axios.post<PayOSResponse>(`${API_URL}/create`, request, {
headers: getAuthHeaders(),
});
return response.data.result.checkoutUrl;
};

// Hàm mở URL thanh toán trong tab mới
export const openPaymentInNewTab = (url: string) => {
window.open(url, '\_blank');
};

// Hàm xử lý response PayOS trực tiếp
export const handlePayOSResponse = (response: PayOSResponse) => {
if (response.code === 0 && response.message === "Thành công" && response.result?.checkoutUrl) {
openPaymentInNewTab(response.result.checkoutUrl);
return true;
}
return false;
};

2. Create PayOS Payment Handler Component (src/components/PayOSPaymentHandler.tsx)

import { useEffect } from 'react';
import { openPaymentInNewTab } from '../services/payos.service';

interface PayOSResponse {
code: number;
message: string;
result: {
checkoutUrl: string;
};
}

interface PayOSPaymentHandlerProps {
response: PayOSResponse | null;
onSuccess?: () => void;
onError?: (message: string) => void;
}

const PayOSPaymentHandler: React.FC<PayOSPaymentHandlerProps> = ({
response,
onSuccess,
onError,
}) => {
useEffect(() => {
if (!response) return;

    if (response.code === 0 && response.message === "Thành công" && response.result?.checkoutUrl) {
      // Mở URL thanh toán trong tab mới
      openPaymentInNewTab(response.result.checkoutUrl);
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError("Không thể mở trang thanh toán PayOS");
    }

}, [response, onSuccess, onError]);

// Component này không render gì cả, chỉ xử lý logic
return null;
};

export default PayOSPaymentHandler;

3. Create PayOS Payment Page (src/pages/PayOSPayment.tsx)

import { useState } from 'react';
import PayOSPaymentHandler from '../components/PayOSPaymentHandler';

// Ví dụ response từ PayOS với giá tiền đã bao gồm phí vận chuyển
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

// Giả lập thông tin đơn hàng
const orderInfo = {
subtotal: 2000,
shippingFee: 30000,
total: 32000 // Tổng tiền đã bao gồm phí vận chuyển
};

const handlePayment = () => {
// Trong thực tế, bạn sẽ gọi API để lấy response
// Ở đây chúng ta sử dụng mẫu response
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

        {/* Component xử lý thanh toán PayOS */}
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

4. Modify Checkout Page to Add PayOS Support
   Add the import for PayOS services at the top of your Checkout.tsx file:

import { createPaymentLink, openPaymentInNewTab } from '../services/payos.service';

Add the PayOS payment option to the payment method select dropdown:

<select
name="paymentMethod"
className="w-full border rounded px-3 py-2"
value={form.paymentMethod}
onChange={handleChange}

>

  <option value="cod">Thanh toán khi nhận hàng (COD)</option>
  <option value="momo">Thanh toán qua Momo</option>
  <option value="vnpay">Thanh toán qua VNPAY</option>
  <option value="payos">Thanh toán qua PayOS</option>
</select>

Add the PayOS payment handling logic in the handleSubmit function:

else if (form.paymentMethod === 'payos') {
// Tạo payload cho PayOS
const payOSPayload = {
orderCode: parseInt(order.id),
amount: Math.round(order.total + shippingFee), // Thêm phí vận chuyển vào tổng tiền
description: `Thanh toán đơn hàng #${order.id}`,
buyerName: form.customerName,
buyerEmail: form.email,
buyerPhone: form.phone,
buyerAddress: form.address,
items: items.map(item => ({
name: item.name,
quantity: item.quantity,
price: Math.round(item.price)
}))
};

const paymentUrl = await createPaymentLink(payOSPayload);
// Mở URL thanh toán trong tab mới thay vì chuyển hướng
openPaymentInNewTab(paymentUrl);
// Không chuyển hướng trang hiện tại
// window.location.href = paymentUrl;
}

5. Update App.tsx to Add PayOS Route
   Import the PayOS payment page:

import PayOSPayment from './pages/PayOSPayment';

Add the route in the router configuration:

<Route path="payment/payos" element={<PayOSPayment />} />

Important Notes
Backend Requirements: Your backend needs to support PayOS integration. The API endpoint needs to be available at: http://localhost:8080/doan/payment/payos/create
Response Format: Make sure your backend returns the response in the expected format:

{
"code": 0,
"message": "Thành công",
"result": {
"checkoutUrl": "https://pay.payos.vn/web/checkout/123456789"
}
}

Shipping Fee: The implementation includes shipping fee in the total amount. Make sure your backend handles this correctly.
New Tab Behavior: The implementation opens the PayOS payment page in a new tab instead of redirecting the current page, which improves user experience.
Testing: After implementation, test the PayOS payment by creating an order and selecting PayOS as the payment method.

Implementation Steps
Create the PayOS service file
Create the PayOS payment handler component
Create the sample PayOS payment page
Modify the Checkout page to add PayOS support
Update App.tsx to add the PayOS route
