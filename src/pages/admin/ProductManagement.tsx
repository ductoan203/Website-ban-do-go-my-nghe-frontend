import { useEffect, useState } from 'react'
import * as productService from '../../services/admin.service'
import UploadImage from '../../components/admin/UploadImage'
import * as categoryService from '../../services/admin.service'
import { Link } from 'react-router-dom'

interface ProductImage {
  id: number
  imageUrl: string
}

interface Category {
  id: number
  name: string
  description: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  thumbnailUrl: string
  material: string
  dimensions: string
  quantityInStock: number
  category: Category
  createdAt: string
  updatedAt: string
  images: ProductImage[]
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    thumbnailUrl: '',
    material: '',
    dimensions: '',
    quantityInStock: 0,
    category: { id: 0, name: '', description: '' },
    images: []
  })
  const [categories, setCategories] = useState<Category[]>([])

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Gọi API lấy danh mục
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories() as any;
        setCategories(Array.isArray(res.data.result) ? res.data.result : [])
      } catch(error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productService.getAllProducts() as any;
      setProducts(Array.isArray(res.data.result) ? res.data.result : [])
    } catch(error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        thumbnailUrl: product.thumbnailUrl,
        material: product.material,
        dimensions: product.dimensions,
        quantityInStock: product.quantityInStock,
        category: product.category,
        images: product.images
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        thumbnailUrl: '',
        material: '',
        dimensions: '',
        quantityInStock: 0,
        category: { id: 0, name: '', description: '' },
        images: []
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      thumbnailUrl: '',
      material: '',
      dimensions: '',
      quantityInStock: 0,
      category: { id: 0, name: '', description: '' },
      images: []
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        thumbnailUrl: formData.thumbnailUrl,
        material: formData.material,
        dimensions: formData.dimensions,
        quantityInStock: Number(formData.quantityInStock),
        categoryId: formData.category?.id,
        images: formData.images?.map(img => img.imageUrl),
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload)
      } else {
        await productService.createProduct(payload)
      }

      setIsModalOpen(false)
      fetchProducts()
    } catch (error) {
      console.error('Lỗi:', error)
      alert('Lưu sản phẩm thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productService.deleteProduct(id)
        fetchProducts()
      } catch(error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        alert('Xóa thất bại!')
      }
    }
  }

  // Lọc sản phẩm dựa trên searchTerm
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.dimensions.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
      </div>
      <div className="flex justify-end items-center space-x-2 mb-2">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm theo tên, chất liệu..."
          className="w-96 px-3 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => fetchProducts()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tìm kiếm
        </button>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="mt-8 flex flex-col">
        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 bg-white rounded shadow table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[200px] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Ảnh đại diện</th>
                  <th className="w-1/6 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tên</th>
                  <th className="w-20 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Giá</th>
                  <th className="w-1/6 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Chất liệu</th>
                  <th className="w-1/6 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kích thước</th>
                  <th className="w-20 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tồn kho</th>
                  <th className="w-1/6 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="w-28 relative py-3.5 pl-3 pr-4 sm:pr-6 text-sm font-semibold text-gray-900 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <img src={`http://localhost:8080/doan${product.thumbnailUrl}`} alt={product.name} className="w-full max-h-32 object-contain rounded-md mx-auto" />
                    </td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.name}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.material}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.dimensions}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.quantityInStock}</td>
                    <td className="whitespace-normal px-3 py-4 text-sm text-gray-500">{product.category?.name}</td>
                    <td className="relative whitespace-normal py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            {/* Adjusted modal width and added ml-64 */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full ml-64">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Grid layout for wider inputs */}
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                   <div className="col-span-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá</label>
                    <input type="number" name="price" id="price" required value={formData.price} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Danh mục</label>
                    <select
                      name="categoryId"
                      id="categoryId"
                      required
                      value={formData.category?.id || ''}
                      onChange={e => {
                        const selected = categories.find(c => c.id === Number(e.target.value))
                        setFormData(prev => ({
                          ...prev,
                          category: selected || { id: 0, name: '', description: '' }
                        }))
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="quantityInStock" className="block text-sm font-medium text-gray-700">Tồn kho</label>
                    <input type="number" name="quantityInStock" id="quantityInStock" required value={formData.quantityInStock} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                   <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea name="description" id="description" required value={formData.description} onChange={handleInputChange as any} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="material" className="block text-sm font-medium text-gray-700">Chất liệu</label>
                    <input type="text" name="material" id="material" value={formData.material} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="col-span-1">
                    <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">Kích thước</label>
                    <input type="text" name="dimensions" id="dimensions" value={formData.dimensions} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700">Ảnh thumbnail</label>
                    <UploadImage
                        onUploaded={(url) => {
                          console.log("Đã upload thành công, thumbnail:", url)
                          setFormData((prev) => ({ ...prev, thumbnailUrl: url }))
                        }}
                      />

                    {formData.thumbnailUrl && (
                      <img src={`http://localhost:8080/doan${formData.thumbnailUrl}`} alt={formData.name} width={60} className="mt-2"/>

                    )}
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Ảnh chi tiết</label>
                    <UploadImage multiple onUploaded={(url) => setFormData((prev) => ({ ...prev, images: [...prev.images || [], { id: 0, imageUrl: url }] }))} />
                    
                    {formData.images && formData.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={`http://localhost:8080/doan${img.imageUrl}`}
                              alt={`Detail ${index}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images?.filter((_, i) => i !== index)
                                }))
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              title="Xóa ảnh"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}


                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
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

export default ProductManagement