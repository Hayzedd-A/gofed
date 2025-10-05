"use client";
import { useState, useRef } from "react";
import Link from "next/link";

const SECTORS = [
  "hospitality",
  "corporate/workspace",
  "healthcare",
  "education",
  "multi-family",
  "cruise line",
  "senior living",
  "others",
];

const BUDGET_TIERS = [
  { value: "budget", label: "Budget", icon: "💰" },
  { value: "mid", label: "Mid-Range", icon: "💎" },
  { value: "luxury", label: "Luxury", icon: "✨" },
];

function ImageUpload({ onImageSelect, image, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, zoom: 1 });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-contain"
            style={{
              transform: `scale(${crop.zoom}) translate(${crop.x}px, ${crop.y}px)`,
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCrop((c) => ({ ...c, zoom: Math.min(c.zoom + 0.1, 3) }))
              }
              className="bg-white px-3 py-1 rounded shadow text-sm hover:bg-gray-100"
            >
              🔍+
            </button>
            <button
              type="button"
              onClick={() =>
                setCrop((c) => ({ ...c, zoom: Math.max(c.zoom - 0.1, 0.5) }))
              }
              className="bg-white px-3 py-1 rounded shadow text-sm hover:bg-gray-100"
            >
              🔍-
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setCrop({ x: 0, y: 0, zoom: 1 });
              onRemove();
            }}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
          >
            Remove Image
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Change Image
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging
          ? "border-[#2b3a55] bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <div className="space-y-3">
        <div className="text-5xl">🖼️</div>
        <div>
          <p className="text-sm text-gray-600">
            Drag and drop your image here, or
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-[#2b3a55] text-white rounded-md hover:opacity-90"
          >
            Browse Files
          </button>
        </div>
        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        name="image"
      />
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-faintBg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-[#2b3a55] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-center text-[#2b3a55]">
            Analyzing Your Request
          </h3>
          <p className="text-sm text-gray-600 text-center">
            We're processing your image and searching through thousands of
            products to find the perfect matches...
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              ✓
            </div>
            <span className="text-gray-700">Image uploaded successfully</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-[#2b3a55] rounded-full"></div>
            </div>
            <span className="text-gray-700">
              AI analyzing visual features...
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-50">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              ⋯
            </div>
            <span className="text-gray-700">Matching with catalog...</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 This may take 15-30 seconds depending on image complexity
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [budgetTier, setBudgetTier] = useState("mid");
  const [imageFile, setImageFile] = useState(null);

  const toggleSector = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  async function onSubmit(e) {
    try {
      e.preventDefault();
      setError("");
      setLoading(true);

      const form = e.currentTarget;
      const fd = new FormData(form);
      // append the image if exist
      if (imageFile) fd.append("image", imageFile);

      // Add selected sectors
      fd.delete("sector");
      selectedSectors.forEach((sector) => fd.append("sector", sector));
      fd.set("budgetTier", budgetTier);

      const res = await fetch("/api/products/search", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Search failed");
      sessionStorage.setItem(
        "gofed:results",
        JSON.stringify(data.products || [])
      );
      window.location.href = "/search";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <LoadingOverlay />}

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-16">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 bg-blue-100 text-[#2b3a55] rounded-full text-sm font-medium">
                ✨ AI-Powered Search
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2b3a55]">
                GoFed Product Finder
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Upload an image and enter details about your project. Our AI
                will analyze the visual features and search through our catalog
                to find the perfect products for your needs.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-2">🎨</div>
                  <div className="text-sm font-medium text-gray-700">
                    Visual Search
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-sm font-medium text-gray-700">
                    Fast Results
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-medium text-gray-700">
                    Precise Match
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="card p-8 space-y-6 shadow-lg">
              <div>
                <label className="label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input mt-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="label">Project Name</label>
                <input
                  name="projectname"
                  type="text"
                  className="input mt-2"
                  placeholder="e.g., Hotel Lobby Renovation"
                />
              </div>

              <div>
                <label className="label">Select Sectors (Multiple)</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleSector(sector)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedSectors.includes(sector)
                          ? "bg-[#2b3a55] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
                {selectedSectors.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    {selectedSectors.length} sector
                    {selectedSectors.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              <div>
                <label className="label">Budget Tier</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {BUDGET_TIERS.map((tier) => (
                    <label
                      key={tier.value}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                        budgetTier === tier.value
                          ? "border-[#2b3a55] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="budgetTier"
                        value={tier.value}
                        checked={budgetTier === tier.value}
                        onChange={(e) => setBudgetTier(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl mb-1">{tier.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {tier.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Keywords (comma separated)</label>
                <input
                  name="keywords"
                  type="text"
                  className="input mt-2"
                  placeholder="Minimal, Textural, Cream, Modern"
                />
              </div>

              <div>
                <label className="label">Reference Image (Optional)</label>
                <div className="mt-2">
                  <ImageUpload
                    onImageSelect={setImageFile}
                    image={imageFile}
                    onRemove={() => setImageFile(null)}
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
                  ⚠️ {error}
                </div>
              )}

              <button
                // onClick={onSubmit}
                type="submit"
                className="btn-theme w-full py-3 text-lg"
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Search Products"}
              </button>

              {/* <div className="text-center text-sm text-gray-500 pt-2">
                Need to manage products? Visit the{" "}
                <Link href="/admin" className="text-[#2b3a55] font-medium hover:underline">
                  Admin Dashboard
                </Link>
              </div> */}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
