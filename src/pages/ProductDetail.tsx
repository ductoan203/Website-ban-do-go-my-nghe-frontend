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
          const relRes = await axios.get<{ result: Product[] }>(`http://localhost:8080/doan/products?categoryId=${response.data.result.category.id}`);
          setRelated(relRes.data.result.filter(p => p.id !== response.data.result.id));
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
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      setCommentLoading(true);
      try {
        // Specify return type for axios.get - remove explicit AxiosResponse type on variable
        const response = await axios.get<ApiResponse<Comment[]>>(`http://localhost:8080/doan/products/${id}/comments`);
        setComments(response.data.result); // Now TypeScript knows response.data.result is Comment[]

        // Simulate fetching comments - REMOVE THIS BLOCK
        // console.log(`Fetching comments for product ${id}`);
        // setTimeout(() => {
        //   setComments([ // Sample comments
        //     { id: 1, user: { id: 101, fullname: 'Nguyễn Văn A' }, content: 'Sản phẩm rất đẹp!', createdAt: new Date().toISOString() },
        //     { id: 2, user: { id: 102, fullname: 'Trần Thị B' }, content: 'Chất liệu tốt, đóng gói cẩn thận.', createdAt: new Date().toISOString() },
        //   ]);
        //   setCommentLoading(false);
        // }, 500);

      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  const handleAddToCart = async () => {
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
      // Specify return type for axios.post - remove explicit AxiosResponse type on variable
      const response = await axios.post<ApiResponse<Comment>>(`http://localhost:8080/doan/products/${product.id}/comments`, { content: newComment });
      console.log('Comment posted:', response.data);
      
      // Assuming backend returns the newly created comment in response.data.result
      const postedComment = response.data.result; // Now TypeScript knows response.data.result is Comment
      // Adjust the structure of `postedComment` to match the `Comment` interface if needed
      // The backend Comment entity includes User object, ensure frontend interface matches.

      // We need to map the backend Comment entity structure to the frontend Comment interface
      // Assuming backend returns something like { id, content, createdAt, user: { id, fullname } }
      const formattedComment: Comment = {
          id: postedComment.id,
          user: { // Map backend user object to frontend user object structure
              id: postedComment.user.id,
              fullname: postedComment.user.fullname,
              // Map other user fields if they exist in backend response
          },
          content: postedComment.content,
          createdAt: postedComment.createdAt,
      };

      setComments(prevComments => [formattedComment, ...prevComments]); // Add to the beginning

      setNewComment(''); // Clear input
      toast.success('Bình luận của bạn đã được gửi!');

      // Simulate posting comment - REMOVE THIS BLOCK
      // console.log(`Posting comment for product ${product.id}: ${newComment}`);
      // const newPostedComment = { // Sample new comment structure
      //    id: comments.length + 1,
      //    user: { id: authService.getCurrentUser()?.id || 0, fullname: authService.getCurrentUser()?.name || 'Bạn' }, // Use actual user info if available
      //    content: newComment,
      //    createdAt: new Date().toISOString(),
      // };
      // setTimeout(() => {
      //    setComments([...comments, newPostedComment]); // Add new comment to list
      //    setNewComment(''); // Clear input
      //    toast.success('Bình luận của bạn đã được gửi!');
      //    setCommentLoading(false);
      // }, 500);

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
              // Call backend API to update the comment
              // Assuming the PUT endpoint is /products/{productId}/comments/{commentId}
              const response = await axios.put<ApiResponse<Comment>>(
                `http://localhost:8080/doan/products/${product?.id}/comments/${comment.id}`, 
                { content: newContent }
              );
              console.log('Comment updated:', response.data);
              
              // Update the comment in the state
              setComments(prevComments => 
                  prevComments.map(c => 
                      c.id === comment.id ? response.data.result : c
                  )
              );
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
            {comments.map(comment => {
                const currentUser = authService.getCurrentUser(); // Get current user
                // Add a check for comment.user before accessing its properties
                const isCurrentUserComment = currentUser && comment.user && currentUser.id === comment.user.id; // Check if comment belongs to current user, safely accessing comment.user
                
                return (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      {/* Safely access comment.user.fullname */}
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