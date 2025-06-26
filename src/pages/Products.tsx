import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<string>(''); // '' | 'asc' | 'desc'

  const location = useLocation();
  const navigate = useNavigate();

  // Lấy categoryId từ URL khi vào trang
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category') || '';
    setSelectedCategoryId(categoryId);
  }, [location.search]);

  // Khi thay đổi bộ lọc, cập nhật URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId) params.set('category', selectedCategoryId);
    if (selectedStockStatus) params.set('stockStatus', selectedStockStatus);
    if (sortOrder) params.set('sort', sortOrder);
    navigate({ pathname: '/products', search: params.toString() }, { replace: true });
  }, [selectedCategoryId, selectedStockStatus, sortOrder, navigate]);

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
          stockStatus: selectedStockStatus || undefined,
          sort: sortOrder || undefined,
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
  }, [page, pageSize, selectedCategoryId, selectedStockStatus, sortOrder]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, selectedStockStatus, sortOrder]);

  const stockStatusOptions = ['con_hang', 'het_hang'];

  return (
    <div className="container mx-auto py-8 px-2 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#4B2E1A] text-center uppercase tracking-wide">Tất cả sản phẩm</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar bộ lọc */}
        <aside className="w-full md:w-1/4 p-4 bg-white rounded-xl shadow-lg mb-6 md:mb-0 sticky top-24 self-start">
          <h2 className="text-xl font-semibold mb-6 text-[#8B4513]">Bộ lọc sản phẩm</h2>
          {/* Lọc theo loại sản phẩm */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm:</label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B4513] focus:ring-[#8B4513] sm:text-sm"
            >
              <option value="">Tất cả</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Lọc theo tình trạng hàng */}
          <div className="mb-6">
            <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">Tình trạng hàng:</label>
            <select
              id="stockStatus"
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B4513] focus:ring-[#8B4513] sm:text-sm"
            >
              <option value="">Tất cả</option>
              {stockStatusOptions.map(status => (
                <option key={status} value={status}>{status === 'con_hang' ? 'Còn hàng' : status === 'het_hang' ? 'Hết hàng' : status}</option>
              ))}
            </select>
          </div>
          {/* Sắp xếp giá */}
          <div className="mb-6">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp giá:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B4513] focus:ring-[#8B4513] sm:text-sm"
            >
              <option value="">Mặc định</option>
              <option value="asc">Giá từ thấp đến cao</option>
              <option value="desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </aside>
        {/* Danh sách sản phẩm */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-[#f3e9e2] hover:border-[#8B4513]"
              >
                <img src={`http://localhost:8080/doan${product.thumbnailUrl || (product as any).imageUrl}`} alt={product.name} className="h-40 object-contain mb-2 rounded-lg" />
                <h3 className="font-bold text-lg text-[#8B4513] mb-1 text-center line-clamp-2 min-h-[48px]">{product.name}</h3>
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
                  className="bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition mt-2 w-full text-center font-semibold"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
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
        </main>
      </div>
    </div>
  )
}

export default Products 