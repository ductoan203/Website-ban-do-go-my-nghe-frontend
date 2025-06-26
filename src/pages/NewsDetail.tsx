import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`http://localhost:8080/doan/news/${slug}`)
        .then(res => res.json())
        .then(data => setNews(data.result || null))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">Đang tải...</div>;
  if (!news) return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Không tìm thấy tin tức.</div>;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen max-w-3xl">
      <Link to="/news" className="text-[#8B4513] hover:underline mb-6 inline-block">← Quay lại danh sách</Link>
      <h1 className="text-3xl font-bold mb-4 text-[#8B4513]">{news.title}</h1>
      <div className="text-xs text-gray-400 mb-4">{news.createdAt?.slice(0, 10)}</div>
      <img src={news.thumbnailUrl} alt={news.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: news.content }} />
    </div>
  );
} 