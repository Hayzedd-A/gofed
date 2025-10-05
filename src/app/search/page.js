"use client";
import { useEffect, useState } from "react";
import ProductModal from "./components/ProductModal";

export default function SearchPage() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("gofed:results");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  return (
    <main className="container py-8">
      <h2 className="text-2xl font-bold text-[--theme] mb-4">Search Results</h2>
      {!items.length && <p className="text-gray-600">No results found. Try another search.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <button key={p._id} onClick={() => setActive(p)} className="text-left card p-3 hover:shadow-md">
            <img src={p.imageUrl} alt={p.productName} className="w-full h-40 object-cover rounded" />
            <div className="mt-2">
              <div className="font-semibold text-sm">{p.productName}</div>
              <div className="text-xs text-gray-600">{p.brandName}</div>
            </div>
          </button>
        ))}
      </div>

      {active && <ProductModal product={active} onClose={() => setActive(null)} />}
    </main>
  );
}
