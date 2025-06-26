import { Link } from 'react-router-dom'
import ProductHighlights from '../components/ProductHighlights'
import ProductCategoriesSection from '../components/ProductCategoriesSection'
import NewsSection from '../components/NewsSection'
import ServiceHighlights from '../components/ServiceHighlights'
import BannerCarousel from '../components/Carousel'
import { useEffect, useState } from 'react'

function NewsHomeSection() {
  const [news, setNews] = useState<any[]>([])
  useEffect(() => {
    fetch('http://localhost:8080/doan/news')
      .then(res => res.json())
      .then(data => setNews((data.result || []).slice(0, 3)))
  }, [])
  if (!news.length) return null
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#8B4513] mb-6 text-center uppercase">Tin tức mới nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {news.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col">
              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-40 object-cover rounded mb-4" />
              <div className="text-xs text-gray-400 mb-2">{item.createdAt?.slice(0, 10)}</div>
              <div className="font-bold text-lg mb-2 line-clamp-2">{item.title}</div>
              <div className="text-gray-600 mb-4 line-clamp-3">{item.content?.slice(0, 80)}...</div>
              <Link to={`/news/${item.slug}`} className="text-[#8B4513] hover:underline font-semibold mt-auto">Xem chi tiết</Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/news" className="inline-block bg-[#8B4513] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#6B3410] transition">Xem tất cả tin tức</Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BannerCarousel />
      {/* Product Highlights */}
      <ProductHighlights />
      {/* Product Categories Section */}
      <ProductCategoriesSection />
      {/* News Section */}
      {/* <NewsHomeSection /> */}
      {/* Service Highlights */}
      <ServiceHighlights />
      {/* Promotion Banner */}
      <section className="bg-[#8B4513] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ưu đãi đặc biệt cho khách hàng mới
          </h2>
          <p className="text-lg mb-8">
            Giảm ngay 10% cho đơn hàng đầu tiên khi đăng ký thành viên
          </p>
          <Link
            to="/register"
            className="bg-white text-[#8B4513] hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300"
          >
            Đăng ký ngay
          </Link>
        </div>
      </section>
    </div>
  )
}
