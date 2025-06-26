import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NewsForm from './NewsForm';

interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function NewsAdmin() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editNews, setEditNews] = useState<News | null>(null);
  const navigate = useNavigate();

  const fetchNews = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/doan/admin/news', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => setNews(data.result || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá tin này?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8080/doan/admin/news/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      fetchNews();
    } else {
      alert('Xoá thất bại!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Quản lý tin tức</h1>
      <div className="mb-6 text-right">
        <button onClick={() => { setEditNews(null); setShowForm(true); }} className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition">Thêm tin tức mới</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
            <button onClick={() => setShowForm(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl">×</button>
            <NewsForm news={editNews!} onSuccess={() => { setShowForm(false); fetchNews(); }} />
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-12">Đang tải tin tức...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Chưa có tin tức nào.</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Tiêu đề</th>
              <th className="py-3 px-4 text-left">Ngày tạo</th>
              <th className="py-3 px-4 text-left">Ảnh</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-4 font-semibold">{item.title}</td>
                <td className="py-2 px-4 text-xs text-gray-500">{item.createdAt?.slice(0, 10)}</td>
                <td className="py-2 px-4"><img src={item.thumbnailUrl?.startsWith('http') ? item.thumbnailUrl : `http://localhost:8080/doan${item.thumbnailUrl}`} alt={item.title} className="h-12 w-20 object-cover rounded" /></td>
                <td className="py-2 px-4">
                  <button onClick={() => { setEditNews(item); setShowForm(true); }} className="text-blue-600 hover:underline mr-4">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 