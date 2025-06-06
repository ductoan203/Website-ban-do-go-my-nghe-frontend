import { useEffect, useState } from 'react'
import * as categoryService from '../../services/admin.service'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  id: number
  name: string
  description: string
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({ name: '', description: '' })
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    fetchCategories()
  }, []);

  const fetchCategories = async (term: string = '') => {
    setLoading(true)
    try {
      const res: any = await categoryService.getAllCategories(term);
      setCategories(Array.isArray(res.data.result) ? res.data.result : []);
    } catch (err: any) {
      console.error("Lỗi khi lấy danh sách danh mục", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi tải danh mục";
      toast.error(errorMessage);
      setCategories([]);
    }
    setLoading(false)
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, description: category.description })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', description: '', })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '', })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    console.log('Đang tìm kiếm danh mục với từ khóa:', searchTerm);
    fetchCategories(searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
        toast.warn("Tên danh mục không được để trống!");
        return;
    }
    setLoading(true)
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData)
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.createCategory(formData)
        toast.success("Thêm danh mục thành công!");
      }
      handleCloseModal()
      fetchCategories(searchTerm);
    } catch (err: any) {
      console.error("Lỗi khi lưu danh mục:", err);
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra khi lưu danh mục!";
      toast.error(errorMessage);
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setLoading(true)
      try {
        await categoryService.deleteCategory(id)
        toast.success("Xóa danh mục thành công!");
        fetchCategories(searchTerm);
      } catch (err: any) {
        console.error("Lỗi khi xóa danh mục:", err);
        const errorMessage = err.response?.data?.message || "Xóa danh mục thất bại!";
        toast.error(errorMessage);
      }
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Quản lý danh mục</h1>
          <p className="mt-2 text-sm text-gray-700">Danh sách các danh mục sản phẩm</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
           <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Thêm danh mục
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
         <div className="flex items-center">
           <input
             type="text"
             placeholder="Tìm kiếm danh mục..."
             className="px-3 py-2 border rounded w-64"
             value={searchTerm}
             onChange={handleSearchChange}
             onKeyPress={(e) => {
                 if (e.key === 'Enter') {
                     handleSearch();
                 }
             }}
           />
           <button
             onClick={handleSearch}
             className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
           >
             Tìm kiếm
           </button>
         </div>
       </div>

      <div className="mt-8 flex flex-col">
        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tên danh mục</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mô tả</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                 {Array.isArray(categories) && categories.map((category, index) => (
                  <tr key={category.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">{index + 1}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{category.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{category.description}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button onClick={() => handleOpenModal(category)} className="text-blue-600 hover:text-blue-900 mr-4">Sửa</button>
                      <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                    {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement; 