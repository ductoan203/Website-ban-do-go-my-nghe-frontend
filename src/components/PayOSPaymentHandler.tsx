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
      openPaymentInNewTab(response.result.checkoutUrl);
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError("Không thể mở trang thanh toán PayOS");
    }
  }, [response, onSuccess, onError]);
  return null;
};

export default PayOSPaymentHandler; 