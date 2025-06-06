import { Link } from 'react-router-dom'
import ProductHighlights from '../components/ProductHighlights'
import ProductCategoriesSection from '../components/ProductCategoriesSection'
import NewsSection from '../components/NewsSection'
import ServiceHighlights from '../components/ServiceHighlights'
import BannerCarousel from '../components/Carousel'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <BannerCarousel />
      {/* Product Highlights */}
      <ProductHighlights />
      {/* Product Categories Section */}
      <ProductCategoriesSection />
      {/* News Section */}
      <NewsSection />
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
