import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from 'D:/DoAn/doan_fe/src/assets/LogoHungDung.png'
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaHeart, FaSignOutAlt } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import * as searchService from '../services/search.service';

interface User {
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  thumbnailUrl?: string; // Assuming product has a thumbnail URL
  // Add other product fields as needed for display
}

interface Category {
  id: number;
  name: string;
  // Add other category fields as needed for display
}

interface SearchSuggestionResults {
  products: Product[];
  categories: Category[];
}

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

const Header = ({ searchTerm, setSearchTerm, handleSearch }: HeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState<SearchSuggestionResults | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const wishlistKey = userId ? `wishlist_${userId}` : 'wishlist';
    setIsLoggedIn(!!token && !!userStr);
    setCurrentUser(userStr ? JSON.parse(userStr) : null);

    // Cập nhật số lượng sản phẩm yêu thích
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    return () => window.removeEventListener('storage', updateWishlistCount);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
        suggestionDropdownRef.current && !suggestionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate('/login');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert('Vui lòng đăng nhập để sử dụng tính năng này!');
      navigate('/login');
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length >= 2) {
      try {
        const response = await searchService.search(term);
        setSuggestions(response.result);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions(null);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions(null);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      setShowSuggestions(false);
      // handleSearch will be called if it was a product/category link
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md">
      {/* Header chính */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Đồ gỗ mỹ nghệ Hùng Dũng" className="h-14 w-auto" />
            <span className="font-bold text-xl text-[#8B4513] hidden md:block">Đồ gỗ mỹ nghệ Hùng Dũng</span>
          </Link>

          {/* Thanh tìm kiếm - Ẩn trên mobile */}
          <div className="hidden md:flex flex-1 mx-8 max-w-xl relative">
            <form className="w-full flex" onSubmit={e => { e.preventDefault(); handleSearch(e); }}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full border border-gray-300 rounded-l-full px-6 py-2 focus:outline-none focus:border-[#8B4513]"
                value={searchTerm}
                onChange={handleInputChange}
                ref={searchInputRef}
                onFocus={() => searchTerm.trim().length >= 2 && suggestions && setShowSuggestions(true)}
              />
              <button
                type="submit"
                className="bg-[#8B4513] text-white px-6 py-2 rounded-r-full hover:bg-[#6B3410] transition flex items-center gap-2"
                style={{ marginLeft: '-1px' }}
              >
                <FaSearch />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </form>
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions && searchTerm && searchTerm.trim().length >= 2 && (
              <div ref={suggestionDropdownRef} className="absolute left-0 right-0 top-full bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {
                  suggestions.products.length > 0 || suggestions.categories.length > 0 ? (
                    <>
                      {/* Product Suggestions */}
                      {suggestions.products.length > 0 && (
                        <div className="py-2">
                          <div className="px-4 py-1 text-sm font-semibold text-gray-600 border-b">Sản phẩm</div>
                          {suggestions.products.map(product => (
                            <Link
                              key={`product-${product.id}`}
                              to={`/products/${product.id}`}
                              className="flex items-center px-4 py-2 hover:bg-gray-100"
                              onClick={() => setShowSuggestions(false)}
                            >
                              {product.thumbnailUrl && (
                                <img src={product.thumbnailUrl} alt={product.name} className="w-10 h-10 object-cover mr-3 rounded" />
                              )}
                              <span>{product.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {/* Category Suggestions */}
                      {suggestions.categories.length > 0 && (
                        <div className="py-2">
                          <div className="px-4 py-1 text-sm font-semibold text-gray-600 border-b">Danh mục</div>
                          {suggestions.categories.map(category => (
                            <Link
                              key={`category-${category.id}`}
                              to={`/products?category=${category.id}`}
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => setShowSuggestions(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Không tìm thấy kết quả nào.</div>
                  )
                }
              </div>
            )}
          </div>

          {/* Menu icons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/wishlist" 
              className="relative text-gray-600 hover:text-[#8B4513] transition"
              onClick={handleWishlistClick}
            >
              <FaHeart className="text-xl" />
              {isLoggedIn && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-[#8B4513] transition">
              <FaShoppingCart className="text-xl" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B4513] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {isLoggedIn && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 text-gray-600 hover:text-[#8B4513] transition"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FaUser className="text-xl" />
                  <span className="hidden md:inline">{currentUser.name}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-[#8B4513]">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <Link to="/user" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">
                      Tài khoản của tôi
                    </Link>
                    <Link to="/user/orders" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">
                      Đơn hàng của tôi
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-gray-600 hover:text-[#8B4513] transition">
                <FaUser className="text-xl" />
                <span className="hidden md:inline">Đăng nhập</span>
              </Link>
            )}
            <button
              className="md:hidden text-gray-600 hover:text-[#8B4513] transition text-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#8B4513] text-white py-3 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center space-x-20 text-lg font-semibold">
            <li><Link to="/" className="text-white hover:text-amber-200 transition">Trang chủ</Link></li>
            <li><Link to="/products" className="text-white hover:text-amber-200 transition">Sản phẩm</Link></li>
            {/* <li><Link to="/news" className="text-white hover:text-amber-200 transition">Tin tức</Link></li> */}
            <li><Link to="/about" className="text-white hover:text-amber-200 transition">Giới thiệu</Link></li>
            <li><Link to="/contact" className="text-white hover:text-amber-200 transition">Liên hệ</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white bg-opacity-95 z-40 flex flex-col items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-gray-600 hover:text-[#8B4513] transition text-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaTimes />
          </button>
          <ul className="text-2xl font-bold text-[#8B4513] space-y-10">
            <li><Link to="/" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
            <li><Link to="/products" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Sản phẩm</Link></li>
            <li><Link to="/news" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Tin tức</Link></li>
            <li><Link to="/about" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link></li>
            <li><Link to="/contact" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Liên hệ</Link></li>
            {isLoggedIn && currentUser ? (
              <>
                <li><Link to="/user" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Tài khoản của tôi</Link></li>
                <li><Link to="/user/orders" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Đơn hàng của tôi</Link></li>
                <li><button onClick={handleLogout} className="w-full text-left hover:text-amber-200 transition">Đăng xuất</button></li>
              </>
            ) : (
              <li><Link to="/login" className="hover:text-amber-200 transition" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link></li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header 