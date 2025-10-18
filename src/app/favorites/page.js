"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import ProductModal from "../search/components/ProductModal";
import { useRouter } from "next/navigation";
import Link from "next/link";

async function searchByCriteria(criteriaId) {
  const res = await fetch(`/api/products/search-by-criteria?criteriaId=${criteriaId}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to search by criteria');
  }
  return data;
}

export default function FavoritesPage() {
  const { user, getFavorites, removeFromFavorites } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const router = useRouter()

  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        setLoading(true);
        const result = await getFavorites();
        if (result.success) {
          setFavorites(result.favorites);
          // Expand all folders by default
          setExpandedFolders(
            new Set(result.favorites.map((_, index) => index))
          );
        }
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  const toggleFolder = (folderIndex) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderIndex)) {
        newSet.delete(folderIndex);
      } else {
        newSet.add(folderIndex);
      }
      return newSet;
    });
  };

  const handleRemoveFavorite = async (productId, folderId) => {
    const result = await removeFromFavorites(productId, folderId);
    if (result.success) {
      // Reload favorites after removal
      const reloadResult = await getFavorites();
      if (reloadResult.success) {
        setFavorites(reloadResult.favorites);
      }
    }
  };

  const handleGetMoreProducts = async (criteriaId) => {
    try {
      const result = await searchByCriteria(criteriaId);
      if (result.success) {
        // Store results in session storage and navigate to results page
        sessionStorage.setItem("gofed:results", JSON.stringify(result.products));
        sessionStorage.setItem("gofed:searchCriteria", JSON.stringify(result.criteria));
        router.push("/search/results");
      }
    } catch (error) {
      console.error("Error searching by criteria:", error);
      alert("Failed to get more products. Please try again.");
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#2b3a55] mb-4">
              Favorites
            </h2>
            <p className="text-gray-600">
              Please login to view your favorites.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading favorites...</p>
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
              <h2 className="text-3xl font-bold text-[#2b3a55]">
                My Favorites
              </h2>
              <p className="text-gray-600 mt-1">
                {favorites.length > 0
                  ? `${favorites.length} project${
                      favorites.length !== 1 ? "s" : ""
                    } • ${favorites.reduce(
                      (sum, folder) => sum + folder.products.length,
                      0
                    )} saved product${
                      favorites.reduce(
                        (sum, folder) => sum + folder.products.length,
                        0
                      ) !== 1
                        ? "s"
                        : ""
                    }`
                  : "No favorites yet"}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-[#2b3a55] text-[#2b3a55] rounded-md hover:bg-[#2b3a55] hover:text-white transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Empty State */}
        {!favorites.length && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start searching for products and add them to your favorites!
            </p>
            <Link href="/search" className="btn-theme">
              Start Searching
            </Link>
          </div>
        )}

        {/* Favorites Folders */}
        {favorites.length > 0 && (
          <div className="space-y-6">
            {favorites.map((folder, folderIndex) => (
              <div
                key={folder._id || folderIndex}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Folder Header */}
                <div
                  className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleFolder(folderIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`transform transition-transform ${
                          expandedFolders.has(folderIndex) ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2b3a55]">
                          {folder.projectName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {folder.products.length} product
                          {folder.products.length !== 1 ? "s" : ""} • Created{" "}
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          console.log("folder: ", folder)
                          e.stopPropagation();
                          handleGetMoreProducts(folder.searchCriteria._id);
                        }}
                        className="px-3 py-1 bg-[#2b3a55] text-white text-sm rounded hover:bg-[#3a4a65] transition-colors"
                      >
                        Get More
                      </button>
                      <div className="text-sm text-gray-500">
                        {folder.searchCriteria?.sectors?.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {folder.searchCriteria.sectors.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Folder Content */}
                {expandedFolders.has(folderIndex) && (
                  <div className="p-4">
                    {folder.products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No products in this folder
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {folder.products.map((p) => (
                          <div
                            key={p._id}
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

                              {/* Remove Favorite Button */}
                              <button
                                onClick={() =>
                                  handleRemoveFavorite(p._id, folder._id)
                                }
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                                aria-label="Remove from favorites"
                              >
                                ✕
                              </button>

                              {/* Quick View Badge */}
                              <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-full text-xs font-medium text-[#2b3a55] transition-opacity duration-300 shadow-lg">
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

                              {/* View Details Button */}
                              <button
                                onClick={() => setActive(p)}
                                className="w-full mt-2 px-3 py-1 bg-[#2b3a55] text-white text-sm rounded hover:bg-[#3a4a65] transition-colors"
                              >
                                View Details
                              </button>
                            </div>

                            {/* Hover Border Effect */}
                            <div className="absolute inset-0 border-2 border-[#2b3a55] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <ProductModal product={active} onClose={() => setActive(null)} />
      )}
    </main>
  );
}
