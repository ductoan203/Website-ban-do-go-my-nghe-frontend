import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API_PRODUCTS = 'http://localhost:8080/doan/products/all'
const API_CATEGORIES = 'http://localhost:8080/doan/categories'

export default function ProductCategoriesSection() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API_CATEGORIES).then(res => {
      const data = res.data as any;
      setCategories(data.result)
    })
    axios.get(API_PRODUCTS).then(res => {
      const data = res.data as any;
      setProducts(data.result)
    })
  }, [])

  // Lọc sản phẩm theo danh mục, nếu chưa chọn thì hiển thị tất cả sản phẩm
  const displayedProducts = selectedCategory
    ? products.filter((p: any) => p.category?.id === selectedCategory)
    : products

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#4B2E1A] mb-6 text-center uppercase">Danh mục sản phẩm</h2>
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-semibold border-2 transition-all duration-200 uppercase text-sm
                ${selectedCategory === cat.id ? 'bg-[#8B4513] text-white border-[#8B4513]' : 'bg-white text-[#8B4513] border-[#8B4513] hover:bg-[#f3e3c3]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {displayedProducts.length === 0 && selectedCategory && (
            <div className="col-span-4 text-center text-gray-500 italic">Chưa có sản phẩm</div>
          )}
          {displayedProducts.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8B4513] border"
            >
              <img src={`http://localhost:8080/doan${product.thumbnailUrl || product.imageUrl}`} alt={product.name} className="h-40 object-contain mb-2" />
              <h3 className="font-bold text-lg text-[#8B4513] mb-1">{product.name}</h3>
              <div className="text-[#8B4513] font-semibold mb-1">{product.price?.toLocaleString('vi-VN')}đ</div>
              <div className="text-sm text-gray-500 mb-2">{product.material}</div>
              <Link
                to={`/products/${product.id}`}
                className="bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition mt-2"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
        {/* Nút xem tất cả sản phẩm */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/products')}
            className="bg-[#8B4513] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#6B3410] transition"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
    </section>
  )
} 