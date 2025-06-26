import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function NewsList() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/doan/news')
      .then(res => res.json())
      .then(data => setNews(data.result || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Tin tức</h1>
      {loading ? (
        <div className="text-center py-12">Đang tải tin tức...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Chưa có tin tức nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {news.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
              <img src={item.thumbnailUrl?.startsWith('http') ? item.thumbnailUrl : `http://localhost:8080/doan${item.thumbnailUrl}`} alt={item.title} className="h-48 w-full object-cover" />
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs text-gray-400 mb-2">{item.createdAt?.slice(0, 10)}</span>
                <h3 className="font-bold text-lg text-[#8B4513] mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{item.content?.slice(0, 100)}...</p>
                <Link to={`/news/${item.slug}`} className="text-[#8B4513] font-semibold hover:underline mt-auto">Xem chi tiết</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 