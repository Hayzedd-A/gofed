"use client";
import { useEffect, useState } from "react";
import ProductModal from "./components/ProductModal";

export default function SearchPage() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("gofed:results");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#2b3a55]">Search Results</h2>
              <p className="text-gray-600 mt-1">
                {items.length > 0 
                  ? `Found ${items.length} matching product${items.length !== 1 ? 's' : ''}`
                  : 'No results found'
                }
              </p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-[#2b3a55] text-[#2b3a55] rounded-md hover:bg-[#2b3a55] hover:text-white transition-all"
            >
              ← New Search
            </button>
          </div>
          
          {/* {items.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ✨ AI Matched
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                🎯 {items.length} Results
              </span>
            </div>
          )} */}
        </div>

        {/* Empty State */}
        {!items.length && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching your criteria.
              <br />
              Try adjusting your search parameters or upload a different image.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="btn-theme"
            >
              Try Another Search
            </button>
          </div>
        )}

        {/* Products Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <button 
                key={p._id} 
                onClick={() => setActive(p)} 
                className="group text-left card p-0 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-100">
                  <img 
                    src={p.imageUrl} 
                    alt={p.productName} 
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick View Badge */}
                  <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-full text-xs font-medium text-[#2b3a55]  transition-opacity duration-300 shadow-lg">
                    {p.colorwayName}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  <div className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#2b3a55] transition-colors">
                    {p.productName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {p.brandName}
                    </span>
                  </div>
                  
                  {/* Optional: Show price if available */}
                  {p.price && (
                    <div className="text-sm font-semibold text-[#2b3a55]">
                      ${p.price}
                    </div>
                  )}
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-[#2b3a55] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {/* {items.length > 12 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white border-2 border-[#2b3a55] text-[#2b3a55] rounded-md hover:bg-[#2b3a55] hover:text-white transition-all font-medium">
              Load More Results
            </button>
          </div>
        )} */}
      </div>

      {active && <ProductModal product={active} onClose={() => setActive(null)} />}
    </main>
  );
}