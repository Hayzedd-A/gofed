"use client";

export default function Results({ items = [], onSelect }) {
  if (!items.length) {
    return <p className="text-gray-600">No results found. Try another search.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <button key={p._id} onClick={() => onSelect?.(p)} className="text-left card p-3 hover:shadow-md">
          <img src={p.imageUrl} alt={p.productName} className="w-full h-40 object-cover rounded" />
          <div className="mt-2">
            <div className="font-semibold text-sm">{p.productName}</div>
            <div className="text-xs text-gray-600">{p.brandName}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
