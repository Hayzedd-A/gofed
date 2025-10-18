"use client";

import { useAuth } from "../../components/AuthContext";
import { useState, useEffect } from "react";

export default function ProductModal({ product, onClose }) {
  const { user, addToFavorites, openLoginModal, isFavorite } = useAuth();
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (product) {
      // Fetch variants for this product (same brandName, different colorways)
      fetchVariants();
    }
  }, [product]);

  const fetchVariants = async () => {
    try {
      const response = await fetch(
        `/api/products/variants?brandName=${encodeURIComponent(
          product.brandName
        )}&productName=${encodeURIComponent(product.productName)}`
      );
      const data = await response.json();
      if (data.success) {
        setVariants(data.variants.filter((v) => v._id !== product._id)); // Exclude current product
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-[#2b3a55]">
            {product.productName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-full h-64 object-cover rounded"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <div>
                <span className="font-medium">Brand:</span> {product.brandName}
              </div>
              <div>
                <span className="font-medium">Colorway:</span>{" "}
                {product.colorwayName || "-"}{" "}
              </div>
              <div className="mt-2">{product.shortDescription}</div>
              <div className="mt-2">
                <span className="font-medium">Application:</span>{" "}
                {product.application}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {product.specSheetLink && (
                <a
                  href={product.specSheetLink}
                  target="_blank"
                  className="btn-theme text-sm"
                >
                  Spec Sheet
                </a>
              )}
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  className="btn-theme text-sm"
                >
                  View on Website
                </a>
              )}
              <button
                onClick={() => {
                  if (user) {
                    // Get search criteria from session storage
                    const searchCriteria = JSON.parse(
                      sessionStorage.getItem("gofed:searchCriteria") || "{}"
                    );
                    addToFavorites(product._id, searchCriteria);
                  } else {
                    openLoginModal();
                  }
                }}
                className="text-red-500 hover:text-red-700 text-xl ml-auto"
                aria-label="Add to favorites"
              >
                
                    {isFavorite(product._id) ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        {variants.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-[#2b3a55] mb-3">
              Other Colorways
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <div
                  key={variant._id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-[#2b3a55] transition-colors cursor-pointer"
                  onClick={() => {
                    variant.productUrl &&
                      window.open(variant.productUrl, "_blank");
                  }}
                >
                  <img
                    src={variant.imageUrl}
                    alt={variant.colorwayName}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <div className="text-xs text-gray-600 text-center">
                    {variant.colorwayName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
