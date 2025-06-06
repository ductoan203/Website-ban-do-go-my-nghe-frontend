import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import cartService from '../services/cart.service';
import { toast } from 'react-toastify';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    setItemCount(items.reduce((sum, item) => sum + item.quantity, 0));
  }, [items]);

  const reload = async () => {
    console.log('Reloading cart...');
    if (isLoggedIn()) {
      console.log('User is logged in, fetching cart from BE.');
      try {
        const guestCartKey = 'cart_guest';
        const savedGuestCart = localStorage.getItem(guestCartKey);
        if (savedGuestCart) {
          const guestItems: CartItem[] = JSON.parse(savedGuestCart);
          if (guestItems.length > 0) {
            console.log(`Found ${guestItems.length} items in guest cart, merging...`);
            for (const item of guestItems) {
              try {
                await cartService.addToCart(item.id, item.quantity);
              } catch (addError) {
                console.error(`Error merging item ${item.id}:`, addError);
              }
            }
            localStorage.removeItem(guestCartKey);
            console.log('Guest cart merged and cleared.');
          }
        }

        const beCart = await cartService.getCart();
        setItems(beCart);
        console.log('Cart loaded from BE:', beCart);
      } catch (e) {
        console.error('Error fetching cart from BE:', e);
        setItems([]);
      }
    } else {
      console.log('User is NOT logged in, fetching cart from localStorage.');
      const guestCartKey = 'cart_guest';
      const savedCart = localStorage.getItem(guestCartKey);
      setItems(savedCart ? JSON.parse(savedCart) : []);
      console.log('Cart loaded from localStorage:', savedCart);
    }
  };

  useEffect(() => {
    const handleTokenChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    window.addEventListener('focus', handleTokenChange);
    window.addEventListener('storage', handleTokenChange);

    return () => {
      window.removeEventListener('focus', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

  useEffect(() => {
    reload();
  }, [token]);

  const addItem = async (item: CartItem) => {
    if (isLoggedIn()) {
      try {
        await cartService.addToCart(item.id, item.quantity);
        await reload();
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng BE:', error);
        throw error;
      }
    } else {
      setItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);
        let newCart;
        if (existingItem) {
          newCart = prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        } else {
          newCart = [...prevItems, item];
        }
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const removeItem = async (id: number) => {
    if (isLoggedIn()) {
      await cartService.removeFromCart(id);
      await reload();
    } else {
      setItems(prev => {
        const newCart = prev.filter(i => i.id !== id);
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    if (isLoggedIn()) {
      await cartService.updateCartItem(id, quantity);
      await reload();
    } else {
      setItems(prev => {
        const newCart = prev.map(i => i.id === id ? { ...i, quantity } : i);
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const clearCart = async () => {
    if (isLoggedIn()) {
      for (const item of items) {
        await cartService.removeFromCart(item.id);
      }
      await reload();
    } else {
      setItems([]);
      localStorage.removeItem('cart_guest');
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, reload }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
