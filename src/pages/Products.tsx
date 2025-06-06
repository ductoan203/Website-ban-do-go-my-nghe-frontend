import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  thumbnailUrl: string;
  material: string;
  dimensions: string;
  quantityInStock: number;
  category: { id: number; name: string; };
  createdAt: string;
  updatedAt: string;
  images: any[];
}

interface Category {
  id: number;
  name: string;
}

const API_PRODUCTS = 'http://localhost:8080/doan/products'
const API_CATEGORIES = 'http://localhost:8080/doan/categories'

// Định nghĩa các khoảng giá cố định
const priceRanges = [
  { label: 'Dưới 500,000đ', min: 0, max: 500000 },
  { label: '500,000đ - 1,000,000đ', min: 500000, max: 1000000 },
  { label: '1,000,000đ - 1,500,000đ', min: 1000000, max: 1500000 },
  { label: '1,500,000đ - 2,000,000đ', min: 1500000, max: 2000000 },
  { label: '2,000,000đ - 5,000,000đ', min: 2000000, max: 5000000 },
  { label: 'Trên 5,000,000đ', min: 5000000, max: undefined },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min?: number, max?: number } | null>(null);
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('')
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Fetch categories for filter dropdown
  useEffect(() => {
    axios.get(API_CATEGORIES).then(res => {
      const data = res.data as any;
      if (Array.isArray(data.result)) {
        setCategories(data.result);
      }
    }).catch(error => console.error("Error fetching categories:", error));
  }, []);

  // Fetch products with filters and pagination
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const params: any = {
          page: page - 1,
          size: pageSize,
          categoryId: selectedCategoryId || undefined,
          minPrice: selectedPriceRange?.min !== undefined ? selectedPriceRange.min : undefined,
          maxPrice: selectedPriceRange?.max !== undefined ? selectedPriceRange.max : undefined,
          stockStatus: selectedStockStatus || undefined,
        };
        
        Object.keys(params).forEach(key => (params as any)[key] === undefined && delete (params as any)[key]);

        console.log('Fetching products with params:', params);
        const res = await axios.get(API_PRODUCTS, { params });
        const data = res.data as any;
        console.log('API response data:', data);

        if (data && data.result && Array.isArray(data.result.content)) {
          console.log('Setting products:', data.result.content);
          setProducts(data.result.content);
          setTotalPages(data.result.totalPages);
          console.log('Total pages:', data.result.totalPages);
        } else {
            console.log('API response did not contain expected product data or was empty.');
            setProducts([]);
            setTotalPages(0);
        }
      } catch (error) {
        console.error("Error fetching filtered products:", error);
        setProducts([]);
        setTotalPages(0);
      }
    };

    fetchFilteredProducts();
  }, [page, pageSize, selectedCategoryId, selectedPriceRange, selectedStockStatus]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, selectedPriceRange, selectedStockStatus]);

  const stockStatusOptions = ['con_hang', 'het_hang'];

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-[#4B2E1A] text-center uppercase">Tất cả sản phẩm</h1>
      
      {/* Main content area with filters on the left */}
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Filter section - Left Sidebar */}
        <div className="w-full sm:w-1/4 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc sản phẩm</h2>
          
          {/* Lọc theo loại sản phẩm */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm:</label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Tất cả</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo giá sản phẩm (dropdown) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá sản phẩm:</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span>
                  {selectedPriceRange 
                    ? priceRanges.find(range => range.min === selectedPriceRange.min && range.max === selectedPriceRange.max)?.label 
                    : 'Chọn khoảng giá'}
                </span>
                <svg className={`h-5 w-5 text-gray-400 transform transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isPriceDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
                  {priceRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => {
                        if (selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max) {
                          setSelectedPriceRange(null);
                        } else {
                          setSelectedPriceRange({ min: range.min, max: range.max });
                        }
                        setIsPriceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
                          ? 'bg-gray-100 text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Lọc theo tình trạng hàng */}
          <div className="">
            <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">Tình trạng hàng:</label>
            <select
              id="stockStatus"
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Tất cả</option>
              {stockStatusOptions.map(status => (
                <option key={status} value={status}>{status === 'con_hang' ? 'Còn hàng' : status === 'het_hang' ? 'Hết hàng' : status}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Product Grid */}
        <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: Product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8B4513] border"
          >
                <img src={`http://localhost:8080/doan${product.thumbnailUrl || (product as any).imageUrl}`} alt={product.name} className="h-40 object-contain mb-2" />
            <h3 className="font-bold text-lg text-[#8B4513] mb-1">{product.name}</h3>
                {product.discountPrice && product.discountPrice < product.price ? (
                  <div className="text-[#8B4513] font-semibold mb-1">
                    <span className="line-through text-gray-500 mr-2">{product.price.toLocaleString('vi-VN')}đ</span>
                    {product.discountPrice.toLocaleString('vi-VN')}đ
                  </div>
                ) : (
                  <div className="text-[#8B4513] font-semibold mb-1">{product.price.toLocaleString('vi-VN')}đ</div>
                )}
                
                <div className="text-sm text-gray-500 mb-2">Chất liệu: {product.material || 'N/A'}</div>
                <div className="text-sm text-gray-500 mb-2">Kích thước: {product.dimensions || 'N/A'}</div>
                <div className={`text-sm font-semibold ${product.quantityInStock > 0 ? 'text-green-600' : 'text-red-600'} mb-2`}>
                    Tình trạng: {product.quantityInStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                </div>

            <Link 
              to={`/products/${product.id}`}
              className="bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition mt-2"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
      {/* Phân trang */}
          {totalPages > 1 && (
      <div className="flex justify-center mt-6 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Trước</button>
        <span className="px-3 py-1">{page}/{totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >Sau</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products 