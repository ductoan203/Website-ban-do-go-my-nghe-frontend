import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import React from 'react';

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
  parentId?: number | null;
  replies?: Comment[];
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
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  // Lấy các bình luận gốc (không có parentId)
  const rootComments = comments.filter(c => !c.parentId);
  // Lấy các reply cho 1 comment
  const getReplies = (parentId: number) => comments.filter(c => c.parentId === parentId);

  const handleReply = async (parentComment: Comment) => {
    console.log('Gửi trả lời cho comment:', parentComment);
    if (!replyContent.trim()) {
      toast.warn('Nội dung trả lời không được để trống.');
      return;
    }
    if (!parentComment.product?.id || !parentComment.id) {
      toast.error('Thiếu productId hoặc parentCommentId!');
      return;
    }
    setReplyLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/doan/admin/comments/reply?productId=${parentComment.product.id}&parentCommentId=${parentComment.id}`,
        { content: replyContent }
      );
      console.log('Kết quả trả lời:', res);
      toast.success('Đã trả lời bình luận!');
      setReplyContent('');
      setReplyingId(null);
      // Reload comments
      const response = await axios.get<ApiResponse<Comment[]>>('http://localhost:8080/doan/admin/comments');
      setComments(response.data.result);
    } catch (err: any) {
      console.error('Lỗi khi gửi trả lời:', err, err?.response?.data);
      toast.error('Có lỗi khi gửi trả lời: ' + (err?.response?.data?.message || ''));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditReply = async (reply: Comment) => {
    if (!editingReplyContent.trim()) {
      toast.warn('Nội dung không được để trống.');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(`http://localhost:8080/doan/admin/comments/edit?commentId=${reply.id}`, { content: editingReplyContent });
      toast.success('Đã cập nhật trả lời!');
      setEditingReplyId(null);
      // Reload comments
      const response = await axios.get<ApiResponse<Comment[]>>('http://localhost:8080/doan/admin/comments');
      setComments(response.data.result);
    } catch (err: any) {
      toast.error('Có lỗi khi cập nhật: ' + (err?.response?.data?.message || ''));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteReply = async (reply: Comment) => {
    if (!window.confirm('Bạn có chắc muốn xóa trả lời này?')) return;
    setEditLoading(true);
    try {
      await axios.delete(`http://localhost:8080/doan/admin/comments/delete?commentId=${reply.id}`);
      toast.success('Đã xóa trả lời!');
      // Reload comments
      const response = await axios.get<ApiResponse<Comment[]>>('http://localhost:8080/doan/admin/comments');
      setComments(response.data.result);
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || '';
      if (
        backendMsg.includes('Cannot delete or update a parent row') ||
        backendMsg.includes('constraint fails')
      ) {
        toast.error('Không thể xóa bình luận này vì có bình luận trả lời.');
      } else {
        toast.error('Có lỗi khi xóa: ' + backendMsg);
      }
    } finally {
      setEditLoading(false);
    }
  };

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
                      {rootComments.map(comment => {
                        const replies = getReplies(comment.id);
                        const isReplied = replies.length > 0;
                        return (
                          <React.Fragment key={comment.id}>
                            <tr className={`border-b border-gray-200 hover:bg-gray-100 ${isReplied ? 'bg-green-50' : ''}`}>
                              <td className="py-3 px-6 text-left whitespace-nowrap">{comment.id}</td>
                              <td className="py-3 px-6 text-left">{comment.product?.name || 'N/A'}</td>
                              <td className="py-3 px-6 text-left">{comment.user?.fullname || 'N/A'}</td>
                              <td className="py-3 px-6 text-left max-w-xs overflow-hidden text-ellipsis">
                                {comment.content}
                                {isReplied && <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold">Đã phản hồi</span>}
                              </td>
                              <td className="py-3 px-6 text-left">{new Date(comment.createdAt).toLocaleString()}</td>
                              <td className="py-3 px-6 text-center">
                                {comment.product?.id ? (
                                  <button className="text-blue-600 hover:underline text-sm mr-2" onClick={() => setReplyingId(comment.id)}>
                                    Trả lời
                                  </button>
                                ) : null}
                                <button className="text-red-600 hover:underline text-sm" onClick={() => handleDeleteReply(comment)}>
                                  Xóa
                                </button>
                              </td>
                            </tr>
                            {/* Form trả lời */}
                            {replyingId === comment.id && (
                              <tr>
                                <td colSpan={6} className="bg-gray-50 p-4">
                                  <textarea
                                    className="w-full border rounded p-2 mb-2"
                                    rows={2}
                                    placeholder="Nhập nội dung trả lời..."
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    disabled={replyLoading}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      className="bg-blue-600 text-white px-4 py-1 rounded"
                                      onClick={() => handleReply(comment)}
                                      disabled={replyLoading}
                                    >
                                      {replyLoading ? 'Đang gửi...' : 'Gửi trả lời'}
                                    </button>
                                    <button className="px-4 py-1 rounded border" onClick={() => setReplyingId(null)} disabled={replyLoading}>
                                      Hủy
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {/* Hiển thị các reply */}
                            {replies.map(reply => (
                              <tr key={reply.id} className="bg-blue-50">
                                <td className="py-2 px-6 text-left"></td>
                                <td className="py-2 px-6 text-left" colSpan={2}><span className="font-semibold text-blue-700">Admin</span></td>
                                <td className="py-2 px-6 text-left" colSpan={2}>
                                  {editingReplyId === reply.id ? (
                                    <>
                                      <textarea
                                        className="w-full border rounded p-2 mb-2"
                                        rows={2}
                                        value={editingReplyContent}
                                        onChange={e => setEditingReplyContent(e.target.value)}
                                        disabled={editLoading}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          className="bg-blue-600 text-white px-3 py-1 rounded"
                                          onClick={() => handleEditReply(reply)}
                                          disabled={editLoading}
                                        >Lưu</button>
                                        <button
                                          className="px-3 py-1 rounded border"
                                          onClick={() => setEditingReplyId(null)}
                                          disabled={editLoading}
                                        >Hủy</button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {reply.content}
                                      <div className="flex gap-2 mt-1">
                                        <button
                                          className="text-blue-600 hover:underline text-xs"
                                          onClick={() => { setEditingReplyId(reply.id); setEditingReplyContent(reply.content); }}
                                        >Sửa</button>
                                        <button
                                          className="text-red-600 hover:underline text-xs"
                                          onClick={() => handleDeleteReply(reply)}
                                        >Xóa</button>
                                      </div>
                                    </>
                                  )}
                                </td>
                                <td className="py-2 px-6 text-left">{new Date(reply.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};

export default AdminCommentManagement; 