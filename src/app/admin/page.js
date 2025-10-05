"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authUtils } from "../../../lib/auth";
import { LogoutDropdown } from "../components/LogoutButton";

function Form({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    productName: "",
    brandName: "",
    imageUrl: "",
    shortDescription: "",
    application: "",
    keywords: "",
    colorPalette: "",
    productUrl: "",
    colorwayName: "",
    ...initial,
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    payload.keywords = String(payload.keywords || "").split(",").map((s) => s.trim()).filter(Boolean);
    payload.colorPalette = String(payload.colorPalette || "").split(",").map((s) => s.trim()).filter(Boolean);
    await onSave(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Product Name *</label>
          <input 
            name="productName" 
            value={form.productName} 
            onChange={onChange} 
            placeholder="Enter product name" 
            className="input mt-1" 
            required 
          />
        </div>
        <div>
          <label className="label">Brand Name</label>
          <input 
            name="brandName" 
            value={form.brandName} 
            onChange={onChange} 
            placeholder="Enter brand name" 
            className="input mt-1" 
          />
        </div>
        <div>
          <label className="label">Image URL</label>
          <input 
            name="imageUrl" 
            value={form.imageUrl} 
            onChange={onChange} 
            placeholder="https://example.com/image.jpg" 
            className="input mt-1" 
          />
        </div>
        <div>
          <label className="label">Product URL</label>
          <input 
            name="productUrl" 
            value={form.productUrl} 
            onChange={onChange} 
            placeholder="https://example.com/product" 
            className="input mt-1" 
          />
        </div>
        <div>
          <label className="label">Application</label>
          <input 
            name="application" 
            value={form.application} 
            onChange={onChange} 
            placeholder="e.g., Floor, Wall, Ceiling" 
            className="input mt-1" 
          />
        </div>
        <div>
          <label className="label">Colorway Name</label>
          <input 
            name="colorwayName" 
            value={form.colorwayName || ''} 
            onChange={onChange} 
            placeholder="e.g., Ivory, Charcoal" 
            className="input mt-1" 
          />
        </div>
      </div>

      <div>
        <label className="label">Short Description</label>
        <textarea 
          name="shortDescription" 
          value={form.shortDescription} 
          onChange={onChange} 
          placeholder="Enter a brief description of the product" 
          className="input mt-1" 
          rows="3"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Keywords (comma-separated)</label>
          <input 
            name="keywords" 
            value={form.keywords} 
            onChange={onChange} 
            placeholder="modern, minimalist, textured" 
            className="input mt-1" 
          />
        </div>
        <div>
          <label className="label">Color Palette (comma-separated)</label>
          <input 
            name="colorPalette" 
            value={form.colorPalette} 
            onChange={onChange} 
            placeholder="white, beige, gray" 
            className="input mt-1" 
          />
        </div>
      </div>

      {form.imageUrl && (
        <div>
          <label className="label">Image Preview</label>
          <div className="mt-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
            <img 
              src={form.imageUrl} 
              alt="Preview" 
              className="w-full max-w-xs h-48 object-cover rounded" 
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-theme">
          💾 {initial._id ? 'Update Product' : 'Create Product'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [productCount, setProductCount] = useState("N/A")
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    async function checkAuth() {
      const result = await authUtils.verifyToken();
      
      if (!result.authenticated) {
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    }

    checkAuth();
  }, [router]);

  // Load products
  useEffect(() => {
    if (isAuthenticated) {
      load(page);
    }
  }, [isAuthenticated, page]);

  async function load(pageNum = 1) {
    try {
      const res = await fetch(`/api/products/manage?page=${pageNum}`, { 
        headers: authUtils.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setProductCount(data.total || "N/A")
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }

  async function createItem(values) {
    try {
      const res = await fetch('/api/products/manage', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...authUtils.getAuthHeaders()
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) { 
        setShowForm(false); 
        load(page);
        alert("✓ Product created successfully!");
      } else {
        alert("Failed to create product: " + data.error);
      }
    } catch (error) {
      alert("Error creating product: " + error.message);
    }
  }

  async function updateItem(values) {
    try {
      const res = await fetch(`/api/products/manage?id=${editing._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          ...authUtils.getAuthHeaders()
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) { 
        setEditing(null); 
        setShowForm(false); 
        load(page);
        alert("✓ Product updated successfully!");
      } else {
        alert("Failed to update product: " + data.error);
      }
    } catch (error) {
      alert("Error updating product: " + error.message);
    }
  }

  async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/products/manage?id=${id}`, { 
        method: 'DELETE', 
        headers: authUtils.getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        load(page);
        alert("✓ Product deleted successfully!");
      } else {
        alert("Failed to delete product: " + data.error);
      }
    } catch (error) {
      alert("Error deleting product: " + error.message);
    }
  }

  // Filter items based on search
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.productName?.toLowerCase().includes(query) ||
      item.brandName?.toLowerCase().includes(query) ||
      item.application?.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#2b3a55]">📦 Product Management</h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                ✓ Authenticated
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="text-sm text-[#2b3a55] hover:underline flex items-center gap-1"
              >
                ← Back to Search
              </a>
              <LogoutDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6 border-blue-500 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className=" text-sm">Total Products</p>
                <p className="text-3xl font-bold mt-1">{productCount}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="card p-6 border-purple-500 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className=" text-sm">Current Page</p>
                <p className="text-3xl font-bold mt-1">{page} / {totalPages}</p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>

          <div className="card p-6 border-green-500 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className=" text-sm">Filtered Results</p>
                <p className="text-3xl font-bold mt-1">{filteredItems.length}</p>
              </div>
              <div className="text-4xl">🔍</div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:max-w-md">
            <input
              type="text"
              placeholder="🔍 Search products by name, brand, or application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
            />
          </div>
          <button 
            onClick={() => { setEditing(null); setShowForm(true); }} 
            className="btn-theme whitespace-nowrap"
          >
            ➕ Add New Product
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6 shadow-lg border-2 border-[#2b3a55]">
            <h3 className="text-xl font-bold text-[#2b3a55] mb-4">
              {editing ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>
            <Form
              initial={editing || {}}
              onSave={editing ? updateItem : createItem}
              onCancel={() => { setEditing(null); setShowForm(false); }}
            />
          </div>
        )}

        {/* Products Table */}
        <div className="card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2b3a55] text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">Image</th>
                  <th className="text-left p-4 font-semibold">Product Name</th>
                  <th className="text-left p-4 font-semibold">Brand</th>
                  <th className="text-left p-4 font-semibold">Application</th>
                  <th className="text-left p-4 font-semibold">Colorway</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      {searchQuery ? "No products match your search." : "No products yet. Add your first product!"}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((p) => (
                    <tr key={p._id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <img 
                          src={p.imageUrl} 
                          className="w-16 h-16 object-cover rounded-lg shadow-sm" 
                          alt={p.productName}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E';
                          }}
                        />
                      </td>
                      <td className="p-4 font-medium text-gray-900">{p.productName}</td>
                      <td className="p-4 text-gray-600">{p.brandName || '-'}</td>
                      <td className="p-4">
                        {p.application ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {p.application}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-gray-600">{p.colorwayName || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => { setEditing(p); setShowForm(true); }} 
                            className="px-3 py-1 bg-[#2b3a55] text-white rounded-md hover:opacity-90 transition-all text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => deleteItem(p._id)} 
                            className="px-3 py-1 border-2 border-red-600 rounded-md hover:bg-red-700 hover:text-white transition-all text-xs"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-md transition-all ${
                    page === p 
                      ? 'bg-[#2b3a55] text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}