import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { FaHeart, FaRegHeart, FaMinus, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authService from '../services/auth.service';

interface ProductImage {
  id: number;
  imageUrl: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number;
  thumbnailUrl: string;
  material: string;
  dimensions: string;
  quantityInStock: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
}

interface Comment {
  id: number;
  user: {
    id: number;
    fullname: string;
  };
  content: string;
  createdAt: string;
  parentId?: number | null;
}

interface ApiResponse<T> {
  result: T;
  message: string;
  status: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const { addItem } = useCart();
  const [related, setRelated] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const isLoggedIn = authService.isAuthenticated();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get<ApiResponse<Product>>(`http://localhost:8080/doan/products/${id}`);
        setProduct(response.data.result);
        if (response.data.result.images && response.data.result.images.length > 0) {
          setMainImage(`http://localhost:8080/doan${response.data.result.images[0].imageUrl}`);
        } else {
          setMainImage(`http://localhost:8080/doan${response.data.result.thumbnailUrl}`);
        }
        // Kiểm tra wishlist
        const userStr = localStorage.getItem('user');
        const userId = userStr ? JSON.parse(userStr).id : null;
        const wishlistKey = userId ? `wishlist_${userId}` : 'wishlist';
        const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        setIsWishlisted(wishlist.some((item: Product) => item.id === response.data.result.id));
        // Lấy sản phẩm liên quan
        if (response.data.result.category?.id) {
          const relRes = await axios.get(`http://localhost:8080/doan/products?categoryId=${response.data.result.category.id}&top=8`);
          const data = relRes.data as { result: { content: Product[] } };
          const relatedProducts = Array.isArray(data.result.content) ? data.result.content : [];
          setRelated(relatedProducts.filter((p: Product) => p.id !== response.data.result.id));
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch comments
  const fetchComments = async () => {
    if (!id) return;
    setCommentLoading(true);
    try {
      const response = await axios.get<ApiResponse<Comment[]>>(`http://localhost:8080/doan/products/${id}/comments`);
      const mappedComments = Array.isArray(response.data.result)
        ? response.data.result.map((c: any) => ({
            ...c,
            user: {
              id: c.user.id !== undefined ? c.user.id : c.user.userId,
              fullname: c.user.fullname
            }
          }))
        : [];
      setComments(mappedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.warn('Vui lòng đăng nhập để mua hàng!');
      // navigate('/login');
      return;
    }
    if (!product) return;
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage || `http://localhost:8080/doan${product.thumbnailUrl}`,
        quantity: quantity
      });
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    }
  };

  const toggleWishlist = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const userId = userStr ? JSON.parse(userStr).id : null;
    const wishlistKey = userId ? `wishlist_${userId}` : 'wishlist';
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng tính năng này!');
      navigate('/login');
      return;
    }
    if (!product) return;
    let wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    if (isWishlisted) {
      wishlist = wishlist.filter((item: Product) => item.id !== product.id);
    } else {
      wishlist.push(product);
    }
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (value: number) => {
    if (!product) return;
    if (value < 1) return;
    const maxQuantity = product.quantityInStock;
    if (value > maxQuantity) {
      setQuantity(maxQuantity);
    } else {
      setQuantity(value);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.warn('Nội dung bình luận không được để trống.');
      return;
    }
    if (!product?.id) return;
    setCommentLoading(true);
    try {
      await axios.post<ApiResponse<Comment>>(`http://localhost:8080/doan/products/${product.id}/comments`, { content: newComment });
      await fetchComments();
      setNewComment('');
      toast.success('Bình luận của bạn đã được gửi!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Có lỗi xảy ra khi gửi bình luận.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Placeholder functions for handling edit and delete
  const handleEditComment = async (comment: Comment) => {
      const newContent = window.prompt('Nhập nội dung bình luận mới:', comment.content);
      if (newContent !== null && newContent.trim() !== '' && newContent !== comment.content) {
          setCommentLoading(true);
          try {
              await axios.put<ApiResponse<Comment>>(
                `http://localhost:8080/doan/products/${product?.id}/comments/${comment.id}`, 
                { content: newContent }
              );
              await fetchComments();
              toast.success('Bình luận đã được cập nhật.');
          } catch (error) {
              console.error('Error updating comment:', error);
              toast.error('Có lỗi xảy ra khi cập nhật bình luận.');
          } finally {
              setCommentLoading(false);
          }
      }
  };

  const handleDeleteComment = async (commentId: number) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
          setCommentLoading(true);
          try {
              // Call backend API to delete the comment
              // Assuming the DELETE endpoint is /products/{productId}/comments/{commentId}
              await axios.delete(`http://localhost:8080/doan/products/${product?.id}/comments/${commentId}`);
              
              toast.success('Bình luận đã được xóa.');
              // Remove the comment from the state
              setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
          } catch (error) {
              console.error('Error deleting comment:', error);
              toast.error('Có lỗi xảy ra khi xóa bình luận.');
          } finally {
              setCommentLoading(false);
          }
      }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center min-h-screen">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Thumbnails bên trái */}
        <div className="flex flex-col items-center gap-2 mr-4">
          {product.images?.map((img, idx) => (
            <img
              key={img.id}
              src={`http://localhost:8080/doan${img.imageUrl}`}
              alt={`Ảnh ${idx + 1}`}
              className={`w-16 h-16 object-cover rounded border cursor-pointer mb-2 ${mainImage === `http://localhost:8080/doan${img.imageUrl}` ? 'ring-2 ring-[#8B4513]' : ''}`}
              onClick={() => setMainImage(`http://localhost:8080/doan${img.imageUrl}`)}
            />
          ))}
        </div>
        {/* Ảnh lớn */}
        <div className="flex-1 flex justify-center items-center">
          <img src={mainImage || ''} alt={product.name} className="w-full max-w-md h-auto rounded-lg shadow-lg" />
        </div>
        {/* Thông tin sản phẩm */}
        <div className="flex-1 max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-[#222]">{product.name}</h1>
          <div className="text-2xl font-bold text-[#e53935] mb-4">{product.price?.toLocaleString('vi-VN')}đ</div>
          <div className="flex items-center justify-center mb-6">
            <button onClick={() => updateQuantity(quantity - 1)} className="px-4 py-2 border rounded-l bg-gray-100 hover:bg-gray-200 text-xl">-</button>
            <input
              type="number"
              min="1"
              max={product?.quantityInStock || 1}
              value={quantity}
              onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
              className="w-14 text-center border-y text-lg font-semibold"
            />
            <button onClick={() => updateQuantity(quantity + 1)} className="px-4 py-2 border rounded-r bg-gray-100 hover:bg-gray-200 text-xl">+</button>
          </div>
          <button onClick={handleAddToCart} className="w-full bg-lime-500 text-white text-lg font-bold py-3 rounded-lg hover:bg-lime-600 transition mb-3">THÊM VÀO GIỎ</button>
          <button onClick={toggleWishlist} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors mb-6 ${isWishlisted ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
            {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500" />}
            {isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
          </button>
          <div>
            <h2 className="font-bold text-lg mb-2">Mô tả</h2>
            <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
            <div className="mt-4 text-gray-600">
              <div>Chất liệu: <span className="font-medium">{product.material}</span></div>
              <div>Kích thước: <span className="font-medium">{product.dimensions}</span></div>
            </div>
          </div>
        </div>
      </div>
      {/* Product Comments Section */}
      <div className="mt-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">Bình luận</h2>

        {/* Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handlePostComment} className="mb-8">
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
              rows={4}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentLoading}
            ></textarea>
            <button
              type="submit"
              className="mt-2 bg-[#8B4513] hover:bg-[#6B3410] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
              disabled={commentLoading}
            >
              {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>
        ) : (
          <p className="mb-8 text-center text-gray-600">
            Vui lòng <Link to="/login" className="text-blue-600 hover:underline">đăng nhập</Link> để bình luận.
          </p>
        )}

        {/* Comments List */}
        {commentLoading && comments.length === 0 ? (
          <div className="text-center text-gray-500">Đang tải bình luận...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500">Chưa có bình luận nào.</div>
        ) : (
          <div className="space-y-6">
            {comments.filter(c => !c.parentId).map(comment => {
              const currentUser = authService.getCurrentUser();
              const isCurrentUserComment = currentUser && comment.user && String(currentUser.id) === String(comment.user.id);
              // Lấy các reply cho bình luận này
              const replies = comments.filter(r => r.parentId === comment.id);
              return (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold text-gray-800 mr-2">{comment.user?.fullname || 'Người dùng'}</div>
                    <div className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
                    {isCurrentUserComment && (
                      <div className="ml-auto flex gap-2">
                        <button 
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => handleEditComment(comment)}
                        >
                          Sửa
                        </button>
                        <button 
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-700">{comment.content}</div>
                  {/* Hiển thị các reply của admin */}
                  {replies.length > 0 && (
                    <div className="mt-2 space-y-2 pl-6 border-l-2 border-blue-200">
                      {replies.map(reply => (
                        <div key={reply.id} className="flex items-center text-blue-700">
                          <span className="font-semibold mr-2">Admin</span>
                          <span className="text-gray-700">{reply.content}</span>
                          <span className="ml-2 text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Sản phẩm liên quan */}
      <div className="mt-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#8B4513]">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {related.length === 0 ? (
            <div className="col-span-full text-gray-500">Không có sản phẩm liên quan.</div>
          ) : (
            related.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition flex flex-col items-center">
                <img src={`http://localhost:8080/doan${item.thumbnailUrl}`} alt={item.name} className="w-32 h-32 object-cover rounded mb-2" />
                <div className="font-semibold text-center mb-1 line-clamp-2">{item.name}</div>
                <div className="text-[#e53935] font-bold mb-1">{item.price?.toLocaleString('vi-VN')}đ</div>
                <Link to={`/products/${item.id}`} className="mt-2 bg-[#8B4513] text-white px-4 py-2 rounded hover:bg-[#6B3410] transition">Xem chi tiết</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 