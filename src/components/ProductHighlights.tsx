import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_TOP_PRODUCTS = 'http://localhost:8080/doan/products/highlight'

export default function ProductHighlights() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    axios.get(API_TOP_PRODUCTS)
      .then(res => {
      const data = res.data as any;
      setProducts(data.result.slice(0, 4))
    })
      .catch(err => {
        console.error('Lỗi khi lấy sản phẩm nổi bật:', err);
      });
  }, [])

  const totalPages = Math.ceil(products.length / pageSize)
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className="py-12 bg-[#f3e3c3]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#4B2E1A] mb-6 text-center uppercase">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8B4513] border"
            >
              <img src={`http://localhost:8080/doan${product.thumbnailUrl || product.imageUrl}`} alt={product.name} className="h-40 object-contain mb-2" />
              <h3 className="font-bold text-lg text-[#8B4513] mb-1">{product.name}</h3>
              <div className="text-[#8B4513] font-semibold mb-1">{product.price?.toLocaleString('vi-VN')}đ</div>
              {product.sold && <div className="text-sm text-green-600 mb-2">Đã bán: {product.sold}</div>}
              <Link
                to={`/products/${product.id}`}
                className="bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition mt-2"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 