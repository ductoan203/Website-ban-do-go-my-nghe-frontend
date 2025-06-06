import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import * as searchService from '../services/search.service';

interface Product {
  id: number;
  name: string;
  imageUrl?: string; // Assuming product has an image URL
  // Add other product fields as needed
}

interface Category {
  id: number;
  name: string;
  // Add other category fields as needed
}

const SearchResults = () => {
  const location = useLocation();
  const [results, setResults] = useState<{ products: Product[]; categories: Category[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchTerm = new URLSearchParams(location.search).get('term');

  useEffect(() => {
    if (searchTerm) {
      const fetchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await searchService.search(searchTerm);
          // Assuming the API returns { result: { products: [], categories: [] } }
          setResults(response.result);
          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching search results:', err);
          setError(err.response?.data?.message || 'Không thể tải kết quả tìm kiếm.');
          setLoading(false);
        }
      };

      fetchResults();
    } else {
      setResults(null);
      setLoading(false);
    }
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Kết quả tìm kiếm cho: "{searchTerm}"</h1>

      {loading && <p>Đang tìm kiếm...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && searchTerm && (results ? (
        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3">Sản phẩm ({results.products.length})</h2>
          {results.products.length === 0 ? (
            <p>Không tìm thấy sản phẩm nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.products.map(product => (
                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <Link to={`/products/${product.id}`}>
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                      {/* Add other product details if needed */}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mt-6 mb-3">Danh mục ({results.categories.length})</h2>
          {results.categories.length === 0 ? (
            <p>Không tìm thấy danh mục nào.</p>
          ) : (
            <ul className="list-disc list-inside ml-4">
              {results.categories.map(category => (
                <li key={category.id} className="text-gray-700">
                  <Link to={`/products?category=${category.id}`} className="text-blue-600 hover:underline">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
         <p>Nhập từ khóa để tìm kiếm.</p>
      ))}
       {!searchTerm && <p>Vui lòng nhập từ khóa để tìm kiếm.</p>}
    </div>
  );
};

export default SearchResults; 