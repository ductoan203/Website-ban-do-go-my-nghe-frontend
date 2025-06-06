import React from 'react'

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-40 object-cover rounded mb-4"
    />
    <div className="font-bold text-lg mb-2 text-center">{product.name}</div>
    <div className="text-[#8B4513] font-semibold mb-2">
      {product.price.toLocaleString('vi-VN')}đ
    </div>
    <button className="mt-auto bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition">
      Xem chi tiết
    </button>
  </div>
)

export default ProductCard 