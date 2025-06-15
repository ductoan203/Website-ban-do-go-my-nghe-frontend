import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isReplied: boolean;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get<ContactMessage[]>(`${API_URL}/contact`);
      console.log('API Response for /contact:', response.data);
      setMessages(response.data);
      // Sau khi fetch lại tin nhắn, cập nhật selectedMessage nếu nó vẫn tồn tại trong danh sách mới
      if (selectedMessage) {
        const updatedSelected = response.data.find(msg => msg.id === selectedMessage.id);
        if (updatedSelected) {
          setSelectedMessage(updatedSelected);
        } else {
          // Nếu selectedMessage không còn trong danh sách (có thể đã bị xóa), clear nó
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách tin nhắn');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.put(`${API_URL}/contact/${id}/read`);
      const updatedMessages = messages.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      );
      setMessages(updatedMessages);
      // Cập nhật selectedMessage nếu tin nhắn hiện tại được đánh dấu là đã đọc
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(updatedMessages.find(msg => msg.id === id) || null);
      }
      toast.success('Đã đánh dấu tin nhắn đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu tin nhắn đã đọc');
      console.error('Error marking message as read:', error);
    }
  };

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyContent(''); // Clear previous reply content
    setIsReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setIsSendingReply(true);
    try {
      const replyData = {
        recipientEmail: selectedMessage.email,
        recipientName: selectedMessage.name,
        replyContent: replyContent.trim(),
        messageId: selectedMessage.id,
      };
      await axios.post(`${API_URL}/contact/reply`, replyData);
      toast.success('Đã gửi phản hồi thành công!');

      // Cập nhật trạng thái tin nhắn cục bộ sau khi phản hồi thành công
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, isRead: true, isReplied: true } 
          : msg
      );
      setMessages(updatedMessages);
      setSelectedMessage(updatedMessages.find(msg => msg.id === selectedMessage.id) || null);

      setIsReplyModalOpen(false);
      setReplyContent('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại.');
      console.error('Error sending reply:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) {
      try {
        await axios.delete(`${API_URL}/contact/${id}`);
        toast.success("Đã xóa tin nhắn thành công!");
        fetchMessages(); // Tải lại danh sách tin nhắn sau khi xóa
        setSelectedMessage(null); // Clear selected message if deleted
      } catch (error) {
        toast.error("Không thể xóa tin nhắn.");
        console.error("Error deleting message:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tin nhắn liên hệ</h1>
        <div className="text-sm text-gray-600">
          Tổng số tin nhắn: {messages.length}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách tin nhắn */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Danh sách tin nhắn</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không có tin nhắn nào
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-amber-50' : ''
                  } ${message.isRead ? '' : 'bg-blue-50'}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{message.name}</h3>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      message.isRead
                        ? 'text-green-600 bg-green-100'
                        : 'text-blue-600 bg-blue-100'
                    }`}
                  >
                    {message.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  </span>
                  {message.isReplied && (
                    <span className="inline-block mt-2 ml-2 px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                      Đã phản hồi
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chi tiết tin nhắn */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.name}</h2>
                  <p className="text-gray-600">{selectedMessage.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {format(new Date(selectedMessage.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                  <span
                    className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedMessage.isRead
                        ? 'text-green-600 bg-green-100'
                        : 'text-blue-600 bg-blue-100'
                    }`}
                  >
                    {selectedMessage.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  </span>
                  {selectedMessage.isReplied && (
                    <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                      Đã phản hồi
                    </span>
                  )}
                </div>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleReply(selectedMessage)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Trả lời
                </button>
                {!selectedMessage.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                {selectedMessage.isReplied && (
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md">
                      Đã phản hồi
                    </span>
                )}
                 <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Xóa
                  </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Chọn một tin nhắn để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Trả lời tin nhắn</h2>
            <div className="mb-4">
              <p className="text-gray-700">Đến: <span className="font-semibold">{selectedMessage.name} &lt;{selectedMessage.email}&gt;</span></p>
            </div>
            <div className="mb-4">
              <label htmlFor="replyContent" className="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi</label>
              <textarea
                id="replyContent"
                name="replyContent"
                rows={6}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                placeholder="Nhập nội dung phản hồi..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSendReply}
                disabled={isSendingReply}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages; 