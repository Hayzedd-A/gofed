"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Search failed");
      sessionStorage.setItem("gofed:results", JSON.stringify(data.products || []));
      window.location.href = "/search";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-16">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[--theme]">GoFed Product Finder</h1>
          <p className="mt-3 text-gray-600">Upload an optional image and enter a few details. We will analyze the image and search our catalog.</p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input mt-1" placeholder="you@example.com" />
          </div>

          <div>
            <label className="label">Project Name</label>
            <input name="projectname" type="text" className="input mt-1" />
          </div>

          <div>
            <label className="label">Sector</label>
            <select name="sector" className="input mt-1">
              <option value="">Select sector</option>
              <option>hospitality</option>
              <option>corporate/workspace</option>
              <option>healthcare</option>
              <option>education</option>
              <option>multi-family</option>
              <option>cruise Line</option>
              <option>senior living</option>
              <option>others</option>
            </select>
          </div>

          <div>
            <label className="label">Budget Tier</label>
            <select name="budgetTier" className="input mt-1">
              <option>budget</option>
              <option>mid</option>
              <option>luxury</option>
            </select>
          </div>

          <div>
            <label className="label">Keywords (comma separated)</label>
            <input name="keywords" type="text" className="input mt-1" placeholder="Minimal, Textural, Cream" />
          </div>

          <div>
            <label className="label">Reference Image (optional)</label>
            <input name="image" type="file" accept="image/*" className="mt-1" />
          </div>

          <button className="btn-theme w-full" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>

          <div className="text-sm text-gray-500">Or manage the catalog in the <Link href="/admin" className="text-[--theme] underline">Admin</Link></div>
        </form>
      </div>
    </main>
  );
}
