import React from 'react'

const services = [
  {
    id: 1,
    icon: '🚚',
    title: 'Giao hàng tận nơi',
    desc: 'Miễn phí giao hàng cho đơn từ 2 triệu đồng.'
  },
  {
    id: 2,
    icon: '🛠️',
    title: 'Bảo hành 2 năm',
    desc: 'Cam kết bảo hành sản phẩm lên đến 24 tháng.'
  },
  {
    id: 3,
    icon: '🎨',
    title: 'Thiết kế theo yêu cầu',
    desc: 'Nhận thiết kế, đóng mới theo mọi ý tưởng của bạn.'
  },
  {
    id: 4,
    icon: '💳',
    title: 'Thanh toán linh hoạt',
    desc: 'Chấp nhận nhiều hình thức thanh toán tiện lợi.'
  }
]

export default function ServiceHighlights() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Dịch vụ nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-4xl mb-4">{s.icon}</div>
              <div className="font-bold text-lg mb-2">{s.title}</div>
              <div className="text-gray-600">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 