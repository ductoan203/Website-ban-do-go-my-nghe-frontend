import React from 'react';

interface Category {
  id: number;
  name: string;
}

interface ProductFilterSidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  selectedStockStatus: string;
  setSelectedStockStatus: (status: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const stockStatusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'con_hang', label: 'Còn hàng' },
  { value: 'het_hang', label: 'Hết hàng' },
];

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedStockStatus,
  setSelectedStockStatus,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <aside className="w-full md:w-1/4 p-4 bg-white rounded-xl shadow-lg mb-6 md:mb-0 sticky top-24 self-start">
      <h2 className="text-xl font-semibold mb-6 text-[#8B4513]">Bộ lọc sản phẩm</h2>
      {/* Lọc theo loại sản phẩm */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm:</label>
        <select
          id="category"
          value={selectedCategoryId}
          onChange={e => setSelectedCategoryId(e.target.value)}
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
          onChange={e => setSelectedStockStatus(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B4513] focus:ring-[#8B4513] sm:text-sm"
        >
          {stockStatusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
  );
};

export default ProductFilterSidebar; 