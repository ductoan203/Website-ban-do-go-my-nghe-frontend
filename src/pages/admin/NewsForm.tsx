import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface NewsFormProps {
  news?: any;
  onSuccess?: () => void;
}

export default function NewsForm({ news, onSuccess }: NewsFormProps) {
  const [title, setTitle] = useState(news?.title || '');
  const [content, setContent] = useState(news?.content || '');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState(news?.thumbnailUrl || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('slug', slugify(title));
      if (thumbnail) formData.append('thumbnail', thumbnail);
      let res;
      if (news) {
        const headers = getAuthHeaders();
        res = await fetch(`http://localhost:8080/doan/admin/news/${news.id}`, {
          method: 'PUT',
          body: formData,
          ...(headers ? { headers } : {}),
        });
      } else {
        const headers = getAuthHeaders();
        res = await fetch('http://localhost:8080/doan/admin/news', {
          method: 'POST',
          body: formData,
          ...(headers ? { headers } : {}),
        });
      }
      if (res.ok) {
        toast.success(news ? 'Cập nhật thành công!' : 'Thêm tin tức thành công!');
        onSuccess ? onSuccess() : navigate('/admin/news');
      } else {
        toast.error('Có lỗi xảy ra!');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <div className="mb-4">
        <label className="block font-semibold mb-1">Tiêu đề</label>
        <input type="text" className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Nội dung</label>
        <textarea className="w-full border rounded px-3 py-2 min-h-[120px]" value={content} onChange={e => setContent(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Ảnh đại diện</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="mb-2" />
        {preview && <img src={preview} alt="preview" className="h-32 rounded shadow" />}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? 'Đang lưu...' : news ? 'Cập nhật' : 'Thêm tin tức'}
      </button>
    </form>
  );
} 