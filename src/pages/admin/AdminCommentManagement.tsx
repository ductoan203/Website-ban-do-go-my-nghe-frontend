import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Comment {
  id: number;
  user: {
    id: number;
    fullname: string;
  };
  product: { // Include product info to show which product the comment is on
      id: number;
      name: string;
  };
  content: string;
  createdAt: string;
}

interface ApiResponse<T> {
    result: T;
    message: string;
    status: number;
}

const AdminCommentManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // Call the backend API to get all comments for admin
        const response = await axios.get<ApiResponse<Comment[]>>('http://localhost:8080/doan/admin/comments');
        setComments(response.data.result);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải bình luận.');
        toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi tải bình luận.');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  // TODO: Implement delete and potentially edit functionality for Admin
  // For now, just display the list.

  if (loading) {
    return <div className="flex justify-center items-center mt-8">Đang tải bình luận...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-[#3E2F1C]">Quản lý Bình luận</h2>
      
      {comments.length === 0 ? (
          <div className="text-center text-gray-500">Không có bình luận nào trong hệ thống.</div>
      ) : (
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                  <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                      <tr>
                          <th className="py-3 px-6 text-left">ID</th>
                          <th className="py-3 px-6 text-left">Sản phẩm</th>
                          <th className="py-3 px-6 text-left">Người dùng</th>
                          <th className="py-3 px-6 text-left">Nội dung</th>
                          <th className="py-3 px-6 text-left">Thời gian</th>
                          {/* TODO: Add Actions column for Delete/Edit if needed */}
                          <th className="py-3 px-6 text-center">Hành động</th>
                      </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                      {comments.map(comment => (
                          <tr key={comment.id} className="border-b border-gray-200 hover:bg-gray-100">
                              <td className="py-3 px-6 text-left whitespace-nowrap">{comment.id}</td>
                              <td className="py-3 px-6 text-left">{comment.product?.name || 'N/A'}</td>
                              <td className="py-3 px-6 text-left">{comment.user?.fullname || 'N/A'}</td>
                              <td className="py-3 px-6 text-left max-w-xs overflow-hidden text-ellipsis">{comment.content}</td>
                              <td className="py-3 px-6 text-left">{new Date(comment.createdAt).toLocaleString()}</td>
                              {/* TODO: Add Delete/Edit buttons */}
                               <td className="py-3 px-6 text-center">
                                 {/* Admin can delete any comment */}
                                 <button 
                                     className="text-red-600 hover:underline text-sm mr-2"
                                     // onClick={() => handleDeleteComment(comment.id)} // TODO: Implement admin delete
                                 >
                                     Xóa
                                 </button>
                                 {/* Admin might also want to edit, but less common */}
                               </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};

export default AdminCommentManagement; 