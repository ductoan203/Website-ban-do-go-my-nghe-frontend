import React from 'react'

const news = [
  {
    id: 1,
    title: 'Bí quyết chọn đồ gỗ phù hợp cho phòng khách',
    image: '/images/news1.jpg',
    date: '2024-06-01',
    summary: 'Hướng dẫn chọn lựa đồ gỗ mỹ nghệ phù hợp với không gian sống hiện đại.'
  },
  {
    id: 2,
    title: 'Xu hướng nội thất gỗ 2024',
    image: '/images/news2.jpg',
    date: '2024-05-20',
    summary: 'Khám phá các mẫu nội thất gỗ đang được ưa chuộng nhất năm nay.'
  },
  {
    id: 3,
    title: 'Bảo quản đồ gỗ đúng cách',
    image: '/images/news3.jpg',
    date: '2024-05-10',
    summary: 'Những lưu ý quan trọng giúp đồ gỗ luôn bền đẹp với thời gian.'
  }
]

export default function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Tin tức</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg shadow p-4">
              <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded mb-4" />
              <div className="text-xs text-gray-400 mb-2">{item.date}</div>
              <div className="font-bold text-lg mb-2">{item.title}</div>
              <div className="text-gray-600 mb-4">{item.summary}</div>
              <a href="#" className="text-[#8B4513] hover:underline font-semibold">Xem chi tiết</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 