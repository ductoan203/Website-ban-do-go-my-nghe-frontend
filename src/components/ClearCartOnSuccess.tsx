import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

export default function ClearCartOnSuccess({ shouldClear }: { shouldClear: boolean }) {
  const { clearCart } = useCart();
  useEffect(() => {
    if (shouldClear) {
      clearCart();
    }
    // eslint-disable-next-line
  }, [shouldClear]);
  return null;
}
