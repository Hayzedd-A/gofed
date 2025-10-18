// lib/auth.js - Authentication utilities

import { useRouter } from "next/navigation";

const TOKEN_KEY = 'gofed:admin_token';

export const authUtils = {
  // Store token in localStorage
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Remove token from localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Login function
  async login(password) {
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      this.setToken(data.token);
      return { success: true, token: data.token };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout function
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch('/api/auth/admin', {
          method: 'DELETE',
          headers: {
            'x-admin-token': token,
          },
        });
      }

      this.removeToken();
      return { success: true };
    } catch (error) {
      // Still remove token even if API call fails
      this.removeToken();
      return { success: true };
    }
  },

  // Verify token validity
  async verifyToken() {
    try {
      const token = this.getToken();

      if (!token) {
        return { success: false, authenticated: false };
      }

      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'x-admin-token': token,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        this.removeToken();
        return { success: false, authenticated: false };
      }

      return { success: true, authenticated: true };
    } catch (error) {
      this.removeToken();
      return { success: false, authenticated: false, error: error.message };
    }
  },

  // Get headers with auth token
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'x-admin-token': token } : {};
  },
};

// User authentication utilities
const USER_TOKEN_KEY = 'gofed:user_token';

export const userAuthUtils = {
  // Store user token in localStorage
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_TOKEN_KEY, token);
    }
  },

  // Get user token from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_TOKEN_KEY);
    }
    return null;
  },

  // Remove user token from localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_TOKEN_KEY);
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // User login function
  async login(email, password) {
    try {
      const res = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      this.setToken(data.token);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User register function
  async register(email, password) {
    try {
      const res = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User logout function
  async logout() {
    try {
      await fetch('/api/auth/user/logout', {
        method: 'POST',
      });

      this.removeToken();
      return { success: true };
    } catch (error) {
      // Still remove token even if API call fails
      this.removeToken();
      return { success: true };
    }
  },

  // Verify user token validity
  async verifyToken() {
    try {
      const token = this.getToken();

      if (!token) {
        return { success: false, authenticated: false };
      }

      const res = await fetch('/api/auth/user/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        this.removeToken();
        return { success: false, authenticated: false };
      }

      return { success: true, authenticated: true, user: data.user };
    } catch (error) {
      this.removeToken();
      return { success: false, authenticated: false, error: error.message };
    }
  },

  // Get headers with user auth token
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Add to favorites
  async addToFavorites(productId, criteriaId) {
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ productId, criteriaId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add to favorites');
      }

      return { success: true, favorites: data.favorites };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove from favorites
  async removeFromFavorites(productId, folderId) {
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ productId, folderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove from favorites');
      }

      return { success: true, favorites: data.favorites };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get favorites
  async getFavorites() {
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get favorites');
      }

      return { success: true, favorites: data.favorites };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

    async productSearch(payload) {
    try {
      const res = await fetch('/api/products/search', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: payload
      });

      const data = await res.json();
      console.log("response from search", data)

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get favorites');
      }

      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// HOC to protect routes
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
      async function checkAuth() {
        const result = await authUtils.verifyToken();
        
        if (!result.authenticated) {
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
        }
        
        setIsLoading(false);
      }

      checkAuth();
    }, []);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}