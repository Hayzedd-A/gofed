"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const { openLoginModal, closeLoginModal, openSignupModal, closeSignupModal } =
    useAuth();

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  const onLoginClick = () => {
    openLoginModal();
    return;
  };

  const onSignupClick = () => {
    openSignupModal();
    return;
  };

  return (
    <nav className="bg-[#2b3a55] text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          MOODbrary
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/favorites"
                className="px-4 py-2 bg-white text-[#2b3a55] rounded-md hover:bg-gray-100 transition-colors"
              >
                ❤️ Favorites
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-white text-[#2b3a55] rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="px-4 py-2 bg-[#4a5d7a] text-white rounded-md hover:bg-[#5a6d8a] transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
