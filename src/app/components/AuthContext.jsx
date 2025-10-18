"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { userAuthUtils } from "../../../lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [favouritesLoading, setFavouritesLoading] = useState(false);
  const [criteriaId, setCriteriaId] = useState(null);

  useEffect(() => {
    async function verify() {
      const result = await userAuthUtils.verifyToken();
      if (result.authenticated) {
        setUser(result.user);
        // Load favorites when user is authenticated
        await loadFavorites();
      } else {
        setUser(null);
        setFavourites([]);
      }
      setLoading(false);
    }
    verify();
  }, []);

  const loadFavorites = async () => {
    setFavouritesLoading(true);
    try {
      const result = await userAuthUtils.getFavorites();
      if (result.success && result.favorites) {
        setFavourites(result.favorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setFavouritesLoading(false);
    }
  };

  const login = async (email, password) => {
    const result = await userAuthUtils.login(email, password);
    if (result.success) {
      setUser(result.user);
      // Load favorites after successful login
      await loadFavorites();
    }
    return result;
  };

  const register = async (email, password) => {
    const result = await userAuthUtils.register(email, password);
    return result;
  };

  const logout = async () => {
    const result = await userAuthUtils.logout();
    setUser(null);
    setFavourites([]);
    return result;
  };

  const addToFavorites = async (productId) => {
    if (!user) return { success: false, error: "Not authenticated" };
    if (!criteriaId) return { success: false, error: "No search criteria available" };

    setFavouritesLoading(true);
    try {
      const result = await userAuthUtils.addToFavorites(
        productId,
        criteriaId
      );
      if (result.success) {
        // Reload favorites to get the complete updated data
        await loadFavorites();
      }
      return result;
    } finally {
      setFavouritesLoading(false);
    }
  };

  const removeFromFavorites = async (productId, folderId) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const result = await userAuthUtils.removeFromFavorites(productId, folderId);
    if (result.success) {
      // Reload favorites to get the complete updated data
      await loadFavorites();
    }
    return result;
  };

  const isFavorite = (productId) => {
    return favourites.some((folder) =>
      folder.products.some((product) => product._id === productId)
    );
  };

  const getFavorites = async () => {
    if (!user) return { success: false, error: "Not authenticated" };
    return await userAuthUtils.getFavorites();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">
                Loading... <br /> please wait
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        addToFavorites,
        removeFromFavorites,
        getFavorites,
        favourites,
        favouritesLoading,
        isFavorite,
        loadFavorites,
        criteriaId,
        setCriteriaId,
        loginModalOpen,
        setLoginModalOpen,
        signupModalOpen,
        setSignupModalOpen,
        openLoginModal: () => setLoginModalOpen(true),
        closeLoginModal: () => setLoginModalOpen(false),
        openSignupModal: () => setSignupModalOpen(true),
        closeSignupModal: () => setSignupModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
