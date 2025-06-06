import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  imageUrl: string;
  material: string;
  dimensions: string;
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const wishlistKey = userId ? `wishlist_${userId}` : 'wishlist';
    if (!token) {
      navigate('/login');
      return;
    }
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    setWishlist(savedWishlist);
  }, [navigate]);

  const removeFromWishlist = (productId: number) => {
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const wishlistKey = userId ? `wishlist_${userId}` : 'wishlist';
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem(wishlistKey, JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('storage'));
  };

  const addToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: `http://localhost:8080/doan${product.thumbnailUrl || product.imageUrl}`,
      quantity: 1
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#8B4513] mb-8">Danh sách yêu thích</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Bạn chưa có sản phẩm yêu thích nào</p>
          <Link 
            to="/products" 
            className="inline-block bg-[#8B4513] text-white px-6 py-3 rounded-full hover:bg-[#6B3410] transition"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#8B4513] mb-8">Danh sách yêu thích</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="relative">
              <img 
                src={`http://localhost:8080/doan${product.thumbnailUrl || product.imageUrl}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition"
              >
                <FaTrash />
              </button>
            </div>
            <div className="p-4">
              <Link to={`/products/${product.id}`} className="block">
                <h3 className="font-semibold text-lg text-[#8B4513] mb-2 hover:text-[#6B3410] transition">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#8B4513]">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 bg-[#8B4513] text-white px-4 py-2 rounded-full hover:bg-[#6B3410] transition"
                >
                  <FaShoppingCart />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 