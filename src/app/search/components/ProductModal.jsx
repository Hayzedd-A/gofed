"use client";

import { useAuth } from "../../components/AuthContext";

export default function ProductModal({ product, onClose }) {
  const { user, addToFavorites, openLoginModal } = useAuth();

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-[--theme]">{product.productName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <img src={product.imageUrl} alt={product.productName} className="w-full h-64 object-cover rounded mt-3" />
        <div className="mt-3 text-sm text-gray-700">
          <div><span className="font-medium">Brand:</span> {product.brandName}</div>
          <div><span className="font-medium">Colorway:</span> {product.colorwayName || '-'} </div>
          <div className="mt-2">{product.shortDescription}</div>
          <div className="mt-2"><span className="font-medium">Application:</span> {product.application}</div>
          {/* <div className="mt-2"><span className="font-medium">Keywords:</span> {(product.keywords || []).join(', ')}</div>
          <div className="mt-2"><span className="font-medium">Color Palette:</span> {(product.colorPalette || []).join(', ')}</div> */}
        </div>
        <div className="mt-4 flex gap-3 items-center">
          {product.specSheetLink && (
            <a href={product.specSheetLink} target="_blank" className="btn-theme">Spec Sheet</a>
          )}
          {product.productUrl && (
            <a href={product.productUrl} target="_blank" className="btn-theme">View on Website</a>
          )}
          <button
            onClick={() => {
              if (user) {
                addToFavorites(product._id);
              } else {
                openLoginModal();
              }
            }}
            className="text-red-500 hover:text-red-700 text-xl ml-auto"
            aria-label="Add to favorites"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}
