// lib/auth.js - Authentication utilities

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