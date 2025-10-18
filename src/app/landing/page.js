import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-16">
        <div className="text-center space-y-8">
          <div className="inline-block px-4 py-1 bg-blue-100 text-[#2b3a55] rounded-full text-sm font-medium">
            ✨ Welcome to MOODbrary
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#2b3a55]">
            Find Your Perfect Materials
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the ideal products for your projects with our AI-powered search.
            Upload images, specify your needs, and let us match you with the perfect materials.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-[#2b3a55] mb-2">Visual Search</h3>
              <p className="text-gray-600">Upload images of your inspiration and find matching products instantly.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-[#2b3a55] mb-2">Smart Matching</h3>
              <p className="text-gray-600">Our AI analyzes your requirements and finds the most relevant materials.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-lg font-semibold text-[#2b3a55] mb-2">Save & Organize</h3>
              <p className="text-gray-600">Create project folders and save your favorite products for easy access.</p>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <Link
              href="/search"
              className="inline-block btn-theme text-lg px-8 py-4"
            >
              Start Searching
            </Link>
            <p className="text-sm text-gray-500">
              Already have an account? <a href="/search" className="text-[#2b3a55] hover:underline">Sign in to continue</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
